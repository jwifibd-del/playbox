import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { TranscodingProfile } from './transcoding-profile.entity';
import { TranscodingJob } from './transcoding-job.entity';
import { TranscodingController } from './transcoding.controller';
import { TranscodingService } from './transcoding.service';
import { TranscodingEngineService } from './transcoding-engine.service';
import { Video } from '../videos/video.entity';
import { MediaAssetsModule } from '../media-assets/media-assets.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([TranscodingProfile, TranscodingJob, Video]),
    ScheduleModule,
    MediaAssetsModule,
  ],
  controllers: [TranscodingController],
  providers: [TranscodingService, TranscodingEngineService],
  exports: [TranscodingService, TranscodingEngineService],
})
export class TranscodingModule {}
