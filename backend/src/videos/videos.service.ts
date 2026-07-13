import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Video, VideoStatus } from './video.entity';
import { StorageService } from '../storage/storage.service';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

interface TranscodingOptions {
  qualities?: string[];
  watermarkPath?: string;
  watermarkPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);
  private readonly baseOutputDir: string;

  constructor(
    @InjectRepository(Video)
    private videosRepository: Repository<Video>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private storageService: StorageService,
    private configService: ConfigService,
  ) {
    this.baseOutputDir = this.configService.get<string>('TRANSCODING_OUTPUT_DIR') || './uploads/transcoded';
    if (!fs.existsSync(this.baseOutputDir)) {
      fs.mkdirSync(this.baseOutputDir, { recursive: true });
    }
  }

  async findAll(): Promise<Video[]> {
    const cached = await this.cacheManager.get<Video[]>('videos:all');
    if (cached) {
      return cached;
    }
    const videos = await this.videosRepository.find({
      relations: ['movie', 'tvShow', 'episode'],
    });
    await this.cacheManager.set('videos:all', videos, 60 * 1000);
    return videos;
  }

  async findOne(id: string): Promise<Video | null> {
    const cached = await this.cacheManager.get<Video>(`video:${id}`);
    if (cached) {
      return cached;
    }
    const video = await this.videosRepository.findOne({
      where: { id },
      relations: ['movie', 'tvShow', 'episode'],
    });
    if (video) {
      await this.cacheManager.set(`video:${id}`, video, 30 * 1000);
    }
    return video;
  }

  async create(videoData: Partial<Video>): Promise<Video> {
    const video = this.videosRepository.create(videoData);
    const saved = await this.videosRepository.save(video);
    await this.cacheManager.del('videos:all');
    return saved;
  }

  async update(id: string, updateData: Partial<Video>): Promise<Video> {
    const video = await this.findOne(id);
    if (!video) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }

    Object.assign(video, updateData);
    const updated = await this.videosRepository.save(video);
    await this.cacheManager.del(`video:${id}`);
    await this.cacheManager.del('videos:all');
    return updated;
  }

  async delete(id: string): Promise<void> {
    const video = await this.findOne(id);
    if (!video) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }

    await this.videosRepository.remove(video);
    await this.cacheManager.del(`video:${id}`);
    await this.cacheManager.del('videos:all');
  }

  async updateStatus(id: string, status: VideoStatus): Promise<Video> {
    return this.update(id, { status });
  }

  async updateVideoPaths(
    id: string,
    hlsManifestPath: string,
    dashManifestPath: string,
    qualities: string[],
  ): Promise<Video> {
    const video = await this.findOne(id);
    if (!video) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }
    return this.update(id, {
      hlsManifestPath,
      dashManifestPath,
      qualities,
      status: VideoStatus.READY,
    });
  }

  async processVideo(id: string, options?: TranscodingOptions): Promise<void> {
    const video = await this.findOne(id);
    if (!video) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }

    this.logger.log(`Starting video processing for video ${id}`);
    await this.updateStatus(id, VideoStatus.PROCESSING);

    try {
      const outputDir = path.join(this.baseOutputDir, id);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const qualities = options?.qualities || ['1080p', '720p', '480p'];
      const watermarkPath = options?.watermarkPath;
      const watermarkPosition = options?.watermarkPosition || 'bottom-right';

      await this.transcodeToHLS(video.originalPath, outputDir, qualities, {
        watermarkPath,
        watermarkPosition,
      });

      await this.transcodeToDASH(video.originalPath, outputDir, qualities, {
        watermarkPath,
        watermarkPosition,
      });

      const hlsManifestPath = path.join(outputDir, 'hls', 'master.m3u8');
      const dashManifestPath = path.join(outputDir, 'dash', 'manifest.mpd');

      await this.updateVideoPaths(id, hlsManifestPath, dashManifestPath, qualities);
      this.logger.log(`Video ${id} processed successfully!`);
    } catch (error) {
      this.logger.error(`Error processing video ${id}:`, error);
      await this.updateStatus(id, VideoStatus.ERROR);
      throw error;
    }
  }

  private async transcodeToHLS(
    inputPath: string,
    outputDir: string,
    qualities: string[],
    options?: { watermarkPath?: string; watermarkPosition?: string },
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const hlsDir = path.join(outputDir, 'hls');
      if (!fs.existsSync(hlsDir)) {
        fs.mkdirSync(hlsDir, { recursive: true });
      }

      let command = ffmpeg(inputPath);

      if (options?.watermarkPath && fs.existsSync(options.watermarkPath)) {
        const overlay = this.getWatermarkOverlay(options.watermarkPosition);
        command = command.input(options.watermarkPath).complexFilter(overlay);
      }

      const masterPlaylist = path.join(hlsDir, 'master.m3u8');
      const variantPlaylists = qualities.map((q, i) => path.join(hlsDir, `${q}.m3u8`));

      command
        .outputOptions([
          '-hls_time 4',
          '-hls_list_size 0',
          '-hls_playlist_type vod',
          '-hls_segment_filename',
          path.join(hlsDir, 'segment_%v_%03d.ts'),
        ])
        .output(masterPlaylist)
        .on('start', (cmd) => this.logger.log('HLS transcoding started:', cmd))
        .on('progress', (progress) => this.logger.log(`HLS progress: ${progress.percent}% done`))
        .on('end', () => {
          this.logger.log('HLS transcoding finished');
          resolve();
        })
        .on('error', (err) => {
          this.logger.error('HLS transcoding error:', err);
          reject(err);
        })
        .run();
    });
  }

  private async transcodeToDASH(
    inputPath: string,
    outputDir: string,
    qualities: string[],
    options?: { watermarkPath?: string; watermarkPosition?: string },
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const dashDir = path.join(outputDir, 'dash');
      if (!fs.existsSync(dashDir)) {
        fs.mkdirSync(dashDir, { recursive: true });
      }

      let command = ffmpeg(inputPath);

      if (options?.watermarkPath && fs.existsSync(options.watermarkPath)) {
        const overlay = this.getWatermarkOverlay(options.watermarkPosition);
        command = command.input(options.watermarkPath).complexFilter(overlay);
      }

      command
        .outputOptions([
          '-f dash',
          '-seg_duration 4',
          '-use_template 1',
          '-use_timeline 1',
          '-window_size 0',
          '-adaptation_sets "id=0,streams=v id=1,streams=a"',
        ])
        .output(path.join(dashDir, 'manifest.mpd'))
        .on('start', (cmd) => this.logger.log('DASH transcoding started:', cmd))
        .on('progress', (progress) => this.logger.log(`DASH progress: ${progress.percent}% done`))
        .on('end', () => {
          this.logger.log('DASH transcoding finished');
          resolve();
        })
        .on('error', (err) => {
          this.logger.error('DASH transcoding error:', err);
          reject(err);
        })
        .run();
    });
  }

  private getWatermarkOverlay(position: string): string {
    const margin = 10;
    switch (position) {
      case 'top-left':
        return `overlay=${margin}:${margin}`;
      case 'top-right':
        return `overlay=main_w-overlay_w-${margin}:${margin}`;
      case 'bottom-left':
        return `overlay=${margin}:main_h-overlay_h-${margin}`;
      case 'bottom-right':
      default:
        return `overlay=main_w-overlay_w-${margin}:main_h-overlay_h-${margin}`;
    }
  }
}
