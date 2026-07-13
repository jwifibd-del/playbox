import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { GenresService } from './genres.service';
import { CreateGenreDto } from './create-genre.dto';
import { Genre } from './genre.entity';

@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Get()
  async findAll(): Promise<Genre[]> {
    return this.genresService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Genre | null> {
    return this.genresService.findOne(id);
  }

  @Post()
  async create(@Body() createGenreDto: CreateGenreDto & { tmdbId: number }): Promise<Genre> {
    return this.genresService.create(createGenreDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGenreDto: Partial<CreateGenreDto>,
  ): Promise<Genre> {
    return this.genresService.update(id, updateGenreDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.genresService.remove(id);
  }
}
