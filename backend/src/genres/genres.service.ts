import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genre } from './genre.entity';
import { CreateGenreDto } from './create-genre.dto';

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(Genre)
    private genresRepository: Repository<Genre>,
  ) {}

  async findAll(): Promise<Genre[]> {
    return this.genresRepository.find();
  }

  async findOne(id: string): Promise<Genre | null> {
    return this.genresRepository.findOneBy({ id });
  }

  async findOneByTmdbId(tmdbId: number): Promise<Genre | null> {
    return this.genresRepository.findOneBy({ tmdbId });
  }

  async findByName(name: string): Promise<Genre | null> {
    return this.genresRepository.findOneBy({ name });
  }

  async create(createGenreDto: CreateGenreDto): Promise<Genre> {
    if (createGenreDto.tmdbId !== undefined && createGenreDto.tmdbId !== null) {
      const existingGenre = await this.genresRepository.findOneBy({ tmdbId: createGenreDto.tmdbId });
      if (existingGenre) {
        return existingGenre;
      }
    }

    const genre = this.genresRepository.create(createGenreDto);
    return this.genresRepository.save(genre);
  }

  async update(id: string, updateGenreDto: Partial<CreateGenreDto>): Promise<Genre> {
    const genre = await this.findOne(id);
    if (!genre) {
      throw new NotFoundException('Genre not found');
    }

    if (updateGenreDto.name !== undefined) genre.name = updateGenreDto.name;
    if (updateGenreDto.description !== undefined) genre.description = updateGenreDto.description;
    if (updateGenreDto.tmdbId !== undefined) genre.tmdbId = updateGenreDto.tmdbId;

    return this.genresRepository.save(genre);
  }

  async remove(id: string): Promise<void> {
    const result = await this.genresRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Genre not found');
    }
  }
}
