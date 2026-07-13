import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Movie } from '../movies/movie.entity';
import { TVShow } from '../tv-shows/tv-show.entity';

@Entity()
export class Favorite {
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

  @CreateDateColumn()
  createdAt: Date;
}