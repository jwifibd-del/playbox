import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Genre } from '../genres/genre.entity';
import { Video } from '../videos/video.entity';

@Entity()
export class Movie {
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
  releaseYear: number;

  @Column('float')
  rating: number;

  @Column()
  runtime: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  language?: string;

  @Column({ nullable: true })
  quality?: string;

  @Column({ nullable: true })
  studio?: string;

  @Column({ nullable: true })
  director?: string;

  @ManyToMany(() => Genre, (genre) => genre.movies, { cascade: true })
  @JoinTable()
  genres: Genre[];

  @OneToMany(() => Video, (video) => video.movie, { cascade: true })
  videos: Video[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
