import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class TvChannel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  logoPath?: string;

  @Column({ nullable: true })
  logoThumbPath?: string;

  @Column()
  streamUrl: string;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  language?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ default: false })
  isHD: boolean;

  @Column({ default: false })
  is4K: boolean;

  @Column('int', { default: 0 })
  order: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ nullable: true })
  epgId?: string;

  @Column({ nullable: true })
  nowPlaying?: string;

  @Column({ nullable: true })
  nextProgram?: string;

  @Column({ default: 0 })
  viewerCount: number;

  @Column('float', { default: 0 })
  rating: number;

  @Column({ nullable: true })
  timezone?: string;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ nullable: true })
  packageName?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
