import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WatchHistory } from './watch-history.entity';
import { UpdateWatchHistoryDto } from './dto/watch-history.dto';

export interface WatchHistoryEnriched extends Omit<WatchHistory, 'user' | 'movie' | 'tvShow' | 'episode'> {
  title?: string;
  backdropPath?: string;
  posterPath?: string;
  releaseDate?: string;
  firstAirDate?: string;
  showName?: string;
  episodeNumber?: number;
  seasonNumber?: number;
  kind: 'movie' | 'episode';
}

@Injectable()
export class WatchHistoryService {
  private readonly logger = new Logger(WatchHistoryService.name);

  constructor(
    @InjectRepository(WatchHistory) private readonly historyRepo: Repository<WatchHistory>,
  ) {}

  async listForUser(userId: string, take = 24, includeCompleted = false): Promise<WatchHistoryEnriched[]> {
    const qb = this.historyRepo
      .createQueryBuilder('wh')
      .leftJoinAndSelect('wh.movie', 'm')
      .leftJoinAndSelect('wh.tvShow', 'tvs')
      .leftJoinAndSelect('wh.episode', 'e')
      .where('wh.userId = :userId', { userId })
      .andWhere(includeCompleted ? '1=1' : 'wh.completed = :c', { c: false })
      .orderBy('wh.updatedAt', 'DESC')
      .take(take);

    const rows = await qb.getMany();
    return rows.map(row => {
      const kind: 'movie' | 'episode' = row.episodeId || row.tvShowId ? 'episode' : 'movie';
      const title =
        kind === 'movie'
          ? row.movie?.title
          : (row.episode?.title || row.tvShow?.title);
      return {
        id: row.id,
        userId: row.userId,
        movieId: row.movieId,
        tvShowId: row.tvShowId,
        episodeId: row.episodeId,
        progress: row.progress,
        duration: row.duration,
        completed: row.completed,
        watchedAt: row.watchedAt,
        updatedAt: row.updatedAt,
        title,
        backdropPath:
          kind === 'movie'
            ? row.movie?.backdropPath
            : (row.tvShow?.backdropPath || row.tvShow?.backdropPath),
        posterPath:
          kind === 'movie'
            ? row.movie?.posterPath
            : (row.tvShow?.posterPath || row.episode?.stillPath),
        releaseDate: kind === 'movie' ? (row.movie?.releaseYear ? String(row.movie.releaseYear) : undefined) : undefined,
        firstAirDate: kind === 'episode' ? (row.tvShow?.startYear ? String(row.tvShow.startYear) : undefined) : undefined,
        showName: kind === 'episode' ? row.tvShow?.title : undefined,
        episodeNumber: kind === 'episode' ? row.episode?.episodeNumber : undefined,
        seasonNumber: kind === 'episode' ? row.episode?.seasonNumber : undefined,
        kind,
      } as WatchHistoryEnriched;
    });
  }

  async findOne(userId: string, id: string): Promise<WatchHistory | null> {
    return this.historyRepo.findOne({ where: { id, userId } });
  }

  async upsertProgress(userId: string, dto: UpdateWatchHistoryDto): Promise<WatchHistory> {
    const { movieId, tvShowId, episodeId, progress, duration, completed } = dto;
    if (!movieId && !tvShowId) {
      throw new NotFoundException('A movieId or tvShowId is required');
    }

    let where: any = { userId };
    if (episodeId) where = { userId, episodeId };
    else if (tvShowId) where = { userId, tvShowId };
    else if (movieId) where = { userId, movieId };

    let entry = await this.historyRepo.findOne({ where });
    if (!entry) {
      entry = this.historyRepo.create({
        userId,
        movieId,
        tvShowId,
        episodeId,
        progress,
        duration,
        completed: completed || false,
      });
    } else {
      entry.progress = progress;
      entry.duration = duration || entry.duration;
      entry.completed = completed ?? entry.completed;
    }

    const percent = duration > 0 ? progress / duration : 0;
    if (percent >= 0.95 && entry.completed !== true) {
      entry.completed = true;
    }

    return this.historyRepo.save(entry as any) as Promise<WatchHistory>;
  }

  async remove(userId: string, id: string): Promise<void> {
    const entry = await this.findOne(userId, id);
    if (!entry) throw new NotFoundException('Watch history entry not found');
    await this.historyRepo.delete(id);
  }

  async clearForUser(userId: string): Promise<void> {
    await this.historyRepo.delete({ userId });
  }

  async getProgressForVideo(
    userId: string,
    { movieId, tvShowId, episodeId }: { movieId?: string; tvShowId?: string; episodeId?: string },
  ): Promise<{ progress: number; duration: number; completed: boolean } | null> {
    const where: any = { userId };
    if (episodeId) where.episodeId = episodeId;
    else if (tvShowId) where.tvShowId = tvShowId;
    else if (movieId) where.movieId = movieId;
    else return null;

    const row = await this.historyRepo.findOne({ where });
    if (!row) return null;
    return { progress: row.progress, duration: row.duration, completed: row.completed };
  }
}
