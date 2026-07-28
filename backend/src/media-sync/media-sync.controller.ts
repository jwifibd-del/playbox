import {
  Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Patch,
  Query, HttpCode, Logger,
} from '@nestjs/common';
import { MediaSyncService } from './media-sync.service';
import { MediaSyncTarget } from './media-sync-target.entity';
import { MediaSyncJob, SyncJobStatus } from './media-sync-job.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateSyncJobDto, CreateSyncTargetDto, UpdateSyncTargetDto } from './dto/media-sync.dto';

@Controller('media-sync')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MediaSyncController {
  private readonly logger = new Logger(MediaSyncController.name);

  constructor(private readonly service: MediaSyncService) {}

  // --- Targets ---

  @Get('targets')
  @Roles('admin')
  listTargets(): Promise<MediaSyncTarget[]> {
    return this.service.findAllTargets();
  }

  @Get('targets/:id')
  @Roles('admin')
  getTarget(@Param('id') id: string): Promise<MediaSyncTarget> {
    return this.service.findTarget(id);
  }

  @Post('targets')
  @Roles('admin')
  createTarget(@Body() dto: CreateSyncTargetDto): Promise<MediaSyncTarget> {
    return this.service.createTarget(dto);
  }

  @Put('targets/:id')
  @Roles('admin')
  updateTarget(@Param('id') id: string, @Body() dto: UpdateSyncTargetDto): Promise<MediaSyncTarget> {
    return this.service.updateTarget(id, dto);
  }

  @Delete('targets/:id')
  @Roles('admin')
  @HttpCode(204)
  deleteTarget(@Param('id') id: string): Promise<void> {
    return this.service.deleteTarget(id);
  }

  @Post('targets/:id/test')
  @Roles('admin')
  testTarget(@Param('id') id: string): Promise<{ ok: boolean; message: string; writable: boolean; freeBytes: number; totalBytes: number }> {
    return this.service.testTarget(id);
  }

  // --- Jobs ---

  @Get('jobs')
  @Roles('admin')
  listJobs(@Query('status') status?: SyncJobStatus): Promise<MediaSyncJob[]> {
    return this.service.findAllJobs(status);
  }

  @Get('jobs/:id')
  @Roles('admin')
  getJob(@Param('id') id: string): Promise<MediaSyncJob> {
    return this.service.findJob(id);
  }

  @Post('jobs')
  @Roles('admin')
  createJob(@Body() dto: CreateSyncJobDto): Promise<MediaSyncJob> {
    return this.service.createJob(dto);
  }

  @Post('jobs/:id/start')
  @Roles('admin')
  startJob(@Param('id') id: string): Promise<MediaSyncJob> {
    return this.service.startJob(id);
  }

  @Patch('jobs/:id/pause')
  @Roles('admin')
  pauseJob(@Param('id') id: string): Promise<MediaSyncJob> {
    return this.service.pauseJob(id);
  }

  @Patch('jobs/:id/cancel')
  @Roles('admin')
  cancelJob(@Param('id') id: string): Promise<MediaSyncJob> {
    return this.service.cancelJob(id);
  }

  @Post('jobs/:id/retry')
  @Roles('admin')
  retryJob(@Param('id') id: string): Promise<MediaSyncJob> {
    return this.service.retryJob(id);
  }

  @Delete('jobs/:id')
  @Roles('admin')
  @HttpCode(204)
  deleteJob(@Param('id') id: string): Promise<void> {
    return this.service.deleteJob(id);
  }
}
