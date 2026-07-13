import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { TVShowsService } from './tv-shows.service';
import { TVShow } from './tv-show.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('tv-shows')
export class TVShowsController {
  constructor(private readonly tvShowsService: TVShowsService) {}

  @Get()
  findAll(): Promise<TVShow[]> {
    return this.tvShowsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<TVShow | null> {
    return this.tvShowsService.findOne(id);
  }

  @Post('import/:tmdbId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  importFromTmdb(@Param('tmdbId') tmdbId: string): Promise<TVShow> {
    return this.tvShowsService.importFromTmdb(parseInt(tmdbId));
  }
}
