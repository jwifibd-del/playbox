import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { TmdbService } from './tmdb.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('tmdb')
export class TmdbController {
  constructor(private readonly tmdbService: TmdbService) {}

  @Get('search/movies')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async searchMovies(@Query('query') query: string, @Query('page') page: string) {
    return this.tmdbService.searchMovies(query, parseInt(page) || 1);
  }

  @Get('movies/:tmdbId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getMovieDetails(@Param('tmdbId') tmdbId: string) {
    return this.tmdbService.getMovieDetails(parseInt(tmdbId));
  }

  @Get('trending/movies')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getTrendingMovies(@Query('timeWindow') timeWindow?: string) {
    return this.tmdbService.getTrendingMovies(timeWindow as 'day' | 'week' || 'week');
  }

  @Get('search/tv')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async searchTVShows(@Query('query') query: string, @Query('page') page: string) {
    return this.tmdbService.searchTVShows(query, parseInt(page) || 1);
  }

  @Get('tv/:tmdbId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getTVShowDetails(@Param('tmdbId') tmdbId: string) {
    return this.tmdbService.getTVShowDetails(parseInt(tmdbId));
  }

  @Get('trending/tv')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getTrendingTVShows(@Query('timeWindow') timeWindow?: string) {
    return this.tmdbService.getTrendingTVShows(timeWindow as 'day' | 'week' || 'week');
  }
}
