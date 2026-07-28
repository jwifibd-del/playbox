import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TVShow } from './tv-show.entity';
import { Episode } from './episode.entity';
import { Genre } from '../genres/genre.entity';
import { TVShowsService } from './tv-shows.service';
import { TVShowsController } from './tv-shows.controller';
import { TmdbModule } from '../tmdb/tmdb.module';
import { MediaSyncModule } from '../media-sync/media-sync.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TVShow, Episode, Genre]),
    TmdbModule,
    forwardRef(() => MediaSyncModule),
  ],
  providers: [TVShowsService],
  controllers: [TVShowsController],
  exports: [TypeOrmModule],
})
export class TVShowsModule {}
