import { Injectable, NotFoundException, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { TmdbService } from '../tmdb/tmdb.service';
import { TVShow } from './tv-show.entity';
import { Genre } from '../genres/genre.entity';
import { MediaSyncService } from '../media-sync/media-sync.service';

@Injectable()
export class TVShowsService {
  private readonly logger = new Logger(TVShowsService.name);

  constructor(
    @InjectRepository(TVShow)
    private tvShowsRepository: Repository<TVShow>,
    @InjectRepository(Genre)
    private genresRepository: Repository<Genre>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private tmdbService: TmdbService,
    @Inject(forwardRef(() => MediaSyncService))
    private mediaSyncService: MediaSyncService,
  ) {}

  async findAll(): Promise<TVShow[]> {
    const cached = await this.cacheManager.get<TVShow[]>('tvshows:all');
    if (cached) {
      return cached;
    }
    const tvShows = await this.tvShowsRepository.find({ relations: ['genres', 'episodes', 'episodes.videos', 'videos'] });
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
      relations: ['genres', 'episodes', 'episodes.videos', 'videos'],
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
    try {
      if (this.mediaSyncService && typeof (this.mediaSyncService as any).onMediaCreated === 'function') {
        this.mediaSyncService.onMediaCreated({ kind: 'tv', id: savedTVShow.id, name: savedTVShow.title }).catch(err =>
          this.logger.warn(`Auto-sync hook suppressed (tv ${savedTVShow.id}): ${(err as Error)?.message}`)
        );
      }
    } catch (err) {
      this.logger.warn(`Auto-sync hook suppressed (tv ${savedTVShow.id}): ${(err as Error)?.message}`);
    }
    return savedTVShow;
  }

  async create(data: Partial<TVShow> & { genres?: string[] }): Promise<TVShow> {
    const genreEntities: Genre[] = [];
    if (data.genres && data.genres.length > 0) {
      for (const genreName of data.genres) {
        if (typeof genreName !== 'string') continue;
        let genre = await this.genresRepository.findOneBy({ name: genreName });
        if (!genre) {
          genre = this.genresRepository.create({ name: genreName });
          await this.genresRepository.save(genre);
        }
        genreEntities.push(genre);
      }
    }
    const { genres: _genres, ...rest } = data;
    const tvShow = this.tvShowsRepository.create({
      ...rest,
      genres: genreEntities.length > 0 ? genreEntities : undefined,
      episodes: (data as any).episodes || [],
    });
    const saved = await this.tvShowsRepository.save(tvShow);
    await this.cacheManager.del('tvshows:all');
    try {
      if (this.mediaSyncService && typeof (this.mediaSyncService as any).onMediaCreated === 'function') {
        this.mediaSyncService.onMediaCreated({ kind: 'tv', id: saved.id, name: saved.title }).catch(err =>
          this.logger.warn(`Auto-sync hook suppressed (tv ${saved.id}): ${(err as Error)?.message}`)
        );
      }
    } catch (err) {
      this.logger.warn(`Auto-sync hook suppressed (tv ${saved.id}): ${(err as Error)?.message}`);
    }
    return saved;
  }

  async update(id: string, data: Partial<TVShow> & { genres?: string[] }): Promise<TVShow> {
    const tvShow = await this.findOne(id);
    if (!tvShow) throw new NotFoundException('TV Show not found');

    if (data.genres) {
      const genreEntities: Genre[] = [];
      for (const genreName of data.genres) {
        if (typeof genreName !== 'string') continue;
        let genre = await this.genresRepository.findOneBy({ name: genreName });
        if (!genre) {
          genre = this.genresRepository.create({ name: genreName });
          await this.genresRepository.save(genre);
        }
        genreEntities.push(genre);
      }
      tvShow.genres = genreEntities;
    }

    const fieldsToCopy: (keyof TVShow)[] = [
      'title', 'tagline', 'overview', 'posterPath', 'backdropPath',
      'startYear', 'endYear', 'rating', 'numberOfSeasons',
      'tmdbId', 'imdbId', 'tvdbId',
      'country', 'language', 'quality', 'studio',
      'logoPath', 'hdLogoPath', 'clearArtPath', 'hdClearArtPath', 'bannerPath', 'thumbPath',
    ];
    for (const f of fieldsToCopy) {
      if ((data as any)[f] !== undefined) (tvShow as any)[f] = (data as any)[f];
    }

    const updated = await this.tvShowsRepository.save(tvShow);
    await this.cacheManager.del('tvshows:all');
    await this.cacheManager.del(`tvshows:${id}`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.tvShowsRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('TV Show not found');
    await this.cacheManager.del('tvshows:all');
    await this.cacheManager.del(`tvshows:${id}`);
  }
}
