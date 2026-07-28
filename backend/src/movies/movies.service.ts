import { Injectable, NotFoundException, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { TmdbService } from '../tmdb/tmdb.service';
import { Movie } from './movie.entity';
import { Genre } from '../genres/genre.entity';
import { CreateMovieDto } from './create-movie.dto';
import { MediaSyncService } from '../media-sync/media-sync.service';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);

  constructor(
    @InjectRepository(Movie)
    private moviesRepository: Repository<Movie>,
    @InjectRepository(Genre)
    private genresRepository: Repository<Genre>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private tmdbService: TmdbService,
    @Inject(forwardRef(() => MediaSyncService))
    private mediaSyncService: MediaSyncService,
  ) {}

  async findAll(): Promise<Movie[]> {
    const cached = await this.cacheManager.get<Movie[]>('movies:all');
    if (cached) {
      return cached;
    }
    const movies = await this.moviesRepository.find({ relations: ['genres', 'videos'] });
    await this.cacheManager.set('movies:all', movies, 60 * 1000); // 1 minute
    return movies;
  }

  async findOne(id: string): Promise<Movie | null> {
    const cached = await this.cacheManager.get<Movie>(`movies:${id}`);
    if (cached) {
      return cached;
    }
    const movie = await this.moviesRepository.findOne({
      where: { id },
      relations: ['genres', 'videos'],
    });
    if (movie) {
      await this.cacheManager.set(`movies:${id}`, movie, 60 * 1000);
    }
    return movie;
  }

  async create(createMovieDto: CreateMovieDto): Promise<Movie> {
    const genreEntities: Genre[] = [];
    for (const genreName of createMovieDto.genres) {
      let genre = await this.genresRepository.findOneBy({ name: genreName });
      if (!genre) {
        genre = this.genresRepository.create({ name: genreName });
        await this.genresRepository.save(genre);
      }
      genreEntities.push(genre);
    }

    const movie = this.moviesRepository.create({
      ...createMovieDto,
      genres: genreEntities,
    });
    const savedMovie = await this.moviesRepository.save(movie);
    await this.cacheManager.del('movies:all');
    try {
      if (this.mediaSyncService && typeof (this.mediaSyncService as any).onMediaCreated === 'function') {
        this.mediaSyncService.onMediaCreated({ kind: 'movie', id: savedMovie.id, name: savedMovie.title }).catch(err =>
          this.logger.warn(`Auto-sync hook suppressed (movie ${savedMovie.id}): ${(err as Error)?.message}`)
        );
      }
    } catch (err) {
      this.logger.warn(`Auto-sync hook suppressed (movie ${savedMovie.id}): ${(err as Error)?.message}`);
    }
    return savedMovie;
  }

  async update(id: string, updateMovieDto: Partial<CreateMovieDto>): Promise<Movie> {
    const movie = await this.findOne(id);
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    if (updateMovieDto.genres) {
      const genreEntities: Genre[] = [];
      for (const genreName of updateMovieDto.genres) {
        let genre = await this.genresRepository.findOneBy({ name: genreName });
        if (!genre) {
          genre = this.genresRepository.create({ name: genreName });
          await this.genresRepository.save(genre);
        }
        genreEntities.push(genre);
      }
      movie.genres = genreEntities;
    }

    if (updateMovieDto.title !== undefined) movie.title = updateMovieDto.title;
    if (updateMovieDto.tagline !== undefined) movie.tagline = updateMovieDto.tagline;
    if (updateMovieDto.overview !== undefined) movie.overview = updateMovieDto.overview;
    if (updateMovieDto.posterPath !== undefined) movie.posterPath = updateMovieDto.posterPath;
    if (updateMovieDto.backdropPath !== undefined) movie.backdropPath = updateMovieDto.backdropPath;
    if (updateMovieDto.releaseYear !== undefined) movie.releaseYear = updateMovieDto.releaseYear;
    if (updateMovieDto.rating !== undefined) movie.rating = updateMovieDto.rating;
    if (updateMovieDto.runtime !== undefined) movie.runtime = updateMovieDto.runtime;
    if (updateMovieDto.country !== undefined) movie.country = updateMovieDto.country;
    if (updateMovieDto.language !== undefined) movie.language = updateMovieDto.language;
    if (updateMovieDto.quality !== undefined) movie.quality = updateMovieDto.quality;
    if (updateMovieDto.studio !== undefined) movie.studio = updateMovieDto.studio;
    if (updateMovieDto.director !== undefined) movie.director = updateMovieDto.director;
    if (updateMovieDto.tmdbId !== undefined) movie.tmdbId = updateMovieDto.tmdbId;
    if (updateMovieDto.imdbId !== undefined) movie.imdbId = updateMovieDto.imdbId;
    if (updateMovieDto.logoPath !== undefined) movie.logoPath = updateMovieDto.logoPath;
    if (updateMovieDto.hdLogoPath !== undefined) movie.hdLogoPath = updateMovieDto.hdLogoPath;
    if (updateMovieDto.clearArtPath !== undefined) movie.clearArtPath = updateMovieDto.clearArtPath;
    if (updateMovieDto.hdClearArtPath !== undefined) movie.hdClearArtPath = updateMovieDto.hdClearArtPath;
    if (updateMovieDto.bannerPath !== undefined) movie.bannerPath = updateMovieDto.bannerPath;
    if (updateMovieDto.thumbPath !== undefined) movie.thumbPath = updateMovieDto.thumbPath;
    if (updateMovieDto.discArtPath !== undefined) movie.discArtPath = updateMovieDto.discArtPath;

    const updatedMovie = await this.moviesRepository.save(movie);
    await this.cacheManager.del('movies:all');
    await this.cacheManager.del(`movies:${id}`);
    return updatedMovie;
  }

  async remove(id: string): Promise<void> {
    const result = await this.moviesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Movie not found');
    }
    await this.cacheManager.del('movies:all');
    await this.cacheManager.del(`movies:${id}`);
  }

  async importFromTmdb(tmdbId: number): Promise<Movie> {
    const tmdbData = await this.tmdbService.getMovieDetails(tmdbId);
    
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

    const movie = this.moviesRepository.create({
      title: tmdbData.title,
      tagline: tmdbData.tagline || '',
      overview: tmdbData.overview,
      posterPath: tmdbData.poster_path ? this.tmdbService.getPosterUrl(tmdbData.poster_path) : '',
      backdropPath: tmdbData.backdrop_path ? this.tmdbService.getBackdropUrl(tmdbData.backdrop_path) : '',
      releaseYear: tmdbData.release_date ? parseInt(tmdbData.release_date.split('-')[0]) : 0,
      rating: tmdbData.vote_average || 0,
      runtime: `${tmdbData.runtime} min`,
      genres: genreEntities,
    });
    
    const savedMovie = await this.moviesRepository.save(movie);
    await this.cacheManager.del('movies:all');
    try {
      if (this.mediaSyncService && typeof (this.mediaSyncService as any).onMediaCreated === 'function') {
        this.mediaSyncService.onMediaCreated({ kind: 'movie', id: savedMovie.id, name: savedMovie.title }).catch(err =>
          this.logger.warn(`Auto-sync hook suppressed (movie ${savedMovie.id}): ${(err as Error)?.message}`)
        );
      }
    } catch (err) {
      this.logger.warn(`Auto-sync hook suppressed (movie ${savedMovie.id}): ${(err as Error)?.message}`);
    }
    return savedMovie;
  }
}
