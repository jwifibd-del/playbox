import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Genre } from '../genres/genre.entity';
import { Episode } from './episode.entity';
import { Video } from '../videos/video.entity';

@Entity()
export class TVShow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  tagline?: string;

  @Column('text')
  overview: string;

  @Column()
  posterPath: string;

  @Column()
  backdropPath: string;

  @Column('int')
  startYear: number;

  @Column('int', { nullable: true })
  endYear?: number;

  @Column('float')
  rating: number;

  @Column('int', { default: 1 })
  numberOfSeasons: number;

  @OneToMany(() => Episode, (episode) => episode.tvShow, { cascade: true })
  episodes: Episode[];

  @OneToMany(() => Video, (video) => video.tvShow, { cascade: true })
  videos: Video[];

  @ManyToMany(() => Genre, (genre) => genre.tvShows, { cascade: true })
  @JoinTable()
  genres: Genre[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
