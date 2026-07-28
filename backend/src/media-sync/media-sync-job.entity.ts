import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MediaSyncTarget } from './media-sync-target.entity';

export type SyncJobStatus = 'pending' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'verifying' | 'paused';
export type SyncJobMediaType = 'video' | 'movie' | 'tv' | 'episode';

@Entity()
export class MediaSyncJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', default: 'pending' })
  status: SyncJobStatus;

  @Column({ type: 'text', default: 'backup' })
  direction: 'backup' | 'archive' | 'restore' | 'two-way';

  @Column({ type: 'text', default: 'copy' })
  mode: 'copy' | 'mirror' | 'move';

  @ManyToOne(() => MediaSyncTarget, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'targetId' })
  target?: MediaSyncTarget;

  @Column({ nullable: true })
  targetId?: string;

  @Column({ nullable: true })
  deviceId?: string;

  @Column({ nullable: true, type: 'text' })
  platform?: string;

  @Column({ type: 'simple-array', default: '' })
  videoIds: string[];

  @Column({ type: 'simple-array', default: '' })
  movieIds: string[];

  @Column({ type: 'simple-array', default: '' })
  tvShowIds: string[];

  @Column({ type: 'simple-array', default: '' })
  episodeIds: string[];

  @Column({ type: 'simple-array', default: '' })
  qualities: string[];

  @Column({ type: 'boolean', default: true })
  includeSubtitles: boolean;

  @Column({ type: 'boolean', default: true })
  includeThumbnails: boolean;

  @Column({ type: 'boolean', default: true })
  includeOriginal: boolean;

  @Column({ type: 'boolean', default: true })
  includeMetadata: boolean;

  @Column({ type: 'boolean', default: true })
  verifyAfterCopy: boolean;

  @Column({ type: 'boolean', default: false })
  deleteSourceAfter: boolean;

  @Column({ type: 'int', default: 0 })
  itemsTotal: number;

  @Column({ type: 'int', default: 0 })
  itemsProcessed: number;

  @Column({ type: 'int', default: 0 })
  itemsFailed: number;

  @Column({ type: 'int', default: 0 })
  itemsSkipped: number;

  @Column({ type: 'bigint', default: 0 })
  bytesTotal: number;

  @Column({ type: 'bigint', default: 0 })
  bytesTransferred: number;

  @Column({ type: 'simple-array', default: '' })
  errors: string[];

  @Column({ type: 'simple-array', default: '' })
  warnings: string[];

  @Column({ nullable: true })
  speedMbps?: number;

  @Column({ nullable: true, type: 'int' })
  etaSeconds?: number;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ nullable: true })
  startedAt?: Date;

  @Column({ nullable: true })
  pausedAt?: Date;

  @Column({ nullable: true })
  completedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
