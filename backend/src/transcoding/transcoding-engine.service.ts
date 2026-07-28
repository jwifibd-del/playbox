import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { TranscodingProfile, QualityPreset } from './transcoding-profile.entity';
import { UPLOADS_TRANSCODED_DIR, ensureDir } from '../common/multer.config';

export type MediaProbeResult = {
  durationSeconds: number;
  width: number;
  height: number;
  videoBitrateKbps: number;
  audioBitrateKbps: number;
  totalBitrateKbps: number;
  videoCodec: string;
  audioCodec: string;
  fps: number;
  sizeBytes: number;
  hasAudio: boolean;
  hasVideo: boolean;
  audioChannels: number;
  audioSampleRate: number;
  pixelFormat: string;
};

export type QualityWorkItem = {
  label: string;
  width: number;
  height: number;
  videoBitrateKbps: number;
  audioBitrateKbps: number;
  fps: number;
  videoCodec: string;
  audioCodec: string;
};

export type EngineProgress = {
  stage:
    | 'analyzing'
    | 'extracting-thumbnails'
    | 'transcoding-video'
    | 'transcoding-audio'
    | 'packaging-hls'
    | 'packaging-dash'
    | 'generating-sprite'
    | 'converting-subtitles'
    | 'finalizing';
  percent: number;
  fps: number;
  speedMbps: number;
  framesProcessed: number;
  bytesProcessed: number;
  currentQuality?: string;
  currentOutput?: string;
  etaSeconds?: number;
};

export type TranscodeResult = {
  success: boolean;
  hlsManifest?: string;
  dashManifest?: string;
  mp4s: Record<string, string>;
  webms: Record<string, string>;
  sprite?: string;
  thumbnails: string[];
  subtitles: Record<string, string>;
  qualitiesProduced: string[];
  probe?: MediaProbeResult;
  errors: string[];
  outputDir: string;
  totalBytes: number;
};

type PidHandle = { pid?: number };

const STANDARD_PRESETS: Record<string, QualityPreset[]> = {
  full: [
    { label: '2160p', width: 3840, height: 2160, videoBitrateKbps: 40000, audioBitrateKbps: 320, fps: 60 },
    { label: '1440p', width: 2560, height: 1440, videoBitrateKbps: 20000, audioBitrateKbps: 256, fps: 60 },
    { label: '1080p', width: 1920, height: 1080, videoBitrateKbps: 8000, audioBitrateKbps: 192, fps: 30 },
    { label: '720p', width: 1280, height: 720, videoBitrateKbps: 4000, audioBitrateKbps: 160, fps: 30 },
    { label: '576p', width: 1024, height: 576, videoBitrateKbps: 2000, audioBitrateKbps: 128, fps: 25 },
    { label: '480p', width: 854, height: 480, videoBitrateKbps: 1200, audioBitrateKbps: 96, fps: 25 },
    { label: '360p', width: 640, height: 360, videoBitrateKbps: 700, audioBitrateKbps: 96, fps: 25 },
  ],
  standard: [
    { label: '1080p', width: 1920, height: 1080, videoBitrateKbps: 8000, audioBitrateKbps: 192, fps: 30 },
    { label: '720p', width: 1280, height: 720, videoBitrateKbps: 4000, audioBitrateKbps: 160, fps: 30 },
    { label: '480p', width: 854, height: 480, videoBitrateKbps: 1200, audioBitrateKbps: 96, fps: 25 },
  ],
  mobile: [
    { label: '720p', width: 1280, height: 720, videoBitrateKbps: 3000, audioBitrateKbps: 128, fps: 30 },
    { label: '480p', width: 854, height: 480, videoBitrateKbps: 1000, audioBitrateKbps: 96, fps: 25 },
    { label: '360p', width: 640, height: 360, videoBitrateKbps: 600, audioBitrateKbps: 64, fps: 25 },
  ],
};

@Injectable()
export class TranscodingEngineService {
  private readonly logger = new Logger(TranscodingEngineService.name);

  constructor() {}

  getDefaultQualities(name: 'full' | 'standard' | 'mobile' = 'standard'): QualityPreset[] {
    return STANDARD_PRESETS[name] || STANDARD_PRESETS.standard;
  }

  async probeMedia(inputPath: string): Promise<MediaProbeResult> {
    if (!fs.existsSync(inputPath)) {
      throw new BadRequestException(`Input file does not exist: ${inputPath}`);
    }
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) return reject(err);
        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
        const durationSeconds = parseFloat(String(metadata.format?.duration || '0'));
        const totalBitrateKbps = Math.round(parseFloat(String(metadata.format?.bit_rate || '0')) / 1000);
        const sizeBytes = parseInt(String(metadata.format?.size || '0'), 10) || fs.statSync(inputPath).size;
        const width = videoStream?.width || 0;
        const height = videoStream?.height || 0;
        let fps = 30;
        if (videoStream?.r_frame_rate && videoStream.r_frame_rate.includes('/')) {
          const [n, d] = videoStream.r_frame_rate.split('/').map(Number);
          if (n && d) fps = Math.round(n / d);
        }
        const videoBitrateKbps = videoStream?.bit_rate
          ? Math.round(parseFloat(videoStream.bit_rate) / 1000)
          : Math.max(0, totalBitrateKbps - (audioStream ? 160 : 0));
        const audioBitrateKbps = audioStream?.bit_rate
          ? Math.round(parseFloat(audioStream.bit_rate) / 1000)
          : 160;
        resolve({
          durationSeconds,
          width,
          height,
          videoBitrateKbps,
          audioBitrateKbps,
          totalBitrateKbps,
          videoCodec: videoStream?.codec_name || 'unknown',
          audioCodec: audioStream?.codec_name || 'none',
          fps,
          sizeBytes,
          hasVideo: !!videoStream,
          hasAudio: !!audioStream,
          audioChannels: audioStream?.channels || 0,
          audioSampleRate: audioStream?.sample_rate ? parseInt(String(audioStream.sample_rate), 10) : 0,
          pixelFormat: videoStream?.pix_fmt || 'unknown',
        });
      });
    });
  }

  buildWorkItems(profile: TranscodingProfile, probe: MediaProbeResult, overrideQualities?: string[]): QualityWorkItem[] {
    const preset = profile.codec;
    const qualitiesIn = (profile.qualities && profile.qualities.length > 0 ? profile.qualities : this.getDefaultQualities('standard'));
    let qualities = qualitiesIn;
    if (overrideQualities && overrideQualities.length > 0) {
      qualities = qualities.filter(q => overrideQualities.includes(q.label));
      if (qualities.length === 0) qualities = qualitiesIn;
    }
    const srcAspect = probe.width > 0 && probe.height > 0 ? probe.width / probe.height : 16 / 9;
    const items: QualityWorkItem[] = [];
    for (const q of qualities) {
      if (q.label === 'original') {
        if (probe.width > 0 && probe.height > 0) {
          items.push({
            label: 'original',
            width: probe.width,
            height: probe.height,
            videoBitrateKbps: probe.videoBitrateKbps > 0 ? probe.videoBitrateKbps : q.videoBitrateKbps,
            audioBitrateKbps: probe.audioBitrateKbps > 0 ? probe.audioBitrateKbps : q.audioBitrateKbps,
            fps: probe.fps > 0 ? probe.fps : q.fps,
            videoCodec: this.videoCodecFor(preset),
            audioCodec: this.audioCodecFor(profile.audioCodec),
          });
        }
        continue;
      }
      if (probe.height > 0 && q.height > probe.height) {
        continue;
      }
      let targetW = q.width;
      let targetH = q.height;
      targetH = Math.min(targetH, probe.height || targetH);
      targetW = Math.round(targetH * srcAspect);
      if (targetW % 2 !== 0) targetW -= 1;
      if (targetH % 2 !== 0) targetH -= 1;
      if (targetW <= 0 || targetH <= 0) continue;
      items.push({
        label: q.label,
        width: targetW,
        height: targetH,
        videoBitrateKbps: q.videoBitrateKbps,
        audioBitrateKbps: q.audioBitrateKbps,
        fps: q.fps,
        videoCodec: this.videoCodecFor(preset),
        audioCodec: this.audioCodecFor(profile.audioCodec),
      });
    }
    if (items.length === 0) {
      items.push({
        label: '1080p',
        width: Math.min(1920, probe.width || 1920),
        height: Math.min(1080, probe.height || 1080),
        videoBitrateKbps: 6000,
        audioBitrateKbps: 160,
        fps: 30,
        videoCodec: 'libx264',
        audioCodec: 'aac',
      });
    }
    return items;
  }

  async transcodeVideo(
    videoId: string,
    inputPath: string,
    profile: TranscodingProfile,
    subtitleTracks: string[] = [],
    qualityOverride?: string[],
    onProgress?: (p: EngineProgress) => void,
    cancelToken?: { cancelled: boolean },
  ): Promise<TranscodeResult> {
    const result: TranscodeResult = {
      success: false,
      mp4s: {},
      webms: {},
      thumbnails: [],
      subtitles: {},
      qualitiesProduced: [],
      errors: [],
      outputDir: path.join(UPLOADS_TRANSCODED_DIR, videoId),
      totalBytes: 0,
    };
    const outDir = result.outputDir;
    ensureDir(outDir);

    try {
      if (!fs.existsSync(inputPath)) {
        throw new Error(`Input not found: ${inputPath}`);
      }
      const probe = await this.probeMedia(inputPath);
      result.probe = probe;
      if (!probe.hasVideo) throw new Error('No video stream found');
      onProgress?.({ stage: 'analyzing', percent: 2, fps: 0, speedMbps: 0, framesProcessed: 0, bytesProcessed: 0 });

      const workItems = this.buildWorkItems(profile, probe, qualityOverride);
      result.qualitiesProduced = workItems.map(w => w.label);

      const format = profile.outputFormat;
      const produceHls = format === 'hls' || format === 'hls+dash';
      const produceDash = format === 'dash' || format === 'hls+dash';
      const produceMp4 = format === 'mp4';
      const produceWebm = format === 'webm';

      const totalSteps =
        (produceHls ? 1 : 0) +
        (produceDash ? 1 : 0) +
        (produceMp4 ? workItems.length : 0) +
        (produceWebm ? workItems.length : 0) +
        (profile.produceThumbnailSprite ? 1 : 0) +
        (profile.generateSubtitleWebVTT && subtitleTracks.length ? 1 : 0) +
        2;
      let stepIdx = 0;
      const bumpStep = () => {
        stepIdx++;
        const base = Math.round((stepIdx / totalSteps) * 100);
        return base;
      };

      if (profile.produceThumbnailSprite) {
        onProgress?.({ stage: 'extracting-thumbnails', percent: bumpStep(), fps: 0, speedMbps: 0, framesProcessed: 0, bytesProcessed: 0 });
        try {
          const spr = await this.generateThumbnailSprite(videoId, inputPath, probe, cancelToken);
          if (spr.sprite) result.sprite = spr.sprite;
          result.thumbnails = spr.thumbnails || [];
        } catch (e) {
          result.errors.push(`Thumbnail sprite failed: ${(e as Error).message}`);
        }
      }

      if (profile.generateSubtitleWebVTT && subtitleTracks.length > 0) {
        onProgress?.({ stage: 'converting-subtitles', percent: bumpStep(), fps: 0, speedMbps: 0, framesProcessed: 0, bytesProcessed: 0 });
        try {
          const subs = await this.convertSubtitles(videoId, subtitleTracks);
          result.subtitles = subs;
        } catch (e) {
          result.errors.push(`Subtitle conversion failed: ${(e as Error).message}`);
        }
      }

      const startPercent = bumpStep();

      if (produceHls) {
        onProgress?.({ stage: 'packaging-hls', percent: startPercent, fps: 0, speedMbps: 0, framesProcessed: 0, bytesProcessed: 0, currentQuality: workItems[0]?.label });
        const pidH: PidHandle = {};
        try {
          const manifest = await this.buildHLS(
            inputPath, outDir, workItems, profile, probe,
            (p) => {
              const blended = Math.round(startPercent + (p.percent / 100) * (95 - startPercent) * 0.5);
              onProgress?.({ stage: 'packaging-hls', percent: blended, fps: p.fps, speedMbps: p.speedMbps, framesProcessed: p.framesProcessed, bytesProcessed: p.bytesProcessed, currentQuality: p.currentQuality });
            },
            cancelToken, pidH,
          );
          result.hlsManifest = manifest;
        } catch (e) {
          result.errors.push(`HLS failed: ${(e as Error).message}`);
        }
      }

      if (produceDash) {
        onProgress?.({ stage: 'packaging-dash', percent: 60, fps: 0, speedMbps: 0, framesProcessed: 0, bytesProcessed: 0, currentQuality: workItems[0]?.label });
        const pidD: PidHandle = {};
        try {
          const manifest = await this.buildDASH(
            inputPath, outDir, workItems, profile, probe,
            (p) => {
              const blended = Math.round(60 + (p.percent / 100) * 35);
              onProgress?.({ stage: 'packaging-dash', percent: blended, fps: p.fps, speedMbps: p.speedMbps, framesProcessed: p.framesProcessed, bytesProcessed: p.bytesProcessed, currentQuality: p.currentQuality });
            },
            cancelToken, pidD,
          );
          result.dashManifest = manifest;
        } catch (e) {
          result.errors.push(`DASH failed: ${(e as Error).message}`);
        }
      }

      if (produceMp4) {
        onProgress?.({ stage: 'transcoding-video', percent: 50, fps: 0, speedMbps: 0, framesProcessed: 0, bytesProcessed: 0 });
        for (let i = 0; i < workItems.length; i++) {
          const q = workItems[i];
          const mp4Dir = path.join(outDir, 'mp4');
          ensureDir(mp4Dir);
          const outPath = path.join(mp4Dir, `${q.label}.mp4`);
          const baseP = 50 + Math.round((i / workItems.length) * 40);
          onProgress?.({ stage: 'transcoding-video', percent: baseP, fps: 0, speedMbps: 0, framesProcessed: 0, bytesProcessed: 0, currentQuality: q.label, currentOutput: outPath });
          const pidM: PidHandle = {};
          try {
            await this.transcodeToMP4(inputPath, outPath, q, profile, probe, (p) => {
              const blended = Math.round(baseP + (p.percent / 100) * (40 / workItems.length));
              onProgress?.({ stage: 'transcoding-video', percent: blended, fps: p.fps, speedMbps: p.speedMbps, framesProcessed: p.framesProcessed, bytesProcessed: p.bytesProcessed, currentQuality: q.label, currentOutput: outPath });
            }, cancelToken, pidM);
            result.mp4s[q.label] = outPath;
          } catch (e) {
            result.errors.push(`MP4 ${q.label} failed: ${(e as Error).message}`);
          }
        }
      }

      if (produceWebm) {
        for (let i = 0; i < workItems.length; i++) {
          const q = workItems[i];
          const webmDir = path.join(outDir, 'webm');
          ensureDir(webmDir);
          const outPath = path.join(webmDir, `${q.label}.webm`);
          const pidW: PidHandle = {};
          try {
            await this.transcodeToWebM(inputPath, outPath, q, profile, probe, () => {}, cancelToken, pidW);
            result.webms[q.label] = outPath;
          } catch (e) {
            result.errors.push(`WebM ${q.label} failed: ${(e as Error).message}`);
          }
        }
      }

      result.totalBytes = this.calculateDirSize(outDir);
      onProgress?.({ stage: 'finalizing', percent: 98, fps: 0, speedMbps: 0, framesProcessed: 0, bytesProcessed: result.totalBytes });
      result.success =
        !!(result.hlsManifest || result.dashManifest || Object.keys(result.mp4s).length > 0 || Object.keys(result.webms).length > 0);
      if (result.errors.length > 0 && !result.success) {
        throw new Error(result.errors[0]);
      }
      return result;
    } catch (err) {
      this.logger.error(`Transcode engine error for ${videoId}:`, err);
      result.errors.unshift((err as Error).message);
      result.success = false;
      return result;
    }
  }

  private async buildHLS(
    input: string,
    outDir: string,
    items: QualityWorkItem[],
    profile: TranscodingProfile,
    probe: MediaProbeResult,
    onProgress: (p: { percent: number; fps: number; speedMbps: number; framesProcessed: number; bytesProcessed: number; currentQuality?: string }) => void,
    cancelToken?: { cancelled: boolean },
    pidHandle?: PidHandle,
  ): Promise<string> {
    const hlsDir = path.join(outDir, 'hls');
    ensureDir(hlsDir);
    const master = path.join(hlsDir, 'master.m3u8');
    return new Promise((resolve, reject) => {
      const duration = profile.segmentDurationSec || 4;
      let cmd = ffmpeg(input);
      if (cancelToken) {
        (cmd as any)._events = (cmd as any)._events || {};
      }
      items.forEach((q, idx) => {
        const vbr = `${q.videoBitrateKbps}k`;
        const abr = `${q.audioBitrateKbps}k`;
        const buf = `${q.videoBitrateKbps * 2}k`;
        const scale = q.width > 0 && q.height > 0 ? `scale=${q.width}:${q.height}:flags=lanczos` : 'copy';
        const vf = scale === 'copy' ? undefined : `${scale},format=yuv420p`;
        const variantName = `${q.label}`;
        cmd = cmd
          .output(path.join(hlsDir, `${variantName}.m3u8`))
          .videoCodec(q.videoCodec)
          .audioCodec(q.audioCodec)
          .outputOptions([
            `-preset ${profile.presetSpeed || 'medium'}`,
            `-crf ${profile.crf ?? 23}`,
            `-maxrate ${vbr}`,
            `-bufsize ${buf}`,
            `-b:a ${abr}`,
            `-ac ${profile.audioChannels || 2}`,
            `-r ${Math.min(q.fps || 30, probe.fps || 60)}`,
            `-g ${Math.round((q.fps || 30) * duration)}`,
            `-keyint_min ${Math.round((q.fps || 30) * duration)}`,
            `-sc_threshold 0`,
            `-hls_time ${duration}`,
            `-hls_list_size 0`,
            `-hls_playlist_type vod`,
            `-hls_segment_filename ${path.join(hlsDir, variantName + '_%03d.ts')}`,
            `-hls_flags independent_segments`,
            `-var_stream_map v:${idx},a:${idx}`,
            `-master_pl_name master.m3u8`,
          ]);
        if (vf) cmd = cmd.outputOption(`-vf ${vf}`);
      });
      const started = Date.now();
      cmd
        .on('start', (commandLine) => {
          this.logger.log(`[HLS] ${commandLine}`);
        })
        .on('progress', (progress) => {
          if (cancelToken?.cancelled) {
            try { (cmd as any)._killCalled = true; cmd.kill('SIGTERM'); } catch {}
            reject(new Error('Cancelled'));
            return;
          }
          const pct = Math.max(0, Math.min(100, Number(progress.percent ?? 0)));
          const fps = Number(progress.currentFps ?? 0);
          let speedMbps = 0;
          const m = /([\d.]+)x/.exec(String((progress as any).speed || ''));
          if (m && probe.totalBitrateKbps > 0) {
            speedMbps = (parseFloat(m[1]) * probe.totalBitrateKbps) / 1000;
          }
          const frames = parseInt(String(progress.frames || '0'), 10);
          const elapsedSec = (Date.now() - started) / 1000;
          const bytes = Math.round((probe.totalBitrateKbps * 1000 / 8) * (pct / 100) * Math.max(1, elapsedSec / Math.max(1, probe.durationSeconds)));
          onProgress({ percent: pct, fps, speedMbps, framesProcessed: frames, bytesProcessed: bytes, currentQuality: items[Math.min(items.length - 1, Math.floor((pct / 100) * items.length))]?.label });
        })
        .on('error', (err, stdout, stderr) => {
          this.logger.error(`[HLS] error: ${err?.message}\n${stderr}`);
          if (fs.existsSync(master)) resolve(master);
          else reject(err);
        })
        .on('end', () => {
          const finalMaster = path.join(hlsDir, 'master.m3u8');
          if (!fs.existsSync(finalMaster)) {
            this.writeMasterPlaylist(items, hlsDir);
          }
          resolve(finalMaster);
        })
        .run();
    });
  }

  private writeMasterPlaylist(items: QualityWorkItem[], hlsDir: string) {
    const lines: string[] = ['#EXTM3U', '#EXT-X-VERSION:4'];
    for (const q of items) {
      const bandwidth = (q.videoBitrateKbps + q.audioBitrateKbps) * 1000;
      lines.push(`#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${q.width}x${q.height},CODECS="avc1.4d001f,mp4a.40.2"`);
      lines.push(`${q.label}.m3u8`);
    }
    fs.writeFileSync(path.join(hlsDir, 'master.m3u8'), lines.join('\n'));
  }

  private async buildDASH(
    input: string,
    outDir: string,
    items: QualityWorkItem[],
    profile: TranscodingProfile,
    probe: MediaProbeResult,
    onProgress: (p: { percent: number; fps: number; speedMbps: number; framesProcessed: number; bytesProcessed: number; currentQuality?: string }) => void,
    cancelToken?: { cancelled: boolean },
    pidHandle?: PidHandle,
  ): Promise<string> {
    const dashDir = path.join(outDir, 'dash');
    ensureDir(dashDir);
    const manifest = path.join(dashDir, 'manifest.mpd');
    return new Promise((resolve, reject) => {
      const duration = profile.segmentDurationSec || 4;
      let cmd = ffmpeg(input);
      const maxHeight = Math.max(...items.map(i => i.height));
      const maxWidth = Math.max(...items.map(i => i.width));
      const vcodec = items[0]?.videoCodec || 'libx264';
      const acodec = items[0]?.audioCodec || 'aac';
      const maxVideoBitrate = Math.max(...items.map(i => i.videoBitrateKbps));
      const maxAudioBitrate = Math.max(...items.map(i => i.audioBitrateKbps));
      let adaptationSets = `id=0,streams=v id=1,streams=a`;
      cmd = cmd
        .videoCodec(vcodec)
        .audioCodec(acodec)
        .outputOptions([
          `-preset ${profile.presetSpeed || 'medium'}`,
          `-crf ${profile.crf ?? 23}`,
          `-f dash`,
          `-seg_duration ${duration}`,
          `-use_template 1`,
          `-use_timeline 1`,
          `-window_size 0`,
          `-init_seg_name init-\$RepresentationID\$.m4s`,
          `-media_seg_name chunk-\$RepresentationID\$-\$Number%05d\$.m4s`,
          `-dash_segment_type mp4`,
          `-adaptation_sets "${adaptationSets}"`,
          `-b:v ${maxVideoBitrate}k`,
          `-b:a ${maxAudioBitrate}k`,
          `-vf scale=${maxWidth}:${maxHeight}:flags=lanczos`,
        ])
        .output(manifest);
      const started = Date.now();
      cmd
        .on('start', (commandLine) => {
          this.logger.log(`[DASH] ${commandLine}`);
        })
        .on('progress', (progress) => {
          if (cancelToken?.cancelled) {
            try { cmd.kill('SIGTERM'); } catch {}
            reject(new Error('Cancelled'));
            return;
          }
          const pct = Math.max(0, Math.min(100, Number(progress.percent ?? 0)));
          const fps = Number(progress.currentFps ?? 0);
          let speedMbps = 0;
          const m = /([\d.]+)x/.exec(String((progress as any).speed || ''));
          if (m && probe.totalBitrateKbps > 0) speedMbps = (parseFloat(m[1]) * probe.totalBitrateKbps) / 1000;
          const frames = parseInt(String(progress.frames || '0'), 10);
          const elapsedSec = (Date.now() - started) / 1000;
          const bytes = Math.round((probe.totalBitrateKbps * 1000 / 8) * (pct / 100) * Math.max(1, elapsedSec / Math.max(1, probe.durationSeconds)));
          onProgress({ percent: pct, fps, speedMbps, framesProcessed: frames, bytesProcessed: bytes, currentQuality: items[0]?.label });
        })
        .on('error', (err, stdout, stderr) => {
          this.logger.error(`[DASH] error: ${err?.message}\n${stderr}`);
          if (fs.existsSync(manifest)) resolve(manifest);
          else reject(err);
        })
        .on('end', () => resolve(manifest))
        .run();
    });
  }

  private async transcodeToMP4(
    input: string, outPath: string, q: QualityWorkItem,
    profile: TranscodingProfile, probe: MediaProbeResult,
    onProgress: (p: { percent: number; fps: number; speedMbps: number; framesProcessed: number; bytesProcessed: number }) => void,
    cancelToken?: { cancelled: boolean }, pidHandle?: PidHandle,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const vbr = `${q.videoBitrateKbps}k`;
      const buf = `${q.videoBitrateKbps * 2}k`;
      const abr = `${q.audioBitrateKbps}k`;
      let cmd = ffmpeg(input)
        .videoCodec(q.videoCodec)
        .audioCodec(q.audioCodec)
        .outputOptions([
          `-preset ${profile.presetSpeed || 'medium'}`,
          `-crf ${profile.crf ?? 23}`,
          `-maxrate ${vbr}`,
          `-bufsize ${buf}`,
          `-b:a ${abr}`,
          `-ac ${profile.audioChannels || 2}`,
          `-movflags +faststart`,
          `-pix_fmt yuv420p`,
        ]);
      if (q.width > 0 && q.height > 0) cmd = cmd.outputOption(`-vf scale=${q.width}:${q.height}:flags=lanczos`);
      if (q.fps) cmd = cmd.outputOption(`-r ${Math.min(q.fps, probe.fps || 60)}`);
      cmd = cmd.output(outPath);
      const started = Date.now();
      cmd
        .on('start', (cl) => this.logger.debug(`[MP4] ${cl}`))
        .on('progress', (progress) => {
          if (cancelToken?.cancelled) { try { cmd.kill('SIGTERM'); } catch {}; reject(new Error('Cancelled')); return; }
          const pct = Math.max(0, Math.min(100, Number(progress.percent ?? 0)));
          const fps = Number(progress.currentFps ?? 0);
          let speedMbps = 0;
          const m = /([\d.]+)x/.exec(String((progress as any).speed || ''));
          if (m && probe.totalBitrateKbps > 0) speedMbps = (parseFloat(m[1]) * probe.totalBitrateKbps) / 1000;
          const frames = parseInt(String(progress.frames || '0'), 10);
          const elapsedSec = (Date.now() - started) / 1000;
          const bytes = Math.round((probe.totalBitrateKbps * 1000 / 8) * (pct / 100) * Math.max(1, elapsedSec / Math.max(1, probe.durationSeconds)));
          onProgress({ percent: pct, fps, speedMbps, framesProcessed: frames, bytesProcessed: bytes });
        })
        .on('error', (err, stdout, stderr) => {
          this.logger.error(`[MP4] error: ${err?.message}\n${stderr}`);
          reject(err);
        })
        .on('end', () => resolve())
        .run();
    });
  }

  private async transcodeToWebM(
    input: string, outPath: string, q: QualityWorkItem, profile: TranscodingProfile, probe: MediaProbeResult,
    onProgress: any, cancelToken?: { cancelled: boolean }, pidHandle?: PidHandle,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let cmd = ffmpeg(input)
        .videoCodec('libvpx-vp9')
        .audioCodec('libopus')
        .outputOptions([
          `-crf ${profile.crf ?? 30}`,
          `-b:v ${q.videoBitrateKbps}k`,
          `-b:a ${q.audioBitrateKbps}k`,
          `-ac 2`,
          `-row-mt 1`,
          `-deadline good`,
          `-cpu-used 2`,
        ]);
      if (q.width > 0 && q.height > 0) cmd = cmd.outputOption(`-vf scale=${q.width}:${q.height}`);
      cmd.output(outPath)
        .on('error', (err) => reject(err))
        .on('end', () => resolve())
        .run();
    });
  }

  async generateThumbnailSprite(
    videoId: string, input: string, probe: MediaProbeResult, cancelToken?: { cancelled: boolean },
  ): Promise<{ sprite?: string; thumbnails: string[] }> {
    const outDir = path.join(UPLOADS_TRANSCODED_DIR, videoId, 'thumbs');
    ensureDir(outDir);
    const thumbnails: string[] = [];
    const count = Math.max(6, Math.min(48, Math.round(probe.durationSeconds / 10)));
    const interval = probe.durationSeconds / count;
    const thumbs: string[] = [];
    for (let i = 0; i < count; i++) {
      thumbs.push(path.join(outDir, `thumb_${String(i).padStart(3, '0')}.jpg`));
    }
    const tileCols = Math.ceil(Math.sqrt(count));
    const tileRows = Math.ceil(count / tileCols);
    const spritePath = path.join(outDir, 'sprite.jpg');
    const vttPath = path.join(outDir, 'sprite.vtt');
    try {
      await Promise.all(
        thumbs.map((out, idx) => new Promise<void>((resolve, reject) => {
          const ss = Math.min(probe.durationSeconds - 0.5, Math.max(0.1, idx * interval));
          ffmpeg(input)
            .seekInput(ss)
            .frames(1)
            .outputOptions(['-q:v 3', '-vf scale=320:-1'])
            .output(out)
            .on('end', () => { thumbnails.push(out); resolve(); })
            .on('error', (e) => { this.logger.warn(`Thumb ${idx} failed: ${e.message}`); resolve(); })
            .run();
        })),
      );
      if (thumbnails.length > 0) {
        await new Promise<void>((resolve, reject) => {
          let filter = '';
          const sorted = thumbnails.slice(0, tileCols * tileRows).sort();
          sorted.forEach((p, i) => { filter += `[${i}:v]`; });
          filter += `xstack=inputs=${sorted.length}:layout=${this.tileLayout(tileCols, tileRows)}[v]`;
          const args = sorted.flatMap(p => ['-i', p]).concat(['-filter_complex', filter, '-map', '[v]', '-q:v 3', spritePath]);
          const proc = require('child_process').spawn(require('fluent-ffmpeg').ffmpeg_path || 'ffmpeg', args, { stdio: 'pipe' });
          proc.on('close', (code: number) => code === 0 ? resolve() : resolve());
        });
        if (fs.existsSync(spritePath)) {
          this.writeSpriteVtt(vttPath, probe, tileCols, tileRows, spritePath);
        }
      }
      return { sprite: fs.existsSync(spritePath) ? spritePath : undefined, thumbnails };
    } catch (e) {
      this.logger.warn(`Sprite generation failed: ${(e as Error).message}`);
      return { thumbnails };
    }
  }

  private writeSpriteVtt(vttPath: string, probe: MediaProbeResult, cols: number, rows: number, spritePath: string) {
    const count = cols * rows;
    const dur = probe.durationSeconds;
    const img = this.probeImageSync(spritePath);
    const cellW = Math.floor((img.width || 1920) / cols);
    const cellH = Math.floor((img.height || 1080) / rows);
    const lines = ['WEBVTT', ''];
    const imgName = path.basename(spritePath);
    for (let i = 0; i < count; i++) {
      const start = (i * dur) / count;
      const end = ((i + 1) * dur) / count;
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = col * cellW;
      const y = row * cellH;
      lines.push(`${this.fmtTime(start)} --> ${this.fmtTime(end)}`);
      lines.push(`${imgName}#xywh=${x},${y},${cellW},${cellH}`);
      lines.push('');
    }
    fs.writeFileSync(vttPath, lines.join('\n'));
  }

  private fmtTime(sec: number): string {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = (sec % 60).toFixed(3);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(6, '0')}`;
  }

  private probeImageSync(p: string): { width: number; height: number } {
    try {
      const data = fs.readFileSync(p);
      if (data.length >= 24 && data[0] === 0xff && data[1] === 0xd8) {
        let i = 2;
        while (i < data.length) {
          if (data[i] !== 0xff) break;
          const marker = data[i + 1];
          if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
            const h = data.readUInt16BE(i + 5);
            const w = data.readUInt16BE(i + 7);
            return { width: w, height: h };
          }
          const len = data.readUInt16BE(i + 2);
          i += 2 + len;
        }
      }
    } catch {}
    return { width: 1920, height: 1080 };
  }

  private tileLayout(cols: number, rows: number): string {
    const items: string[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        items.push(`${c > 0 ? `w${c === 1 ? 0 : c - 1}_` : ''}${r > 0 ? `h${r === 1 ? 0 : r - 1}_` : ''}${c === 0 && r === 0 ? '0' : (c === 0 ? '0' + (r > 0 ? `+H${r}` : '') : (r === 0 ? `W${c}` : `w${c - 1}_${r > 1 ? 'h' + (r - 2) + '_' : ''}+W${c}+H${r}`))}`);
      }
    }
    return items.join('|');
  }

  private async convertSubtitles(videoId: string, tracks: string[]): Promise<Record<string, string>> {
    const outDir = path.join(UPLOADS_TRANSCODED_DIR, videoId, 'subs');
    ensureDir(outDir);
    const result: Record<string, string> = {};
    for (const raw of tracks) {
      const [lang, filePath, label] = String(raw).split('|');
      if (!filePath || !fs.existsSync(filePath)) continue;
      const ext = path.extname(filePath).toLowerCase();
      const outPath = path.join(outDir, `${lang || 'en'}.vtt`);
      if (ext === '.vtt') {
        fs.copyFileSync(filePath, outPath);
        result[lang || 'en'] = outPath;
      } else if (ext === '.srt') {
        try {
          const srt = fs.readFileSync(filePath, 'utf8');
          const vtt = this.srtToVtt(srt);
          fs.writeFileSync(outPath, vtt);
          result[lang || 'en'] = outPath;
        } catch (e) {
          this.logger.warn(`SRT->VTT conversion failed for ${filePath}: ${(e as Error).message}`);
        }
      }
    }
    return result;
  }

  private srtToVtt(srt: string): string {
    const lines = srt.replace(/\r/g, '').split('\n');
    const out = ['WEBVTT', ''];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      if (/^\d+$/.test(line)) { i++; continue; }
      if (line.includes('-->')) {
        out.push(line.replace(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/g, '$1:$2:$3.$4'));
      } else if (line !== '') {
        out.push(line);
      } else if (out[out.length - 1] !== '') {
        out.push('');
      }
      i++;
    }
    return out.join('\n') + '\n';
  }

  private videoCodecFor(preset: string): string {
    switch (preset) {
      case 'h264-fast':
      case 'h264-slow':
      case 'h264-main':
        return 'libx264';
      case 'h265-fast':
      case 'h265-slow':
        return 'libx265';
      case 'av1':
        return 'libsvtav1';
      case 'vp9':
        return 'libvpx-vp9';
      case 'copy':
        return 'copy';
      default:
        return 'libx264';
    }
  }

  private audioCodecFor(c: string): string {
    switch (c) {
      case 'aac': return 'aac';
      case 'opus': return 'libopus';
      case 'copy': return 'copy';
      case 'mp3': return 'libmp3lame';
      case 'ac3': return 'ac3';
      default: return 'aac';
    }
  }

  calculateDirSize(dir: string): number {
    try {
      let total = 0;
      const walk = (d: string) => {
        const entries = fs.readdirSync(d, { withFileTypes: true });
        for (const e of entries) {
          const full = path.join(d, e.name);
          if (e.isDirectory()) walk(full);
          else if (e.isFile()) {
            try { total += fs.statSync(full).size; } catch {}
          }
        }
      };
      if (fs.existsSync(dir)) walk(dir);
      return total;
    } catch {
      return 0;
    }
  }

  makeId(): string {
    return `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  }
}
