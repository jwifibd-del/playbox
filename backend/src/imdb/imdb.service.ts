import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImdbService {
  private readonly logger = new Logger(ImdbService.name);
  private readonly baseUrl = 'https://imdb-api.com/API';
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('IMDB_API_KEY') || '';
  }

  async searchTitle(query: string) {
    try {
      const url = `${this.baseUrl}/SearchTitle/${this.apiKey}/${encodeURIComponent(query)}`;
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error('Error searching IMDb:', error);
      throw error;
    }
  }

  async getTitleDetails(imdbId: string) {
    try {
      const url = `${this.baseUrl}/Title/${this.apiKey}/${imdbId}`;
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error('Error fetching title details from IMDb:', error);
      throw error;
    }
  }

  async getRatings(imdbId: string) {
    try {
      const url = `${this.baseUrl}/Ratings/${this.apiKey}/${imdbId}`;
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error('Error fetching ratings from IMDb:', error);
      throw error;
    }
  }
}
