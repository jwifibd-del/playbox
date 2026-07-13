import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Movie } from '../movies/movie.entity';
import { TVShow } from '../tv-shows/tv-show.entity';
import { Episode } from '../tv-shows/episode.entity';

@Entity()
export class WatchHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Movie, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movieId' })
  movie: Movie;

  @Column({ nullable: true })
  movieId?: string;

  @ManyToOne(() => TVShow, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tvShowId' })
  tvShow: TVShow;

  @Column({ nullable: true })
  tvShowId?: string;

  @ManyToOne(() => Episode, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'episodeId' })
  episode: Episode;

  @Column({ nullable: true })
  episodeId?: string;

  @Column('int', { default: 0 })
  progress: number; // Progress in seconds

  @Column('int', { default: 0 })
  duration: number; // Total duration in seconds

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @CreateDateColumn()
  watchedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}