import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Movie } from '../movies/movie.entity';
import { TVShow } from '../tv-shows/tv-show.entity';
import { Episode } from '../tv-shows/episode.entity';

export enum VideoStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  READY = 'ready',
  ERROR = 'error',
}

@Entity()
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: VideoStatus,
    default: VideoStatus.PENDING,
  })
  status: VideoStatus;

  @Column({ nullable: true })
  duration: string; // Total duration in seconds or format

  @Column({ nullable: true })
  originalPath: string; // Path to original video file

  @Column({ nullable: true })
  hlsManifestPath: string; // Path to HLS manifest (.m3u8)

  @Column({ nullable: true })
  dashManifestPath: string; // Path to DASH manifest (.mpd)

  @Column({ type: 'simple-array', default: [] })
  qualities: string[]; // e.g. ['1080p', '720p', '480p']

  @Column({ type: 'simple-array', default: [] })
  audioTracks: string[];

  @Column({ type: 'simple-array', default: [] })
  subtitleTracks: string[];

  @Column({ nullable: true })
  thumbnailPath: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'boolean', default: false })
  hasWatermark: boolean;

  @Column({ type: 'boolean', default: false })
  hasDRM: boolean;

  @ManyToOne(() => Movie, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movieId' })
  movie: Movie;

  @Column({ nullable: true })
  movieId: string;

  @ManyToOne(() => TVShow, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tvShowId' })
  tvShow: TVShow;

  @Column({ nullable: true })
  tvShowId: string;

  @ManyToOne(() => Episode, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'episodeId' })
  episode: Episode;

  @Column({ nullable: true })
  episodeId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
