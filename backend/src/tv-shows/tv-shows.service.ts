import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { TmdbService } from '../tmdb/tmdb.service';
import { TVShow } from './tv-show.entity';
import { Genre } from '../genres/genre.entity';

@Injectable()
export class TVShowsService {
  constructor(
    @InjectRepository(TVShow)
    private tvShowsRepository: Repository<TVShow>,
    @InjectRepository(Genre)
    private genresRepository: Repository<Genre>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private tmdbService: TmdbService,
  ) {}

  async findAll(): Promise<TVShow[]> {
    const cached = await this.cacheManager.get<TVShow[]>('tvshows:all');
    if (cached) {
      return cached;
    }
    const tvShows = await this.tvShowsRepository.find({ relations: ['genres', 'episodes'] });
    await this.cacheManager.set('tvshows:all', tvShows, 60 * 1000);
    return tvShows;
  }

  async findOne(id: string): Promise<TVShow | null> {
    const cached = await this.cacheManager.get<TVShow>(`tvshows:${id}`);
    if (cached) {
      return cached;
    }
    const tvShow = await this.tvShowsRepository.findOne({
      where: { id },
      relations: ['genres', 'episodes'],
    });
    if (tvShow) {
      await this.cacheManager.set(`tvshows:${id}`, tvShow, 60 * 1000);
    }
    return tvShow;
  }

  async importFromTmdb(tmdbId: number): Promise<TVShow> {
    const tmdbData = await this.tmdbService.getTVShowDetails(tmdbId);
    
    const genreEntities: Genre[] = [];
    if (tmdbData.genres && tmdbData.genres.length > 0) {
      for (const tmdbGenre of tmdbData.genres) {
        let genre = await this.genresRepository.findOneBy({ tmdbId: tmdbGenre.id });
        if (!genre) {
          genre = this.genresRepository.create({ tmdbId: tmdbGenre.id, name: tmdbGenre.name });
          await this.genresRepository.save(genre);
        }
        genreEntities.push(genre);
      }
    }

    const startYear = tmdbData.first_air_date 
      ? parseInt(tmdbData.first_air_date.split('-')[0]) 
      : 0;
    const endYear = tmdbData.last_air_date 
      ? parseInt(tmdbData.last_air_date.split('-')[0]) 
      : undefined;

    const tvShow = this.tvShowsRepository.create({
      title: tmdbData.name,
      tagline: tmdbData.tagline || '',
      overview: tmdbData.overview,
      posterPath: tmdbData.poster_path 
        ? this.tmdbService.getPosterUrl(tmdbData.poster_path) 
        : '',
      backdropPath: tmdbData.backdrop_path 
        ? this.tmdbService.getBackdropUrl(tmdbData.backdrop_path) 
        : '',
      startYear,
      endYear,
      rating: tmdbData.vote_average || 0,
      numberOfSeasons: tmdbData.number_of_seasons || 1,
      genres: genreEntities,
      episodes: [],
    });
    
    const savedTVShow = await this.tvShowsRepository.save(tvShow);
    await this.cacheManager.del('tvshows:all');
    return savedTVShow;
  }
}
