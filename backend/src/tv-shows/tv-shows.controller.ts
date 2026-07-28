import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
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

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createDto: Partial<TVShow> & { genres?: string[] }): Promise<TVShow> {
    return this.tvShowsService.create(createDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() updateDto: Partial<TVShow> & { genres?: string[] },
  ): Promise<TVShow> {
    return this.tvShowsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string): Promise<void> {
    return this.tvShowsService.remove(id);
  }

  @Post('import/:tmdbId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  importFromTmdb(@Param('tmdbId') tmdbId: string): Promise<TVShow> {
    return this.tvShowsService.importFromTmdb(parseInt(tmdbId));
  }
}
