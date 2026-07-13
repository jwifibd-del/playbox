import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenresModule } from '../genres/genres.module';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { Movie } from './movie.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Movie]), GenresModule],
  providers: [MoviesService],
  controllers: [MoviesController],
})
export class MoviesModule {}
