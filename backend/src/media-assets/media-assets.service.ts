import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { MediaAsset, QualityLabel, MediaAssetKind } from './media-asset.entity';
import { Video } from '../videos/video.entity';
import { ensureDir, UPLOADS_TRANSCODED_DIR } from '../common/multer.config';

export type RegisterAssetInput = {
  videoId: string;
  kind: MediaAssetKind;
  quality?: QualityLabel | null;
  container?: string | null;
  storage?: 'local' | 's3' | 'r2' | 'network';
  absolutePath: string;
  relativePath?: string;
  publicUrl?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  bitrateKbps?: number;
  durationSeconds?: number;
  codecVideo?: string;
  codecAudio?: string;
  language?: string;
  bandwidthBps?: number;
  trackLabel?: string;
  computeChecksum?: boolean;
};

const EXT_TO_CONTAINER: Record<string, any> = {
  '.mp4': 'mp4', '.mkv': 'mkv', '.webm': 'webm', '.mov': 'mov',
  '.ts': 'ts', '.m4s': 'm4s', '.m3u8': 'm3u8', '.mpd': 'mpd',
  '.vtt': 'vtt', '.srt': 'srt', '.jpg': 'jpg', '.jpeg': 'jpg',
  '.png': 'png', '.webp': 'webp',
};

@Injectable()
export class MediaAssetsService {
  private readonly logger = new Logger(MediaAssetsService.name);

  constructor(
    @InjectRepository(MediaAsset)
    private assetsRepository: Repository<MediaAsset>,
    @InjectRepository(Video)
    private videosRepository: Repository<Video>,
  ) {}

  async register(input: RegisterAssetInput): Promise<MediaAsset> {
    const video = await this.videosRepository.findOne({ where: { id: input.videoId } });
    if (!video) throw new NotFoundException(`Video ${input.videoId} not found`);
    const ext = path.extname(input.absolutePath).toLowerCase();
    const container = (input.container as any) || EXT_TO_CONTAINER[ext] || null;
    const category: any =
      ['jpg', 'png', 'webp'].includes(container) ? 'image'
        : ['vtt', 'srt'].includes(container) ? 'text'
          : input.kind.startsWith('audio') ? 'audio' : 'video';
    let sizeBytes = input.sizeBytes || 0;
    let checksumSha256: string | null = null;
    if (fs.existsSync(input.absolutePath)) {
      try {
        sizeBytes = sizeBytes || fs.statSync(input.absolutePath).size;
      } catch {}
      if (input.computeChecksum) {
        try {
          checksumSha256 = this.hashFile(input.absolutePath);
        } catch {}
      }
    }
    const publicUrl = input.publicUrl || this.derivePublicUrl(input.absolutePath, input.relativePath);
    const asset = this.assetsRepository.create({
      videoId: video.id,
      kind: input.kind,
      quality: input.quality || null,
      container,
      storage: input.storage || 'local',
      category,
      absolutePath: input.absolutePath,
      relativePath: input.relativePath || null,
      publicUrl,
      sizeBytes,
      width: input.width || 0,
      height: input.height || 0,
      bitrateKbps: input.bitrateKbps || 0,
      durationSeconds: input.durationSeconds || 0,
      codecVideo: input.codecVideo || null,
      codecAudio: input.codecAudio || null,
      language: input.language || null,
      bandwidthBps: input.bandwidthBps || 0,
      trackLabel: input.trackLabel || null,
      checksumSha256,
    });
    return this.assetsRepository.save(asset);
  }

  async findByVideo(videoId: string, kind?: MediaAssetKind): Promise<MediaAsset[]> {
    return this.assetsRepository.find({
      where: kind ? { videoId, kind } : { videoId },
      order: { createdAt: 'ASC' },
    });
  }

  async findForStreaming(videoId: string): Promise<{
    originals: MediaAsset[];
    transcoded: Record<string, MediaAsset[]>;
    hlsManifest?: MediaAsset;
    dashManifest?: MediaAsset;
    qualities: QualityLabel[];
    subtitles: MediaAsset[];
    thumbnails: MediaAsset[];
  }> {
    const all = await this.findByVideo(videoId);
    const originals = all.filter(a => a.kind === 'original');
    const transcoded: Record<string, MediaAsset[]> = {};
    for (const a of all.filter(a => a.kind === 'transcoded')) {
      const key = a.quality || 'original';
      if (!transcoded[key]) transcoded[key] = [];
      transcoded[key].push(a);
    }
    const hlsManifest = all.find(a => a.kind === 'hls-manifest');
    const dashManifest = all.find(a => a.kind === 'dash-manifest');
    const qualities = Array.from(new Set(all.map(a => a.quality).filter(Boolean))) as QualityLabel[];
    const subtitles = all.filter(a => a.kind === 'subtitle');
    const thumbnails = all.filter(a => a.kind === 'thumbnail');
    return { originals, transcoded, hlsManifest, dashManifest, qualities, subtitles, thumbnails };
  }

  async registerFromVideo(video: Video): Promise<MediaAsset[]> {
    const created: MediaAsset[] = [];
    const push = async (input: Omit<RegisterAssetInput, 'videoId'>) => {
      try {
        const r = await this.register({ ...input, videoId: video.id });
        created.push(r);
      } catch (err) {
        this.logger.warn(`Register asset for ${video.id} failed: ${(err as Error).message}`);
      }
    };

    if (video.originalPath && fs.existsSync(video.originalPath)) {
      await push({
        kind: 'original',
        quality: 'original',
        absolutePath: video.originalPath,
        publicUrl: this.derivePublicUrl(video.originalPath),
        computeChecksum: false,
      });
    }
    if (video.thumbnailPath && fs.existsSync(video.thumbnailPath)) {
      await push({
        kind: 'thumbnail',
        absolutePath: video.thumbnailPath,
        publicUrl: video.thumbnailUrl || this.derivePublicUrl(video.thumbnailPath),
      });
    }
    if (Array.isArray(video.subtitleTracks)) {
      for (const raw of video.subtitleTracks) {
        if (!raw) continue;
        const [lang, subPath, label] = String(raw).split('|');
        if (subPath && fs.existsSync(subPath)) {
          await push({ kind: 'subtitle', absolutePath: subPath, language: lang, trackLabel: label });
        }
      }
    }

    const processedRoot = path.join(UPLOADS_TRANSCODED_DIR, video.id);
    if (fs.existsSync(processedRoot)) {
      const walk = (dir: string, root = dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            walk(full, root);
            continue;
          }
          if (!entry.isFile()) continue;
          const lower = entry.name.toLowerCase();
          const rel = path.relative(root, full).split(path.sep).join('/');
          if (lower.endsWith('master.m3u8') || lower === 'master.m3u8') {
            push({ kind: 'hls-manifest', absolutePath: full, relativePath: rel });
          } else if (lower.endsWith('.m3u8')) {
            push({ kind: 'hls-manifest', absolutePath: full, relativePath: rel, quality: this.qualityFromFilename(lower) });
          } else if (lower.endsWith('.mpd')) {
            push({ kind: 'dash-manifest', absolutePath: full, relativePath: rel });
          } else if (lower.endsWith('.ts')) {
            push({ kind: 'hls-segment', absolutePath: full, relativePath: rel, quality: this.qualityFromFilename(lower) });
          } else if (lower.endsWith('.m4s')) {
            push({ kind: 'dash-segment', absolutePath: full, relativePath: rel, quality: this.qualityFromFilename(lower) });
          } else if (lower.endsWith('.mp4') || lower.endsWith('.mkv') || lower.endsWith('.webm')) {
            push({
              kind: 'transcoded',
              absolutePath: full,
              relativePath: rel,
              quality: this.qualityFromFilename(lower),
            });
          }
        }
      };
      walk(processedRoot);
    }
    return created;
  }

  async markSynced(id: string, targetId: string): Promise<MediaAsset> {
    const asset = await this.assetsRepository.findOne({ where: { id } });
    if (!asset) throw new NotFoundException(`Asset ${id} not found`);
    const set = new Set(asset.syncedTargets || []);
    set.add(targetId);
    asset.syncedTargets = Array.from(set);
    asset.syncedExternally = true;
    return this.assetsRepository.save(asset);
  }

  async deleteAsset(id: string): Promise<void> {
    const asset = await this.assetsRepository.findOne({ where: { id } });
    if (!asset) throw new NotFoundException(`Asset ${id} not found`);
    if (asset.storage === 'local' && asset.absolutePath) {
      try { if (fs.existsSync(asset.absolutePath)) fs.unlinkSync(asset.absolutePath); } catch {}
    }
    await this.assetsRepository.remove(asset);
  }

  async deleteByVideo(videoId: string): Promise<{ removed: number }> {
    const list = await this.assetsRepository.find({ where: { videoId } });
    for (const a of list) {
      if (a.storage === 'local' && a.absolutePath) {
        try { if (fs.existsSync(a.absolutePath)) fs.unlinkSync(a.absolutePath); } catch {}
      }
    }
    await this.assetsRepository.remove(list);
    return { removed: list.length };
  }

  async getBestQualityForBandwidth(videoId: string, maxMbps: number): Promise<MediaAsset | undefined> {
    const maxBps = maxMbps * 1_000_000;
    const all = await this.assetsRepository
      .createQueryBuilder('a')
      .where('a.videoId = :id AND a.kind IN (:...kinds)', { id: videoId, kinds: ['transcoded', 'original'] })
      .orderBy('a.bandwidthBps', 'DESC')
      .getMany();
    return all.find(a => a.bandwidthBps <= maxBps) || all[all.length - 1];
  }

  private qualityFromFilename(filename: string): QualityLabel | null {
    const f = filename.toLowerCase();
    if (f.includes('2160p') || f.includes('4k')) return '2160p';
    if (f.includes('1440p') || f.includes('2k')) return '1440p';
    if (f.includes('1080p')) return '1080p';
    if (f.includes('720p')) return '720p';
    if (f.includes('576p')) return '576p';
    if (f.includes('480p')) return '480p';
    if (f.includes('360p')) return '360p';
    return null;
  }

  private derivePublicUrl(absolutePath: string, relativePath?: string): string {
    if (relativePath) return `/uploads/${relativePath.startsWith('/') ? relativePath.slice(1) : relativePath}`;
    const needles = ['uploads', 'uploads/videos', 'uploads/thumbnails', 'uploads/subtitles', 'uploads/transcoded'];
    for (const needle of needles) {
      const idx = absolutePath.indexOf(needle);
      if (idx !== -1) return `/${absolutePath.slice(idx).split(path.sep).join('/')}`;
    }
    return '';
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
}
