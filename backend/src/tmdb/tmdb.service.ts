import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TmdbService {
  private readonly logger = new Logger(TmdbService.name);
  private readonly baseUrl = 'https://api.themoviedb.org/3';
  private readonly apiKey: string;
  private readonly imageBaseUrl = 'https://image.tmdb.org/t/p';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('TMDB_API_KEY') || '';
  }

  async searchMovies(query: string, page = 1) {
    try {
      const url = `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&page=${page}`;
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error('Error searching movies on TMDB:', error);
      throw error;
    }
  }

  async getMovieDetails(tmdbId: number) {
    try {
      const url = `${this.baseUrl}/movie/${tmdbId}?api_key=${this.apiKey}&append_to_response=credits,keywords`;
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error('Error fetching movie details from TMDB:', error);
      throw error;
    }
  }

  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week') {
    try {
      const url = `${this.baseUrl}/trending/movie/${timeWindow}?api_key=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error('Error fetching trending movies from TMDB:', error);
      throw error;
    }
  }

  async searchTVShows(query: string, page = 1) {
    try {
      const url = `${this.baseUrl}/search/tv?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&page=${page}`;
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error('Error searching TV shows on TMDB:', error);
      throw error;
    }
  }

  async getTVShowDetails(tmdbId: number) {
    try {
      const url = `${this.baseUrl}/tv/${tmdbId}?api_key=${this.apiKey}&append_to_response=credits,keywords`;
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error('Error fetching TV show details from TMDB:', error);
      throw error;
    }
  }

  async getTrendingTVShows(timeWindow: 'day' | 'week' = 'week') {
    try {
      const url = `${this.baseUrl}/trending/tv/${timeWindow}?api_key=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error('Error fetching trending TV shows from TMDB:', error);
      throw error;
    }
  }

  getPosterUrl(path: string, size: 'w300' | 'w500' | 'w780' | 'original' = 'w500'): string {
    return `${this.imageBaseUrl}/${size}${path}`;
  }

  getBackdropUrl(path: string, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string {
    return `${this.imageBaseUrl}/${size}${path}`;
  }
}
