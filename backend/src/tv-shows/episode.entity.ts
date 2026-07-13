import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { TVShow } from './tv-show.entity';
import { Video } from '../videos/video.entity';

@Entity()
export class Episode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TVShow, (tvShow) => tvShow.episodes, { onDelete: 'CASCADE' })
  tvShow: TVShow;

  @Column('int')
  seasonNumber: number;

  @Column('int')
  episodeNumber: number;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  overview?: string;

  @Column({ nullable: true })
  stillPath?: string;

  @Column('int')
  runtime: number;

  @Column('float', { nullable: true })
  rating?: number;

  @OneToMany(() => Video, (video) => video.episode, { cascade: true })
  videos: Video[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
