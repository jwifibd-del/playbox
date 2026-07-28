import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { TranscodingService } from './transcoding.service';
import { TranscodingProfile } from './transcoding-profile.entity';
import { TranscodingJob, TranscodingJobStatus } from './transcoding-job.entity';
import {
  CreateTranscodingProfileDto,
  UpdateTranscodingProfileDto,
  QueueTranscodeJobDto,
  TriggerScheduledJobsDto,
} from './dto/transcoding.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('transcoding')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class TranscodingController {
  private readonly logger = new Logger(TranscodingController.name);

  constructor(private readonly transcoding: TranscodingService) {}

  // ============== LIVE ==============

  @Get('live')
  liveStats(): Promise<any> {
    return this.transcoding.getLiveStats();
  }

  // ============== PROFILES ==============

  @Get('profiles')
  listProfiles(): Promise<TranscodingProfile[]> {
    return this.transcoding.findAllProfiles();
  }

  @Get('profiles/default')
  getDefaultProfile(): Promise<TranscodingProfile> {
    return this.transcoding.getDefaultProfile();
  }

  @Get('profiles/:id')
  getProfile(@Param('id') id: string): Promise<TranscodingProfile> {
    return this.transcoding.findProfile(id);
  }

  @Post('profiles')
  createProfile(@Body() dto: CreateTranscodingProfileDto): Promise<TranscodingProfile> {
    return this.transcoding.createProfile(dto);
  }

  @Put('profiles/:id')
  updateProfile(
    @Param('id') id: string,
    @Body() dto: UpdateTranscodingProfileDto,
  ): Promise<TranscodingProfile> {
    return this.transcoding.updateProfile(id, dto);
  }

  @Delete('profiles/:id')
  @HttpCode(204)
  async deleteProfile(@Param('id') id: string): Promise<void> {
    await this.transcoding.deleteProfile(id);
  }

  // ============== JOBS ==============

  @Get('jobs')
  listJobs(
    @Query('status') status?: TranscodingJobStatus,
    @Query('take') take = 100,
  ): Promise<TranscodingJob[]> {
    return this.transcoding.findAllJobs(status, Math.min(500, Math.max(1, Number(take) || 100)));
  }

  @Get('jobs/for-video/:videoId')
  jobsForVideo(@Param('videoId') videoId: string): Promise<TranscodingJob[]> {
    return this.transcoding.findJobsForVideo(videoId);
  }

  @Get('jobs/:id')
  getJob(@Param('id') id: string): Promise<TranscodingJob> {
    return this.transcoding.findJob(id);
  }

  @Post('jobs/queue')
  queueJob(@Body() dto: QueueTranscodeJobDto): Promise<TranscodingJob> {
    return this.transcoding.queueJob(dto, 'manual', false);
  }

  @Post('jobs/trigger-scheduled')
  triggerScheduled(@Body() dto?: TriggerScheduledJobsDto): Promise<{ triggered: number }> {
    return this.transcoding.triggerScheduled(dto?.profileId);
  }

  @Post('jobs/:id/retry')
  retryJob(@Param('id') id: string): Promise<TranscodingJob> {
    return this.transcoding.retryJob(id);
  }

  @Post('jobs/:id/pause')
  pauseJob(@Param('id') id: string): Promise<TranscodingJob> {
    return this.transcoding.pauseJob(id);
  }

  @Post('jobs/:id/resume')
  resumeJob(@Param('id') id: string): Promise<TranscodingJob> {
    return this.transcoding.resumeJob(id);
  }

  @Post('jobs/:id/cancel')
  cancelJob(@Param('id') id: string): Promise<TranscodingJob> {
    return this.transcoding.cancelJob(id);
  }

  @Delete('jobs/:id')
  @HttpCode(204)
  async deleteJob(@Param('id') id: string): Promise<void> {
    await this.transcoding.deleteJob(id);
  }
}
