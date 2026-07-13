import { Injectable, Logger } from '@nestjs/common';
import { MoviesService } from '../movies/movies.service';
import { GenresService } from '../genres/genres.service';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';

interface CsvMovieData {
  title: string;
  tagline?: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  releaseYear: number;
  rating: number;
  runtime: string;
  country?: string;
  language?: string;
  quality?: string;
  studio?: string;
  director?: string;
  genres?: string;
  tmdbId?: number;
}

@Injectable()
export class CsvImportService {
  private readonly logger = new Logger(CsvImportService.name);

  constructor(
    private moviesService: MoviesService,
    private genresService: GenresService,
  ) {}

  async importMoviesFromCsv(filePath: string): Promise<{ imported: number; errors: string[] }> {
    const results: CsvMovieData[] = [];
    const errors: string[] = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data as unknown as CsvMovieData))
        .on('end', async () => {
          let imported = 0;
          for (const movieData of results) {
            try {
              await this.processMovieData(movieData);
              imported++;
            } catch (error) {
              this.logger.error(`Error importing movie ${movieData.title}:`, error);
              errors.push(`Failed to import "${movieData.title}": ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
          fs.unlink(filePath, (err) => {
            if (err) this.logger.error('Error deleting temporary CSV file:', err);
          });
          resolve({ imported, errors });
        })
        .on('error', (error) => {
          this.logger.error('Error reading CSV file:', error);
          reject(error);
        });
    });
  }

  private async processMovieData(movieData: CsvMovieData) {
    const genreNames = movieData.genres ? movieData.genres.split(',').map(g => g.trim()) : [];
    
    const movieDto = {
      title: movieData.title,
      tagline: movieData.tagline,
      overview: movieData.overview,
      posterPath: movieData.posterPath,
      backdropPath: movieData.backdropPath,
      releaseYear: parseInt(movieData.releaseYear as unknown as string),
      rating: parseFloat(movieData.rating as unknown as string),
      runtime: movieData.runtime,
      country: movieData.country,
      language: movieData.language,
      quality: movieData.quality,
      studio: movieData.studio,
      director: movieData.director,
      tmdbId: movieData.tmdbId ? parseInt(movieData.tmdbId as unknown as string) : null,
      genres: genreNames,
    };

    await this.moviesService.create(movieDto);
  }
}
