import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TVShow } from './tv-show.entity';
import { Episode } from './episode.entity';
import { TVShowsService } from './tv-shows.service';
import { TVShowsController } from './tv-shows.controller';
import { TmdbModule } from '../tmdb/tmdb.module';

@Module({
  imports: [TypeOrmModule.forFeature([TVShow, Episode]), TmdbModule],
  providers: [TVShowsService],
  controllers: [TVShowsController],
  exports: [TypeOrmModule],
})
export class TVShowsModule {}
