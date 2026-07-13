import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideosService } from './videos.service';
import { Video, VideoStatus } from './video.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  findAll(): Promise<Video[]> {
    return this.videosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Video | null> {
    return this.videosService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/videos',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    })
  }))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() videoData: Partial<Video>,
  ): Promise<Video> {
    const video = await this.videosService.create({
      ...videoData,
      originalPath: file.path,
      status: VideoStatus.PENDING,
    });
    return video;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateData: Partial<Video>): Promise<Video> {
    return this.videosService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  delete(@Param('id') id: string): Promise<void> {
    return this.videosService.delete(id);
  }

  @Post(':id/process')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async processVideo(
    @Param('id') id: string,
    @Body() options?: { qualities?: string[]; watermarkPath?: string; watermarkPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' },
  ): Promise<{ message: string }> {
    await this.videosService.processVideo(id, options);
    return { message: `Video processing started for ${id}` };
  }
}
