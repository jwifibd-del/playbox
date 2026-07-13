import { Module } from '@nestjs/common';
import { CsvImportService } from './csv-import.service';
import { CsvImportController } from './csv-import.controller';
import { MoviesModule } from '../movies/movies.module';
import { GenresModule } from '../genres/genres.module';

@Module({
  imports: [MoviesModule, GenresModule],
  controllers: [CsvImportController],
  providers: [CsvImportService],
})
export class CsvImportModule {}
