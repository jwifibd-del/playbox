import { Controller, Get, Post, Param, Body, Query, Delete, HttpCode, UseGuards, Logger } from '@nestjs/common';
import { MediaAssetsService, RegisterAssetInput } from './media-assets.service';
import { MediaAsset } from './media-asset.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Video } from '../videos/video.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

@Controller('media-assets')
export class MediaAssetsController {
  private readonly logger = new Logger(MediaAssetsController.name);

  constructor(
    private readonly service: MediaAssetsService,
    @InjectRepository(Video)
    private videosRepository: Repository<Video>,
  ) {}

  @Get('video/:videoId/streaming')
  streaming(@Param('videoId') videoId: string) {
    return this.service.findForStreaming(videoId);
  }

  @Get('video/:videoId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  listForVideo(@Param('videoId') videoId: string, @Query('kind') kind?: any) {
    return this.service.findByVideo(videoId, kind);
  }

  @Get('video/:videoId/best-for-bandwidth')
  async bestForBandwidth(
    @Param('videoId') videoId: string,
    @Query('mbps') mbps: string,
  ) {
    const asset = await this.service.getBestQualityForBandwidth(videoId, parseFloat(mbps || '8'));
    return { asset };
  }

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  register(@Body() body: RegisterAssetInput): Promise<MediaAsset> {
    return this.service.register(body);
  }

  @Post('video/:videoId/refresh')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async refreshFromVideo(@Param('videoId') videoId: string): Promise<{ created: MediaAsset[] }> {
    const video = await this.videosRepository.findOne({ where: { id: videoId } });
    if (!video) throw new NotFoundException(`Video ${videoId} not found`);
    const created = await this.service.registerFromVideo(video);
    return { created };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(204)
  delete(@Param('id') id: string): Promise<void> {
    return this.service.deleteAsset(id);
  }
}
