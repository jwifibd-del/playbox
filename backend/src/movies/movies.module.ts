import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenresModule } from '../genres/genres.module';
import { TmdbModule } from '../tmdb/tmdb.module';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { Movie } from './movie.entity';
import { MediaSyncModule } from '../media-sync/media-sync.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Movie]),
    GenresModule,
    TmdbModule,
    forwardRef(() => MediaSyncModule),
  ],
  providers: [MoviesService],
  controllers: [MoviesController],
  exports: [TypeOrmModule, MoviesService],
})
export class MoviesModule {}
