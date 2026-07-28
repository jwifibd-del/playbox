import { Injectable, Logger, NotFoundException, BadRequestException, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { SchedulerRegistry, Cron, CronExpression } from '@nestjs/schedule';
import { TranscodingProfile, QualityPreset } from './transcoding-profile.entity';
import { TranscodingJob, TranscodingJobStatus, TranscodingStage } from './transcoding-job.entity';
import { CreateTranscodingProfileDto, UpdateTranscodingProfileDto, QueueTranscodeJobDto } from './dto/transcoding.dto';
import { TranscodingEngineService, EngineProgress, TranscodeResult } from './transcoding-engine.service';
import { Video, VideoStatus } from '../videos/video.entity';
import { MediaAssetsService, RegisterAssetInput } from '../media-assets/media-assets.service';
import * as fs from 'fs';
import * as path from 'path';

type RunningJob = {
  jobId: string;
  cancel: { cancelled: boolean };
};

@Injectable()
export class TranscodingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TranscodingService.name);
  private readonly running = new Map<string, RunningJob>();
  private readonly workerId = `worker-${process.pid}-${Date.now().toString(36)}`;
  private busyWorkers = 0;
  private stopTick = false;
  private tickTimer: any;

  constructor(
    @InjectRepository(TranscodingProfile)
    private profilesRepository: Repository<TranscodingProfile>,
    @InjectRepository(TranscodingJob)
    private jobsRepository: Repository<TranscodingJob>,
    @InjectRepository(Video)
    private videosRepository: Repository<Video>,
    private dataSource: DataSource,
    private engine: TranscodingEngineService,
    private mediaAssets: MediaAssetsService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async onModuleInit() {
    try {
      await this.ensureDefaultProfile();
    } catch (e) {
      this.logger.warn(`Could not seed default profile: ${(e as Error).message}`);
    }
    this.tickTimer = setInterval(() => this.tickQueue(), 3000);
    this.stopTick = false;
    this.logger.log(`TranscodingService ready (workerId=${this.workerId})`);
  }

  onModuleDestroy() {
    this.stopTick = true;
    if (this.tickTimer) clearInterval(this.tickTimer);
    for (const [jobId, handle] of Array.from(this.running.entries())) {
      this.logger.log(`Cancelling running job ${jobId} on shutdown`);
      handle.cancel.cancelled = true;
    }
  }

  // ============== PROFILES ==============

  async findAllProfiles(): Promise<TranscodingProfile[]> {
    return this.profilesRepository.find({ order: { isDefault: 'DESC', priority: 'ASC', name: 'ASC' } });
  }

  async findProfile(id: string): Promise<TranscodingProfile> {
    const p = await this.profilesRepository.findOne({ where: { id } });
    if (!p) throw new NotFoundException(`Transcoding profile ${id} not found`);
    return p;
  }

  async getDefaultProfile(): Promise<TranscodingProfile> {
    const def = await this.profilesRepository.findOne({ where: { isDefault: true } });
    if (def) return def;
    return this.ensureDefaultProfile();
  }

  async ensureDefaultProfile(): Promise<TranscodingProfile> {
    const exists = await this.profilesRepository.findOne({ where: [{ isDefault: true }, { name: 'Streaming Default (HLS+DASH)' }] });
    if (exists) return exists;
    const def = this.profilesRepository.create({
      name: 'Streaming Default (HLS+DASH)',
      outputFormat: 'hls+dash',
      codec: 'h264-main',
      presetSpeed: 'medium',
      crf: 23,
      audioCodec: 'aac',
      audioChannels: 2,
      qualities: this.engine.getDefaultQualities('standard'),
      segmentDurationSec: 4,
      keyframeAlignment: true,
      produceThumbnailSprite: true,
      generateSubtitleWebVTT: true,
      twoPass: false,
      hardwareAcceleration: false,
      isDefault: true,
      priority: 0,
      enabled: true,
      autoTriggerMode: 'on-upload',
      retryOnFailure: true,
      maxRetries: 3,
      retryBackoffSeconds: 60,
      maxConcurrentWorkers: 2,
    });
    const saved = await this.profilesRepository.save(def as any);
    return saved as TranscodingProfile;
  }

  async createProfile(dto: CreateTranscodingProfileDto): Promise<TranscodingProfile> {
    if (dto.isDefault) {
      await this.profilesRepository.update({ isDefault: true }, { isDefault: false });
    }
    if (dto.name && dto.name.trim()) {
      const existing = await this.profilesRepository.findOne({ where: { name: dto.name.trim() } });
      if (existing) throw new BadRequestException(`A profile named "${dto.name.trim()}" already exists`);
    }
    const profile = this.profilesRepository.create(dto as any);
    const saved = await this.profilesRepository.save(profile as any);
    return saved as TranscodingProfile;
  }

  async updateProfile(id: string, dto: UpdateTranscodingProfileDto): Promise<TranscodingProfile> {
    const profile = await this.findProfile(id);
    if (dto.isDefault && !profile.isDefault) {
      await this.profilesRepository.update({ isDefault: true }, { isDefault: false });
    }
    if (dto.name && dto.name.trim() && dto.name.trim() !== profile.name) {
      const existing = await this.profilesRepository.createQueryBuilder('p')
        .where('p.name = :name AND p.id != :id', { name: dto.name.trim(), id })
        .getOne();
      if (existing) throw new BadRequestException(`A profile named "${dto.name.trim()}" already exists`);
    }
    const dto2: any = { ...dto };
    if (dto2.name && typeof dto2.name === 'string') dto2.name = dto2.name.trim();
    Object.assign(profile, dto2);
    return this.profilesRepository.save(profile);
  }

  async deleteProfile(id: string): Promise<void> {
    const profile = await this.findProfile(id);
    if (profile.isDefault) {
      throw new BadRequestException('Cannot delete the default profile; assign a new default first');
    }
    await this.profilesRepository.remove(profile);
  }

  // ============== JOBS ==============

  async findAllJobs(status?: TranscodingJobStatus, take = 100): Promise<TranscodingJob[]> {
    const where = status ? { status } : {};
    return this.jobsRepository.find({ where, order: { createdAt: 'DESC' }, take, relations: ['profile', 'video'] });
  }

  async findJob(id: string): Promise<TranscodingJob> {
    const job = await this.jobsRepository.findOne({ where: { id }, relations: ['profile', 'video'] });
    if (!job) throw new NotFoundException(`Transcoding job ${id} not found`);
    return job;
  }

  async findJobsForVideo(videoId: string): Promise<TranscodingJob[]> {
    return this.jobsRepository.find({ where: { videoId }, order: { createdAt: 'DESC' }, take: 20 });
  }

  async queueJob(dto: QueueTranscodeJobDto, triggerSource: 'on-upload' | 'schedule' | 'manual' | 'retry' = 'manual', triggeredByUpload = false): Promise<TranscodingJob> {
    const video = await this.videosRepository.findOne({ where: { id: dto.videoId } });
    if (!video) throw new NotFoundException(`Video ${dto.videoId} not found`);
    if (!video.originalPath || !fs.existsSync(video.originalPath)) {
      throw new BadRequestException(`Video ${dto.videoId} has no uploaded file yet`);
    }
    let profile: TranscodingProfile;
    if (dto.profileId) profile = await this.findProfile(dto.profileId);
    else profile = await this.getDefaultProfile();
    const existingQueued = await this.jobsRepository.findOne({ where: { videoId: video.id, status: In(['queued', 'pending', 'running', 'paused', 'retrying']) } });
    if (existingQueued) return existingQueued;
    const job = this.jobsRepository.create({
      videoId: video.id,
      profileId: profile.id,
      status: 'queued',
      priority: dto.priority ?? profile.priority,
      triggerSource,
      triggeredByUpload,
      queuedAt: new Date(),
      outputArtifacts: {},
    });
    const saved = await this.jobsRepository.save(job);
    this.logger.log(`[QUEUE] Job ${saved.id} queued for video ${video.id} (profile=${profile.name}, source=${triggerSource})`);
    setImmediate(() => this.tickQueue());
    return saved;
  }

  async queueOnUpload(videoId: string): Promise<TranscodingJob | null> {
    const profile = await this.getDefaultProfile();
    if (!profile.enabled || profile.autoTriggerMode !== 'on-upload') return null;
    return this.queueJob({ videoId, profileId: profile.id, priority: profile.priority }, 'on-upload', true);
  }

  async triggerScheduled(profileIdFilter?: string): Promise<{ triggered: number }> {
    const profiles = await this.profilesRepository.find({ where: profileIdFilter ? { id: profileIdFilter, enabled: true, autoTriggerMode: 'schedule-only' } : { enabled: true, autoTriggerMode: 'schedule-only' } });
    if (profiles.length === 0) return { triggered: 0 };
    const videos = await this.videosRepository.createQueryBuilder('v')
      .where(`v.originalPath IS NOT NULL AND v.originalPath != ''`)
      .andWhere(`v.status NOT IN ('processing')`)
      .getMany();
    let triggered = 0;
    for (const v of videos) {
      const transcodedAlready = await this.jobsRepository.findOne({ where: { videoId: v.id, status: 'completed' } });
      if (transcodedAlready) continue;
      const alreadyQueued = await this.jobsRepository.findOne({ where: { videoId: v.id, status: In(['queued', 'pending', 'running', 'retrying']) } });
      if (alreadyQueued) continue;
      const profile = profiles[0];
      try {
        await this.queueJob({ videoId: v.id, profileId: profile.id, priority: profile.priority }, 'schedule', false);
        triggered++;
      } catch (e) {
        this.logger.warn(`Scheduled queue failed for video ${v.id}: ${(e as Error).message}`);
      }
    }
    return { triggered };
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM, { name: 'transcoder-scheduled-run' })
  async scheduledCronJob() {
    try {
      const res = await this.triggerScheduled();
      this.logger.log(`[SCHEDULER] Scheduled transcoding run complete, triggered ${res.triggered} jobs`);
    } catch (e) {
      this.logger.error(`[SCHEDULER] Scheduled run error: ${(e as Error).message}`);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE, { name: 'transcoder-stale-recovery' })
  async staleRecoveryCron() {
    try {
      const staleCutoff = new Date(Date.now() - 10 * 60 * 1000);
      const stale = await this.jobsRepository
        .createQueryBuilder('j')
        .where('j.status IN (:...statuses)', { statuses: ['running'] })
        .andWhere('j.updatedAt < :cutoff', { cutoff: staleCutoff })
        .getMany();
      for (const j of stale) {
        this.logger.warn(`[RECOVERY] Job ${j.id} appears stale; resetting to queued`);
        const profile = j.profileId ? await this.profilesRepository.findOne({ where: { id: j.profileId } }) : null;
        const canRetry = !profile || profile.retryOnFailure === false ? j.retryCount < 1 : j.retryCount < (profile?.maxRetries || 3);
        if (canRetry) {
          j.retryCount += 1;
          j.status = 'queued';
          j.stage = null;
          j.pid = null as any;
          j.workerId = null;
          j.updatedAt = new Date();
          await this.jobsRepository.save(j);
        } else {
          j.status = 'failed';
          j.lastError = 'Aborted: job stuck and max retries reached';
          j.errors = [...(j.errors || []), 'Aborted: job stuck and max retries reached'];
          j.failedAt = new Date();
          await this.jobsRepository.save(j);
          await this.setVideoStatus(j.videoId, 'error');
        }
      }
    } catch (e) {
      this.logger.error(`[RECOVERY] error: ${(e as Error).message}`);
    }
  }

  async cancelJob(id: string): Promise<TranscodingJob> {
    const job = await this.findJob(id);
    if (['completed', 'failed', 'cancelled'].includes(job.status)) return job;
    const active = this.running.get(id);
    if (active) active.cancel.cancelled = true;
    job.status = 'cancelled';
    job.cancelledAt = new Date();
    job.stage = null;
    const saved = await this.jobsRepository.save(job);
    await this.setVideoStatus(job.videoId, 'pending');
    return saved;
  }

  async retryJob(id: string): Promise<TranscodingJob> {
    const job = await this.findJob(id);
    if (!['failed', 'cancelled'].includes(job.status)) {
      throw new BadRequestException(`Job ${id} is in status ${job.status}; retry not allowed`);
    }
    job.status = 'retrying';
    job.retryCount += 1;
    job.progressPercent = 0;
    job.stage = null;
    job.currentQuality = null;
    job.currentOutput = null;
    job.errors = [];
    job.lastError = null;
    job.outputArtifacts = {};
    job.generatedQualities = [];
    job.startedAt = null as any;
    job.completedAt = null as any;
    job.failedAt = null as any;
    job.cancelledAt = null as any;
    job.queuedAt = new Date();
    const saved = await this.jobsRepository.save(job);
    setImmediate(() => this.tickQueue());
    return saved;
  }

  async pauseJob(id: string): Promise<TranscodingJob> {
    const job = await this.findJob(id);
    if (job.status !== 'running') throw new BadRequestException(`Job ${id} not running`);
    job.status = 'paused';
    job.pausedAt = new Date();
    return this.jobsRepository.save(job);
  }

  async resumeJob(id: string): Promise<TranscodingJob> {
    const job = await this.findJob(id);
    if (job.status !== 'paused') throw new BadRequestException(`Job ${id} not paused`);
    job.status = 'queued';
    job.pausedAt = null as any;
    const saved = await this.jobsRepository.save(job);
    setImmediate(() => this.tickQueue());
    return saved;
  }

  async deleteJob(id: string): Promise<void> {
    const job = await this.findJob(id);
    const active = this.running.get(id);
    if (active) active.cancel.cancelled = true;
    await this.jobsRepository.remove(job);
  }

  // ============== QUEUE TICK ==============

  private async tickQueue() {
    if (this.stopTick) return;
    try {
      if (this.busyWorkers < 0) this.busyWorkers = 0;
      const defaultProfile = await this.getDefaultProfile().catch(() => null);
      const concurrencyCap = defaultProfile?.maxConcurrentWorkers || 2;
      while (this.busyWorkers < concurrencyCap) {
        const candidate = await this.pickNextJob();
        if (!candidate) break;
        this.busyWorkers++;
        this.runOne(candidate.id).finally(() => {
          this.busyWorkers = Math.max(0, this.busyWorkers - 1);
          setImmediate(() => this.tickQueue());
        });
      }
    } catch (e) {
      this.logger.error(`Queue tick error: ${(e as Error).message}`);
    }
  }

  private async pickNextJob(): Promise<TranscodingJob | null> {
    return this.jobsRepository
      .createQueryBuilder('j')
      .where('j.status IN (:...statuses)', { statuses: ['queued', 'pending', 'retrying'] })
      .andWhere(`NOT EXISTS (
        SELECT 1 FROM transcoding_job jp
        WHERE jp.videoId = j.videoId AND jp.status = 'running'
      )`)
      .orderBy('j.priority', 'ASC')
      .addOrderBy('j.queuedAt', 'ASC')
      .addOrderBy('j.createdAt', 'ASC')
      .take(1)
      .getOne();
  }

  private async runOne(jobId: string) {
    const cancel = { cancelled: false };
    this.running.set(jobId, { jobId, cancel });
    const startMs = Date.now();
    try {
      let job = await this.jobsRepository.findOne({ where: { id: jobId }, relations: ['profile', 'video'] });
      if (!job || !['queued', 'pending', 'retrying'].includes(job.status)) {
        return;
      }
      if (!job.video) {
        throw new Error(`Job references missing video ${job.videoId}`);
      }
      if (!job.profile) {
        const def = await this.getDefaultProfile();
        job.profileId = def.id;
        job.profile = def;
      }
      if (!job.video.originalPath || !fs.existsSync(job.video.originalPath)) {
        throw new Error(`Original video file missing: ${job.video.originalPath}`);
      }
      job.status = 'running';
      job.workerId = this.workerId;
      job.startedAt = new Date();
      job.progressPercent = 0;
      job.stage = 'analyzing';
      job = await this.jobsRepository.save(job);
      await this.setVideoStatus(job.videoId, 'processing');

      const result = await this.engine.transcodeVideo(
        job.videoId,
        job.video.originalPath,
        job.profile,
        job.video.subtitleTracks || [],
        undefined,
        (p: EngineProgress) => this.updateProgress(job.id, p),
        cancel,
      );

      job = await this.findJob(job.id);
      if (cancel.cancelled || job.status === 'cancelled') {
        this.logger.log(`Job ${jobId} cancelled`);
        return;
      }

      if (result.hlsManifest) job.outputArtifacts.hlsManifest = result.hlsManifest;
      if (result.dashManifest) job.outputArtifacts.dashManifest = result.dashManifest;
      if (result.mp4s) job.outputArtifacts.mp4s = result.mp4s;
      if (result.webms) job.outputArtifacts.webms = result.webms;
      if (result.sprite) job.outputArtifacts.sprite = result.sprite;
      if (result.thumbnails?.length) job.outputArtifacts.thumbnails = result.thumbnails;
      if (result.subtitles) job.outputArtifacts.subtitles = result.subtitles;
      job.generatedQualities = result.qualitiesProduced || [];
      job.bytesTotal = result.totalBytes || 0;
      job.bytesProcessed = result.totalBytes || 0;

      if (result.success) {
        await this.registerAssetsFromResult(job.videoId, result, job.profile);
        job.status = 'completed';
        job.progressPercent = 100;
        job.stage = null;
        job.completedAt = new Date();
        job.wallTimeMs = Date.now() - startMs;
        job.totalDurationMs = (result.probe?.durationSeconds || 0) * 1000;
        await this.updateVideoFromResult(job.videoId, result);
      } else {
        job.status = 'failed';
        job.failedAt = new Date();
        job.errors = Array.from(new Set([...(job.errors || []), ...(result.errors || [])])).slice(0, 50);
        job.lastError = result.errors?.[0] || 'Transcoding failed';
        job.wallTimeMs = Date.now() - startMs;
        const profile = job.profile;
        if (profile?.retryOnFailure && job.retryCount < (profile.maxRetries || 3)) {
          job.status = 'queued';
          job.retryCount += 1;
          job.lastError = `Scheduled retry #${job.retryCount}: ${job.lastError}`;
          this.logger.log(`[RETRY] Job ${job.id} will retry (attempt ${job.retryCount}/${profile.maxRetries})`);
        } else {
          await this.setVideoStatus(job.videoId, 'error');
        }
      }
      await this.jobsRepository.save(job);
    } catch (e) {
      this.logger.error(`Job ${jobId} crashed: ${(e as Error).stack || (e as Error).message}`);
      try {
        const job = await this.jobsRepository.findOne({ where: { id: jobId } });
        if (job) {
          job.status = 'failed';
          job.failedAt = new Date();
          job.lastError = (e as Error).message;
          job.errors = [...(job.errors || []), (e as Error).message].slice(0, 50);
          job.wallTimeMs = Date.now() - startMs;
          const profile = job.profileId ? await this.profilesRepository.findOne({ where: { id: job.profileId } }) : null;
          if (profile?.retryOnFailure && job.retryCount < (profile.maxRetries || 3)) {
            job.status = 'queued';
            job.retryCount += 1;
          } else {
            await this.setVideoStatus(job.videoId, 'error');
          }
          await this.jobsRepository.save(job);
        }
      } catch (_) { /* noop */ }
    } finally {
      this.running.delete(jobId);
    }
  }

  private async updateProgress(jobId: string, p: EngineProgress) {
    try {
      await this.jobsRepository
        .createQueryBuilder()
        .update(TranscodingJob)
        .set({
          progressPercent: Math.round(p.percent),
          stage: (p.stage as any) || undefined,
          fps: Math.round(p.fps),
          speedMbps: Math.round((p.speedMbps || 0) * 100) / 100,
          framesProcessed: Math.trunc(p.framesProcessed || 0),
          bytesProcessed: Math.trunc(p.bytesProcessed || 0),
          currentQuality: p.currentQuality || undefined,
          currentOutput: p.currentOutput || undefined,
        })
        .where('id = :id', { id: jobId })
        .execute();
    } catch {}
  }

  private async registerAssetsFromResult(videoId: string, r: TranscodeResult, profile: TranscodingProfile) {
    const video = await this.videosRepository.findOne({ where: { id: videoId } });
    if (!video) return;
    try {
      await this.mediaAssets.deleteByVideo(videoId);
    } catch (_) {}
    const inputs: RegisterAssetInput[] = [];
    if (r.hlsManifest) inputs.push({ videoId, kind: 'hls-manifest', absolutePath: r.hlsManifest });
    if (r.dashManifest) inputs.push({ videoId, kind: 'dash-manifest', absolutePath: r.dashManifest });
    if (r.sprite) inputs.push({ videoId, kind: 'sprite', absolutePath: r.sprite });
    for (const q of Object.keys(r.mp4s || {})) {
      const abs = (r.mp4s as any)[q];
      if (abs) inputs.push({ videoId, kind: 'transcoded', quality: q as any, absolutePath: abs, container: 'mp4', width: 0, height: 0 });
    }
    for (const q of Object.keys(r.webms || {})) {
      const abs = (r.webms as any)[q];
      if (abs) inputs.push({ videoId, kind: 'transcoded', quality: q as any, absolutePath: abs, container: 'webm' });
    }
    for (const t of r.thumbnails || []) {
      inputs.push({ videoId, kind: 'thumbnail', absolutePath: t });
    }
    for (const lang of Object.keys(r.subtitles || {})) {
      const abs = (r.subtitles as any)[lang];
      if (abs) inputs.push({ videoId, kind: 'subtitle', absolutePath: abs, language: lang });
    }
    const scanned = await this.mediaAssets.registerFromVideo({ ...video, ...{ hlsManifestPath: r.hlsManifest || video.hlsManifestPath, dashManifestPath: r.dashManifest || video.dashManifestPath } } as any);
    const allRegistered: any[] = [];
    for (const i of inputs) {
      try { allRegistered.push(await this.mediaAssets.register(i)); } catch (e) { this.logger.debug(`Asset registration skip: ${(e as Error).message}`); }
    }
    this.logger.log(`[ASSETS] Video ${videoId}: registered ${allRegistered.length} direct + ${scanned.length} scanned`);
  }

  private async updateVideoFromResult(videoId: string, r: TranscodeResult) {
    const video = await this.videosRepository.findOne({ where: { id: videoId } });
    if (!video) return;
    const update: Partial<Video> = {
      status: VideoStatus.READY,
      qualities: r.qualitiesProduced?.length ? r.qualitiesProduced : video.qualities,
      hlsManifestPath: r.hlsManifest || video.hlsManifestPath,
      dashManifestPath: r.dashManifest || video.dashManifestPath,
    };
    if (r.sprite) {
      update.thumbnailPath = r.sprite;
      update.thumbnailUrl = this.derivePublicUrl(r.sprite);
    }
    Object.assign(video, update);
    await this.videosRepository.save(video);
  }

  private async setVideoStatus(videoId: string, status: VideoStatus | 'pending' | 'processing' | 'ready' | 'error') {
    try {
      await this.videosRepository.createQueryBuilder()
        .update(Video)
        .set({ status: status as any })
        .where('id = :id', { id: videoId })
        .execute();
    } catch {}
  }

  private derivePublicUrl(absolutePath: string): string {
    const needles = ['uploads', 'uploads/videos', 'uploads/thumbnails', 'uploads/subtitles', 'uploads/transcoded'];
    for (const needle of needles) {
      const idx = absolutePath.indexOf(needle);
      if (idx !== -1) return `/${absolutePath.slice(idx).split(path.sep).join('/')}`;
    }
    return '';
  }

  // stats / live info
  async getLiveStats() {
    const counts = await this.jobsRepository
      .createQueryBuilder('j')
      .select('j.status', 'status')
      .addSelect('COUNT(*)', 'n')
      .groupBy('j.status')
      .getRawMany();
    const byStatus: Record<string, number> = {};
    for (const c of counts) byStatus[c.status] = parseInt(c.n, 10);
    const workers = await this.jobsRepository.find({
      where: { status: 'running' as any },
      order: { startedAt: 'ASC' },
      take: 10,
      relations: ['video', 'profile'],
    });
    return {
      workerId: this.workerId,
      busyWorkers: this.busyWorkers,
      byStatus,
      runningJobs: workers.map(w => ({
        id: w.id, videoId: w.videoId, videoTitle: (w.video as any)?.title, profileName: (w.profile as any)?.name,
        stage: w.stage, progressPercent: w.progressPercent, speedMbps: w.speedMbps, fps: w.fps,
        currentQuality: w.currentQuality, etaSeconds: w.etaSeconds, startedAt: w.startedAt,
      })),
    };
  }
}
