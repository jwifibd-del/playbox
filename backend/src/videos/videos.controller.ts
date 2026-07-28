import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideosService } from './videos.service';
import { Video, VideoStatus } from './video.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {
  multerVideoOptions,
  multerThumbnailOptions,
  multerSubtitleOptions,
  UPLOADS_VIDEOS_DIR,
  ensureDir,
} from '../common/multer.config';
import { TranscodingService } from '../transcoding/transcoding.service';
import * as path from 'path';

@Controller('videos')
export class VideosController {
  private readonly logger = new Logger(VideosController.name);

  constructor(
    private readonly videosService: VideosService,
    private readonly transcoding: TranscodingService,
  ) {}

  @Get()
  findAll(): Promise<Video[]> {
    return this.videosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Video | null> {
    return this.videosService.findOne(id);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file', multerVideoOptions))
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{
    id: string;
    originalPath: string;
    originalName: string;
    size: number;
    mimetype: string;
    transcodeJobId?: string | null;
  }> {
    ensureDir(UPLOADS_VIDEOS_DIR);
    this.logger.log(
      `Video uploaded: ${file.originalname} -> ${file.path} (${file.size} bytes, ${file.mimetype})`,
    );
    const video = await this.videosService.create({
      title: path.basename(file.originalname, path.extname(file.originalname)),
      originalPath: file.path,
      status: VideoStatus.PENDING,
    });
    let transcodeJobId: string | null = null;
    try {
      const job = await this.transcoding.queueOnUpload(video.id);
      if (job) transcodeJobId = job.id;
    } catch (err) {
      this.logger.warn(`Auto-transcode queue failed for video ${video.id}: ${(err as Error).message}`);
    }
    return {
      id: video.id,
      originalPath: video.originalPath,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      transcodeJobId,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file', multerVideoOptions))
  async create(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() videoData: Partial<Video>,
  ): Promise<Video> {
    const payload: Partial<Video> = { ...videoData };
    if (file) {
      payload.originalPath = file.path;
      this.logger.log(
        `Video attached with create: ${file.originalname} -> ${file.path}`,
      );
    }
    if (!payload.status) {
      payload.status = VideoStatus.PENDING;
    }
    const created = await this.videosService.create(payload);
    if (file) {
      try {
        await this.transcoding.queueOnUpload(created.id);
      } catch (err) {
        this.logger.warn(`Auto-transcode queue failed for video ${created.id}: ${(err as Error).message}`);
      }
    }
    return created;
  }

  @Post(':id/thumbnail')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file', multerThumbnailOptions))
  async uploadThumbnail(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Video> {
    this.logger.log(
      `Thumbnail uploaded for video ${id}: ${file.originalname} -> ${file.path}`,
    );
    const publicUrl = `/uploads/thumbnails/${path.basename(file.path)}`;
    return this.videosService.update(id, {
      thumbnailPath: file.path,
      thumbnailUrl: publicUrl,
    });
  }

  @Post(':id/subtitles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file', multerSubtitleOptions))
  async uploadSubtitle(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('language') language = 'en',
    @Body('label') label?: string,
  ): Promise<Video> {
    this.logger.log(
      `Subtitle uploaded for video ${id}: ${file.originalname} -> ${file.path}`,
    );
    const entry = `${language}|${file.path}|${label || language}`;
    const video = await this.videosService.findOne(id);
    if (!video) {
      throw new Error(`Video ${id} not found`);
    }
    const existing = Array.isArray(video.subtitleTracks)
      ? video.subtitleTracks.filter(Boolean)
      : [];
    const updated = [...existing, entry];
    return this.videosService.update(id, { subtitleTracks: updated });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() updateData: Partial<Video>,
  ): Promise<Video> {
    return this.videosService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(204)
  delete(@Param('id') id: string): Promise<void> {
    return this.videosService.delete(id);
  }

  @Post(':id/process')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async processVideo(
    @Param('id') id: string,
    @Body()
    options?: {
      qualities?: string[];
      watermarkPath?: string;
      watermarkPosition?:
        | 'top-left'
        | 'top-right'
        | 'bottom-left'
        | 'bottom-right';
    },
  ): Promise<{ message: string }> {
    await this.videosService.processVideo(id, options);
    return { message: `Video processing started for ${id}` };
  }
}
