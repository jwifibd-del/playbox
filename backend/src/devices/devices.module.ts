import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { Device } from './device.entity';
import { Movie } from '../movies/movie.entity';
import { TVShow } from '../tv-shows/tv-show.entity';
import { Episode } from '../tv-shows/episode.entity';

import { Video } from '../videos/video.entity';
import { Genre } from '../genres/genre.entity';
import { MediaSyncModule } from '../media-sync/media-sync.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Device, Movie, TVShow, Episode, Video, Genre]),
    forwardRef(() => MediaSyncModule),
  ],
  providers: [DevicesService],
  controllers: [DevicesController],
  exports: [DevicesService],
})
export class DevicesModule {}
