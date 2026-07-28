import { Injectable, Logger, NotFoundException, BadRequestException, Inject, forwardRef, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { MediaSyncTarget } from './media-sync-target.entity';
import { MediaSyncJob, SyncJobStatus } from './media-sync-job.entity';
import { CreateSyncJobDto, CreateSyncTargetDto, UpdateSyncTargetDto, DEVICE_PLATFORMS } from './dto/media-sync.dto';
import { Video } from '../videos/video.entity';
import { Movie } from '../movies/movie.entity';
import { TVShow } from '../tv-shows/tv-show.entity';
import { Episode } from '../tv-shows/episode.entity';

import { ensureDir } from '../common/multer.config';
import { DevicesService } from '../devices/devices.service';

type CopyPlanItem = {
  id: string;
  label: string;
  kind: 'video' | 'movie' | 'tv' | 'episode' | 'metadata';
  files: { source: string; relativeDest: string; category: 'original' | 'quality' | 'thumbnail' | 'subtitle' | 'manifest' | 'metadata' }[];
};

type NewItemInfo = { kind: 'movie' | 'tv'; id: string; name?: string };

@Injectable()
export class MediaSyncService implements OnModuleInit {
  private readonly logger = new Logger(MediaSyncService.name);
  private runningJobs = new Map<string, { cancel: () => void }>();

  constructor(
    @InjectRepository(MediaSyncTarget)
    private targetsRepository: Repository<MediaSyncTarget>,
    @InjectRepository(MediaSyncJob)
    private jobsRepository: Repository<MediaSyncJob>,
    @InjectRepository(Video)
    private videosRepository: Repository<Video>,
    @InjectRepository(Movie)
    private moviesRepository: Repository<Movie>,
    @InjectRepository(TVShow)
    private tvShowsRepository: Repository<TVShow>,
    @InjectRepository(Episode)
    private episodesRepository: Repository<Episode>,
    @Inject(forwardRef(() => DevicesService))
    private devicesService: DevicesService,
  ) {}

  onModuleInit() {
    this.logger.log(`MediaSync ready. Device target types: ${DEVICE_PLATFORMS.join(', ')}`);
  }

  // --- Targets ---

  async findAllTargets(): Promise<MediaSyncTarget[]> {
    const targets = await this.targetsRepository.find();
    return Promise.all(targets.map(t => this.refreshTargetStats(t)));
  }

  async findTarget(id: string): Promise<MediaSyncTarget> {
    const target = await this.targetsRepository.findOne({ where: { id } });
    if (!target) throw new NotFoundException(`Sync target ${id} not found`);
    return this.refreshTargetStats(target);
  }

  async createTarget(dto: CreateSyncTargetDto): Promise<MediaSyncTarget> {
    const target = this.targetsRepository.create({
      ...dto,
      path: dto.path ?? '',
      qualities: dto.qualities || ['4K', '1080p', '720p', '480p'],
      autoSyncMediaTypes: dto.autoSyncMediaTypes || [],
    });
    const saved = await this.targetsRepository.save(target);
    return this.refreshTargetStats(saved);
  }

  async updateTarget(id: string, dto: UpdateSyncTargetDto): Promise<MediaSyncTarget> {
    const target = await this.findTarget(id);
    for (const k of Object.keys(dto)) {
      (target as any)[k] = (dto as any)[k];
    }
    const saved = await this.targetsRepository.save(target);
    return this.refreshTargetStats(saved);
  }

  async deleteTarget(id: string): Promise<void> {
    const target = await this.findTarget(id);
    await this.targetsRepository.remove(target);
  }

  async testTarget(id: string): Promise<{ ok: boolean; message: string; writable: boolean; freeBytes: number; totalBytes: number }> {
    const target = await this.findTarget(id);
    return this.doTestTarget(target);
  }

  // --- Jobs ---

  async findAllJobs(status?: SyncJobStatus): Promise<MediaSyncJob[]> {
    if (status) {
      return this.jobsRepository.find({
        where: { status },
        order: { createdAt: 'DESC' },
        relations: ['target'],
      });
    }
    return this.jobsRepository.find({
      order: { createdAt: 'DESC' },
      take: 100,
      relations: ['target'],
    });
  }

  async findJob(id: string): Promise<MediaSyncJob> {
    const job = await this.jobsRepository.findOne({ where: { id }, relations: ['target'] });
    if (!job) throw new NotFoundException(`Sync job ${id} not found`);
    return job;
  }

  async createJob(dto: CreateSyncJobDto): Promise<MediaSyncJob> {
    let targetId = dto.targetId;
    if (!targetId && dto.deviceId) {
      const existing = await this.targetsRepository.findOne({ where: { deviceId: dto.deviceId } });
      if (existing) {
        targetId = existing.id;
      } else {
        const device = await (this.devicesService as any).findOne(dto.deviceId);
        if (!device) throw new BadRequestException(`Device ${dto.deviceId} not found`);
        const created = await this.createTarget({
          name: `${device.name || 'Device'} (${device.platform})`,
          deviceId: device.id,
          userId: device.userId,
          type: device.platform === 'web-pwa' ? 'local-folder' : (device.platform as any),
          path: '',
          defaultDirection: 'backup',
          defaultMode: 'copy',
          includeQualities: true,
          qualities: device.preferredQualities?.length ? device.preferredQualities : undefined,
          includeSubtitles: device.includeSubtitles,
          includeThumbnails: true,
          includeOriginal: true,
          includeMetadata: true,
          enabled: true,
        });
        targetId = created.id;
      }
    }
    if (!targetId) throw new BadRequestException('Must provide targetId or deviceId');
    const target = await this.findTarget(targetId);

    const { videoIds, movieIds, tvShowIds, episodeIds } = await this.expandIds(dto);
    if (videoIds.length + movieIds.length + tvShowIds.length + episodeIds.length === 0) {
      throw new BadRequestException('No media to sync (expandIds resolved to nothing)');
    }

    const job = this.jobsRepository.create({
      targetId: target.id,
      deviceId: dto.deviceId,
      platform: dto.platform,
      videoIds,
      movieIds,
      tvShowIds,
      episodeIds,
      direction: dto.direction || target.defaultDirection,
      mode: dto.mode || target.defaultMode,
      qualities: dto.qualities || target.qualities,
      includeSubtitles: dto.includeSubtitles ?? target.includeSubtitles,
      includeThumbnails: dto.includeThumbnails ?? target.includeThumbnails,
      includeOriginal: dto.includeOriginal ?? target.includeOriginal,
      includeMetadata: dto.includeMetadata ?? target.includeMetadata,
      verifyAfterCopy: dto.verifyAfterCopy ?? true,
      deleteSourceAfter: dto.deleteSourceAfter ?? false,
      status: 'queued',
    });
    return this.jobsRepository.save(job);
  }

  async startJob(id: string): Promise<MediaSyncJob> {
    const job = await this.findJob(id);
    if (this.runningJobs.has(id)) throw new BadRequestException(`Job ${id} already running`);
    const target = job.target || (job.targetId ? await this.findTarget(job.targetId) : null);
    if (!target) throw new BadRequestException(`Job ${id} has no target`);

    const isDeviceTarget = DEVICE_PLATFORMS.includes(target.type as any);
    if (!isDeviceTarget) {
      const test = await this.doTestTarget(target);
      if (!test.ok || !test.writable) {
        job.status = 'failed';
        job.errors = [`Target unavailable: ${test.message}`];
        job.completedAt = new Date();
        return this.jobsRepository.save(job);
      }
    }

    const plan = await this.buildCopyPlan(job, target);
    let bytesTotal = 0;
    for (const item of plan) {
      for (const f of item.files) {
        try { bytesTotal += f.source && fs.existsSync(f.source) ? fs.statSync(f.source).size : 0; } catch {}
      }
    }
    job.itemsTotal = plan.reduce((acc, i) => acc + i.files.length, 0);
    job.bytesTotal = bytesTotal;
    job.status = 'running';
    job.startedAt = new Date();
    const saved = await this.jobsRepository.save(job);

    const cancelToken = { cancelled: false };
    this.runningJobs.set(id, { cancel: () => (cancelToken.cancelled = true) });
    this.runJob(saved, target, plan, cancelToken).catch(err => {
      this.logger.error(`Sync job ${id} error:`, err);
    });
    if (job.deviceId) {
      this.devicesService.setSyncState(job.deviceId, 'syncing').catch(err => this.logger.warn('setSyncState error', err));
    }
    return saved;
  }

  async cancelJob(id: string): Promise<MediaSyncJob> {
    const job = await this.findJob(id);
    const handle = this.runningJobs.get(id);
    if (handle) handle.cancel();
    job.status = 'cancelled';
    job.completedAt = new Date();
    const saved = await this.jobsRepository.save(job);
    if (job.deviceId) this.devicesService.setSyncState(job.deviceId, 'idle').catch(() => {});
    return saved;
  }

  async pauseJob(id: string): Promise<MediaSyncJob> {
    const job = await this.findJob(id);
    const handle = this.runningJobs.get(id);
    if (handle) handle.cancel();
    job.status = 'paused';
    job.pausedAt = new Date();
    const saved = await this.jobsRepository.save(job);
    if (job.deviceId) this.devicesService.setSyncState(job.deviceId, 'idle').catch(() => {});
    return saved;
  }

  async retryJob(id: string): Promise<MediaSyncJob> {
    const job = await this.findJob(id);
    job.status = 'queued';
    job.errors = [];
    job.warnings = [];
    job.itemsProcessed = 0;
    job.itemsFailed = 0;
    job.itemsSkipped = 0;
    job.bytesTransferred = 0;
    job.retryCount += 1;
    (job as any).completedAt = null;
    (job as any).startedAt = null;
    return this.jobsRepository.save(job);
  }

  async deleteJob(id: string): Promise<void> {
    const job = await this.findJob(id);
    const handle = this.runningJobs.get(id);
    if (handle) handle.cancel();
    await this.jobsRepository.remove(job);
  }

  // --- Auto-sync API: used by MoviesService + TVShowsService create() methods

  async onMediaCreated(info: NewItemInfo): Promise<void> {
    try {
      const devices = await this.devicesService.findAutoSyncTargets(info.kind);
      for (const device of devices) {
        try {
          const dto: CreateSyncJobDto = { deviceId: device.id, platform: device.platform as any };
          if (info.kind === 'movie') dto.movieIds = [info.id];
          if (info.kind === 'tv') dto.tvShowIds = [info.id];
          if (device.preferredQualities?.length) dto.qualities = device.preferredQualities;
          dto.includeSubtitles = device.includeSubtitles;
          dto.includeMetadata = true;
          const job = await this.createJob(dto);
          this.logger.log(`Auto-sync job ${job.id} queued for device ${device.id} (${device.name}) new ${info.kind} ${info.id}`);
          try { await this.startJob(job.id); } catch (err) {
            this.logger.warn(`Auto-sync start failed (kept queued): ${(err as Error).message}`);
          }
        } catch (err) {
          this.logger.error(`Auto-sync for device ${device.id} failed:`, err);
        }
      }
    } catch (err) {
      this.logger.error(`Auto-sync hook failed for ${info.kind} ${info.id}:`, err);
    }
  }

  // --- Internals ---

  private async expandIds(dto: CreateSyncJobDto) {
    let videoIds = [...(dto.videoIds || [])];
    const movieIds = [...(dto.movieIds || [])];
    const tvShowIds = [...(dto.tvShowIds || [])];
    const episodeIds = [...(dto.episodeIds || [])];

    if (movieIds.length) {
      const vids = await this.videosRepository.find({ where: { movieId: In(movieIds) }, select: ['id'] });
      videoIds = videoIds.concat(vids.map(v => v.id));
    }
    if (episodeIds.length) {
      const vids = await this.videosRepository.find({ where: { episodeId: In(episodeIds) }, select: ['id'] });
      videoIds = videoIds.concat(vids.map(v => v.id));
    }
    if (tvShowIds.length) {
      const eps = await this.episodesRepository.find({ where: { tvShowId: In(tvShowIds) }, select: ['id'] });
      const epIds = eps.map(e => e.id);
      if (epIds.length) {
        const vids = await this.videosRepository.find({ where: { episodeId: In(epIds) }, select: ['id'] });
        videoIds = videoIds.concat(vids.map(v => v.id));
      }
    }
    return {
      videoIds: Array.from(new Set(videoIds)),
      movieIds,
      tvShowIds,
      episodeIds,
    };
  }

  private async refreshTargetStats(target: MediaSyncTarget): Promise<MediaSyncTarget> {
    const isDevice = DEVICE_PLATFORMS.includes(target.type as any);
    if (isDevice) {
      if (target.deviceId) {
        try {
          const d = await this.devicesService.findOne(target.deviceId);
          target.isConnected = d.connectionState !== 'offline';
          target.lastSeenAt = d.lastSeenAt || target.lastSeenAt;
          target.totalBytes = Number(d.totalBytes) || 0;
          target.freeBytes = Number(d.freeBytes) || 0;
          target.usedBytes = Number(d.usedBytes) || 0;
          return this.targetsRepository.save(target);
        } catch { /* device gone */ }
      }
      return target;
    }
    if (target.type === 'local-folder' || target.type === 'external-drive' || target.type === 'network-share') {
      try {
        if (!target.path) { target.isConnected = false; return target; }
        ensureDir(target.path);
        const stat = fs.statSync(target.path);
        target.isConnected = !!stat;
        target.totalBytes = 0;
        target.freeBytes = 0;
        target.lastSeenAt = new Date();
        try { target.filesystem = stat.isDirectory() ? 'directory' : 'unknown'; } catch {}
        return this.targetsRepository.save(target);
      } catch (err) {
        target.isConnected = false;
        return target;
      }
    }
    return target;
  }

  private doTestTarget(target: MediaSyncTarget): Promise<{ ok: boolean; message: string; writable: boolean; freeBytes: number; totalBytes: number }> {
    const isDevice = DEVICE_PLATFORMS.includes(target.type as any);
    if (isDevice) {
      return Promise.resolve({ ok: true, message: `Device target ${target.type} (delegated to pull-by-device offline manifest)`, writable: true, freeBytes: Number(target.freeBytes) || 0, totalBytes: Number(target.totalBytes) || 0 });
    }
    if (target.type === 'local-folder' || target.type === 'external-drive' || target.type === 'network-share') {
      try {
        if (!target.path) return Promise.resolve({ ok: false, message: 'No path', writable: false, freeBytes: 0, totalBytes: 0 });
        ensureDir(target.path);
        const probe = path.join(target.path, `.playflix-write-test-${Date.now()}.tmp`);
        fs.writeFileSync(probe, 'playflix');
        fs.unlinkSync(probe);
        return Promise.resolve({ ok: true, message: `${target.type} path ready`, writable: true, freeBytes: 0, totalBytes: 0 });
      } catch (err) {
        return Promise.resolve({ ok: false, message: (err as Error).message, writable: false, freeBytes: 0, totalBytes: 0 });
      }
    }
    return Promise.resolve({ ok: true, message: 'Cloud target (skipping probe)', writable: true, freeBytes: 0, totalBytes: 0 });
  }

  private async buildCopyPlan(job: MediaSyncJob, target: MediaSyncTarget): Promise<CopyPlanItem[]> {
    const plan: CopyPlanItem[] = [];
    const isDevice = DEVICE_PLATFORMS.includes(target.type as any);

    if (job.movieIds?.length) {
      const movies = await this.moviesRepository.findByIds ? await this.moviesRepository.find({ where: { id: In(job.movieIds) }, relations: ['genres'] }) : [];
      for (const m of movies) {
        const files: CopyPlanItem['files'] = [];
        if (job.includeMetadata) {
          const metaRelDest = `metadata/movies/${m.id}.json`;
          files.push({ source: '', relativeDest: metaRelDest, category: 'metadata' });
          (files as any)[files.length - 1]._jsonBlob = JSON.stringify(this.stripMeta(m), null, 2);
        }
        if (job.includeThumbnails && (m as any).posterPath) {
          const posterSrc = this.resolveUploadPath((m as any).posterPath);
          if (posterSrc && fs.existsSync(posterSrc)) {
            files.push({ source: posterSrc, relativeDest: `metadata/movies/${m.id}/poster${path.extname(posterSrc)}`, category: 'thumbnail' });
          }
          const bd = this.resolveUploadPath((m as any).backdropPath);
          if (bd && fs.existsSync(bd)) {
            files.push({ source: bd, relativeDest: `metadata/movies/${m.id}/backdrop${path.extname(bd)}`, category: 'thumbnail' });
          }
        }
        plan.push({ id: m.id, label: m.title, kind: 'movie', files });
      }
    }
    if (job.tvShowIds?.length) {
      const shows = await this.tvShowsRepository.find({ where: { id: In(job.tvShowIds) }, relations: ['genres'] });
      for (const s of shows) {
        const files: CopyPlanItem['files'] = [];
        if (job.includeMetadata) {
          const rel = `metadata/tvshows/${s.id}.json`;
          files.push({ source: '', relativeDest: rel, category: 'metadata' });
          (files as any)[files.length - 1]._jsonBlob = JSON.stringify(this.stripMeta(s), null, 2);
        }
        plan.push({ id: s.id, label: s.title, kind: 'tv', files });
      }
    }
    if (job.episodeIds?.length) {
      const eps = await this.episodesRepository.find({ where: { id: In(job.episodeIds) } });
      for (const ep of eps) {
        const files: CopyPlanItem['files'] = [];
        if (job.includeMetadata) {
          const rel = `metadata/episodes/${ep.id}.json`;
          files.push({ source: '', relativeDest: rel, category: 'metadata' });
          (files as any)[files.length - 1]._jsonBlob = JSON.stringify(this.stripMeta(ep), null, 2);
        }
        plan.push({ id: ep.id, label: `${(ep as any).title || ep.id}`, kind: 'episode', files });
      }
    }
    const vids = job.videoIds?.length ? await this.videosRepository.find({ where: { id: In(job.videoIds) } }) : [];
    for (const video of vids) {
      const files: CopyPlanItem['files'] = [];
      if (job.includeOriginal && video.originalPath && fs.existsSync(video.originalPath)) {
        files.push({ source: video.originalPath, relativeDest: path.posix.join('originals', `${video.id}${path.extname(video.originalPath)}`), category: 'original' });
      }
      if (job.includeThumbnails && video.thumbnailPath && fs.existsSync(video.thumbnailPath)) {
        files.push({ source: video.thumbnailPath, relativeDest: path.posix.join('thumbnails', `${video.id}${path.extname(video.thumbnailPath)}`), category: 'thumbnail' });
      }
      if (job.includeSubtitles && Array.isArray(video.subtitleTracks)) {
        for (const raw of video.subtitleTracks) {
          if (!raw) continue;
          const [_lang, subPath] = String(raw).split('|');
          if (subPath && fs.existsSync(subPath)) {
            files.push({ source: subPath, relativeDest: path.posix.join('subtitles', `${video.id}-${path.basename(subPath)}`), category: 'subtitle' });
          }
        }
      }
      if (job.qualities && job.qualities.length > 0) {
        const qualities = (video.qualities || []).filter(q => job.qualities!.includes(q));
        const candidateDirs: string[] = [];
        if (video.hlsManifestPath) candidateDirs.push(path.dirname(video.hlsManifestPath));
        if (video.dashManifestPath) candidateDirs.push(path.dirname(video.dashManifestPath));
        const processedRoot = path.resolve(process.cwd(), 'uploads', 'transcoded', video.id);
        candidateDirs.push(processedRoot);
        const seen = new Set<string>();
        for (const dir of candidateDirs) {
          if (!dir || seen.has(dir) || !fs.existsSync(dir)) continue;
          seen.add(dir);
          this.collectFilesRecursive(dir, (absPath, rel) => {
            const file = path.basename(absPath).toLowerCase();
            const matchesQuality = qualities.length === 0 || qualities.some(q => file.includes(q.toLowerCase()));
            const isManifest = file.endsWith('.m3u8') || file.endsWith('.mpd');
            const isSegment = file.endsWith('.ts') || file.endsWith('.m4s') || file.endsWith('.mp4');
            if (matchesQuality || isManifest || isSegment) {
              files.push({ source: absPath, relativeDest: path.posix.join('resolutions', video.id, rel), category: isManifest ? 'manifest' : 'quality' });
            }
          });
        }
      }
      plan.push({ id: video.id, label: video.title, kind: 'video', files });
    }
    void isDevice;
    return plan;
  }

  private collectFilesRecursive(dir: string, emit: (abs: string, rel: string) => void, root = dir): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(root, full).split(path.sep).join('/');
      if (entry.isDirectory()) {
        this.collectFilesRecursive(full, emit, root);
      } else if (entry.isFile()) {
        emit(full, rel);
      }
    }
  }

  private async runJob(job: MediaSyncJob, target: MediaSyncTarget, plan: CopyPlanItem[], cancelToken: { cancelled: boolean }): Promise<void> {
    const startedAt = Date.now();
    let bytesTransferred = 0;
    let itemsProcessed = 0;
    let itemsFailed = 0;
    let itemsSkipped = 0;
    const errors: string[] = [];
    const warnings: string[] = [];
    const bandwidthBps = job.direction === 'backup' && target.maxBandwidthMbps > 0 ? target.maxBandwidthMbps * 1_000_000 / 8 : 0;
    const isDeviceTarget = DEVICE_PLATFORMS.includes(target.type as any);

    try {
      for (const item of plan) {
        for (const file of item.files) {
          if (cancelToken.cancelled) throw new Error('Cancelled');
          try {
            let destPath = '';
            let destDir = '';
            if (!isDeviceTarget) {
              destPath = path.join(target.path, file.relativeDest);
              destDir = path.dirname(destPath);
              ensureDir(destDir);
            } else {
              destDir = path.join(process.cwd(), 'uploads', 'devices', target.id || 'unknown');
              ensureDir(destDir);
              destPath = path.join(destDir, file.relativeDest);
              ensureDir(path.dirname(destPath));
            }

            if (file.category === 'metadata' && !(file as any).source && (file as any)._jsonBlob) {
              fs.writeFileSync(destPath, (file as any)._jsonBlob, 'utf8');
              bytesTransferred += Buffer.byteLength((file as any)._jsonBlob, 'utf8');
              itemsProcessed++;
            } else {
              if (!fs.existsSync(file.source)) { itemsSkipped++; itemsProcessed++; continue; }
              const sourceStat = fs.statSync(file.source);
              let shouldCopy = true;
              if (fs.existsSync(destPath)) {
                const destStat = fs.statSync(destPath);
                if (job.mode === 'mirror' && destStat.size === sourceStat.size && destStat.mtimeMs >= sourceStat.mtimeMs) {
                  shouldCopy = false;
                } else if (destStat.size === sourceStat.size && job.verifyAfterCopy) {
                  try {
                    if (this.hashFile(file.source) !== this.hashFile(destPath)) shouldCopy = true;
                  } catch { shouldCopy = true; }
                  if (!shouldCopy) { itemsSkipped++; itemsProcessed++; continue; }
                }
              }
              if (shouldCopy) {
                await this.copyWithThrottle(file.source, destPath, sourceStat.size, bandwidthBps, cancelToken);
                bytesTransferred += sourceStat.size;
                if (job.verifyAfterCopy && file.category !== 'metadata') {
                  const srcHash = this.hashFile(file.source);
                  const dstHash = this.hashFile(destPath);
                  if (srcHash !== dstHash) throw new Error(`Hash mismatch for ${path.basename(file.source)}`);
                }
                if (job.mode === 'move' && job.deleteSourceAfter) {
                  try { fs.unlinkSync(file.source); } catch (e) { warnings.push(`Failed to remove source ${file.source}: ${(e as Error).message}`); }
                }
                itemsProcessed++;
              } else {
                itemsSkipped++;
                itemsProcessed++;
              }
            }
          } catch (err) {
            itemsFailed++;
            errors.push(`${item.id || item.kind}: ${(err as Error).message}`);
          }
          const now = Date.now();
          const elapsedSec = Math.max(0.001, (now - startedAt) / 1000);
          const speedBps = bytesTransferred / elapsedSec;
          const remaining = Math.max(0, (job.bytesTotal || 0) - bytesTransferred);
          const etaSeconds = speedBps > 0 ? remaining / speedBps : 0;
          await this.jobsRepository.update(job.id, {
            itemsProcessed, itemsFailed, itemsSkipped, bytesTransferred,
            speedMbps: +((speedBps * 8) / 1_000_000).toFixed(2),
            etaSeconds: Math.round(etaSeconds),
            errors: errors.slice(-50), warnings: warnings.slice(-50),
            status: cancelToken.cancelled ? 'cancelled' : 'running',
          } as any);
        }
      }
      if (cancelToken.cancelled) {
        await this.jobsRepository.update(job.id, { status: 'cancelled', completedAt: new Date() });
      } else {
        await this.jobsRepository.update(job.id, {
          status: errors.length > 0 && itemsProcessed === itemsFailed ? 'failed' : 'completed',
          completedAt: new Date(), itemsProcessed, itemsFailed, itemsSkipped, bytesTransferred,
          errors: errors.slice(-100), warnings: warnings.slice(-100),
        });
      }
      if (job.deviceId) {
        this.devicesService.setSyncState(job.deviceId, 'idle', new Date()).catch(() => {});
      }
    } catch (err) {
      errors.push(`Fatal: ${(err as Error).message}`);
      await this.jobsRepository.update(job.id, {
        status: cancelToken.cancelled ? 'cancelled' : 'failed',
        completedAt: new Date(), errors: errors.slice(-100), warnings: warnings.slice(-100),
        itemsProcessed, itemsFailed, itemsSkipped, bytesTransferred,
      });
      if (job.deviceId) this.devicesService.setSyncState(job.deviceId, 'error').catch(() => {});
    } finally {
      this.runningJobs.delete(job.id);
    }
  }

  private hashFile(filePath: string): string {
    const hash = crypto.createHash('sha256');
    const fd = fs.openSync(filePath, 'r');
    try {
      const buf = Buffer.alloc(1024 * 1024);
      let bytesRead = 0;
      while ((bytesRead = fs.readSync(fd, buf, 0, buf.length, null)) > 0) {
        hash.update(buf.subarray(0, bytesRead));
      }
    } finally {
      fs.closeSync(fd);
    }
    return hash.digest('hex');
  }

  private async copyWithThrottle(src: string, dst: string, size: number, bytesPerSecondCap: number, cancelToken: { cancelled: boolean }): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const chunkSize = bytesPerSecondCap > 0 ? Math.min(4 * 1024 * 1024, Math.max(64 * 1024, Math.floor(bytesPerSecondCap / 8))) : 8 * 1024 * 1024;
      const reader = fs.createReadStream(src, { highWaterMark: chunkSize });
      const writer = fs.createWriteStream(dst);
      let copied = 0;
      let tickBytes = 0;
      let tickStart = Date.now();

      const cleanup = () => { reader.removeAllListeners(); writer.removeAllListeners(); reader.destroy(); writer.destroy(); };
      reader.on('error', (err) => { cleanup(); reject(err); });
      writer.on('error', (err) => { cleanup(); reject(err); });
      writer.on('finish', () => { cleanup(); resolve(); });
      reader.on('data', (chunk: Buffer) => {
        if (cancelToken.cancelled) { cleanup(); return reject(new Error('Cancelled')); }
        copied += chunk.length;
        tickBytes += chunk.length;
        if (bytesPerSecondCap > 0) {
          const elapsed = (Date.now() - tickStart) / 1000;
          const expected = tickBytes / bytesPerSecondCap;
          if (expected > elapsed) {
            const sleepMs = Math.max(0, Math.min(1000, Math.round((expected - elapsed) * 1000)));
            reader.pause();
            setTimeout(() => { tickStart = Date.now(); tickBytes = 0; reader.resume(); }, sleepMs);
          }
        }
        const ok = writer.write(chunk);
        if (!ok) reader.pause();
        void copied; void size;
      });
      writer.on('drain', () => reader.resume());
      reader.on('end', () => writer.end());
    });
  }

  private resolveUploadPath(p: string): string | undefined {
    if (!p) return undefined;
    if (fs.existsSync(p)) return p;
    if (p.startsWith('/uploads/')) return path.resolve(process.cwd(), p.substring(1));
    if (p.startsWith('http')) return undefined;
    const c1 = path.resolve(process.cwd(), 'uploads', p.startsWith('/') ? p.substring(1) : p);
    if (fs.existsSync(c1)) return c1;
    return undefined;
  }

  private stripMeta(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    const skip = new Set(['createdAt', 'updatedAt', 'deletedAt', 'cache_key', 'genres']);
    const out: any = {};
    for (const k of Object.keys(obj)) {
      if (skip.has(k)) continue;
      const v = (obj as any)[k];
      if (v && k === 'genres' && Array.isArray(v)) {
        out.genres = v.map(g => ({ id: g.id, name: g.name, tmdbId: g.tmdbId }));
      } else if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || v === null || v === undefined) {
        out[k] = v;
      } else if (Array.isArray(v) && v.every(x => typeof x === 'string' || typeof x === 'number' || typeof x === 'boolean')) {
        out[k] = v;
      }
    }
    return out;
  }
}
