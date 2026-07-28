import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaSyncService } from './media-sync.service';
import { MediaSyncController } from './media-sync.controller';
import { MediaSyncTarget } from './media-sync-target.entity';
import { MediaSyncJob } from './media-sync-job.entity';
import { Video } from '../videos/video.entity';
import { Movie } from '../movies/movie.entity';
import { TVShow } from '../tv-shows/tv-show.entity';
import { Episode } from '../tv-shows/episode.entity';

import { DevicesModule } from '../devices/devices.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MediaSyncTarget, MediaSyncJob, Video, Movie, TVShow, Episode]),
    forwardRef(() => DevicesModule),
  ],
  providers: [MediaSyncService],
  controllers: [MediaSyncController],
  exports: [MediaSyncService],
})
export class MediaSyncModule {}
