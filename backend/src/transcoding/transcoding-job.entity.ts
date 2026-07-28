import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Video } from '../videos/video.entity';
import { TranscodingProfile } from './transcoding-profile.entity';

export type TranscodingJobStatus =
  | 'queued'
  | 'pending'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'retrying';

export type TranscodingStage =
  | 'analyzing'
  | 'extracting-thumbnails'
  | 'transcoding-video'
  | 'transcoding-audio'
  | 'packaging-hls'
  | 'packaging-dash'
  | 'generating-sprite'
  | 'converting-subtitles'
  | 'registering-assets'
  | 'finalizing';

@Entity()
@Index(['status', 'priority'])
export class TranscodingJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Video, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'videoId' })
  video: Video;

  @Index()
  @Column()
  videoId: string;

  @ManyToOne(() => TranscodingProfile, { onDelete: 'SET NULL', eager: false, nullable: true })
  @JoinColumn({ name: 'profileId' })
  profile: TranscodingProfile;

  @Column({ nullable: true })
  profileId: string;

  @Column({ type: 'text', default: 'queued' })
  status: TranscodingJobStatus;

  @Column({ type: 'text', nullable: true })
  stage: TranscodingStage | null;

  @Column({ type: 'int', default: 0 })
  progressPercent: number;

  @Column({ type: 'real', default: 0 })
  speedMbps: number;

  @Column({ type: 'bigint', default: 0 })
  bytesProcessed: number;

  @Column({ type: 'bigint', default: 0 })
  bytesTotal: number;

  @Column({ type: 'bigint', default: 0 })
  etaSeconds: number;

  @Column({ type: 'real', default: 0 })
  fps: number;

  @Column({ type: 'int', default: 0 })
  framesProcessed: number;

  @Column({ type: 'text', nullable: true })
  currentQuality: string | null;

  @Column({ type: 'text', nullable: true })
  currentOutput: string | null;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'simple-array', default: '' })
  errors: string[];

  @Column({ type: 'text', nullable: true })
  lastError: string | null;

  @Column({ type: 'simple-json', default: '{}' })
  outputArtifacts: {
    hlsManifest?: string;
    dashManifest?: string;
    mp4s?: Record<string, string>;
    webms?: Record<string, string>;
    sprite?: string;
    thumbnails?: string[];
    subtitles?: Record<string, string>;
  };

  @Column({ type: 'simple-array', default: '' })
  generatedQualities: string[];

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ type: 'boolean', default: false })
  triggeredByUpload: boolean;

  @Column({ type: 'text', default: 'on-upload' })
  triggerSource: 'on-upload' | 'schedule' | 'manual' | 'retry';

  @Column({ type: 'bigint', default: 0 })
  cpuUsagePercent: number;

  @Column({ type: 'bigint', default: 0 })
  memoryUsedMB: number;

  @Column({ nullable: true })
  pid: number;

  @Column({ type: 'text', nullable: true })
  workerId: string | null;

  @Column({ type: 'simple-json', default: '{}' })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  queuedAt: Date;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  pausedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  failedAt: Date;

  @Column({ nullable: true })
  cancelledAt: Date;

  @Column({ type: 'bigint', default: 0 })
  totalDurationMs: number;

  @Column({ type: 'bigint', default: 0 })
  wallTimeMs: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
