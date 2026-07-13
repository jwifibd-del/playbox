import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ImdbService } from './imdb.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('imdb')
export class ImdbController {
  constructor(private readonly imdbService: ImdbService) {}

  @Get('search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async searchTitle(@Query('query') query: string) {
    return this.imdbService.searchTitle(query);
  }

  @Get('title/:imdbId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getTitleDetails(@Param('imdbId') imdbId: string) {
    return this.imdbService.getTitleDetails(imdbId);
  }

  @Get('ratings/:imdbId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getRatings(@Param('imdbId') imdbId: string) {
    return this.imdbService.getRatings(imdbId);
  }
}
