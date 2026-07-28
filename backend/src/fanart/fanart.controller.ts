import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { FanartService } from './fanart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('fanart')
export class FanartController {
  constructor(private readonly fanartService: FanartService) {}

  @Get('status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  status(@Query('fanartKey') fanartKey?: string,
  ) {
    return {
      configured: this.fanartService.isConfigured(fanartKey),
      backendConfigured: this.fanartService.isConfigured(),
      tmdbConfigured: this.fanartService.isTmdbConfigured(),
    };
  }

  @Get('tmdb/movies/:tmdbId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getMovieArtByTMDB(
    @Param('tmdbId') tmdbId: string,
    @Query('pick') pick?: string,
    @Query('fanartKey') fanartKey?: string,
  ) {
    const id = parseInt(tmdbId);
    if (isNaN(id)) return null;
    if (pick === 'best' || pick === '1' || pick === 'true') {
      return this.fanartService.getPickedMovieByTMDB(id, 'en', fanartKey);
    }
    return this.fanartService.getMovieArtByTMDB(id, fanartKey);
  }

  @Get('tmdb/tv/:tmdbId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getTVArtByTMDB(
    @Param('tmdbId') tmdbId: string,
    @Query('pick') pick?: string,
    @Query('fanartKey') fanartKey?: string,
  ) {
    const id = parseInt(tmdbId);
    if (isNaN(id)) return null;
    if (pick === 'best' || pick === '1' || pick === 'true') {
      return this.fanartService.getPickedTVByTMDB(id, 'en', fanartKey);
    }
    return this.fanartService.getTVArtByTMDB(id, fanartKey);
  }

  @Get('movies/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getMovieArt(
    @Param('id') id: string,
    @Query('pick') pick?: string,
    @Query('fanartKey') fanartKey?: string,
  ) {
    if (pick === 'best' || pick === '1' || pick === 'true') {
      return this.fanartService.getPickedMovie(id, 'en', fanartKey);
    }
    return this.fanartService.getMovieArt(id, fanartKey);
  }

  @Get('tv/:tvdbId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getTVArt(
    @Param('tvdbId') tvdbId: string,
    @Query('pick') pick?: string,
    @Query('fanartKey') fanartKey?: string,
  ) {
    if (pick === 'best' || pick === '1' || pick === 'true') {
      return this.fanartService.getPickedTV(tvdbId, 'en', fanartKey);
    }
    return this.fanartService.getTVArt(tvdbId, fanartKey);
  }
}
