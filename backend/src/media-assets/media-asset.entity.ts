import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Video } from '../videos/video.entity';

export type MediaAssetKind =
  | 'original'
  | 'transcoded'
  | 'hls-manifest'
  | 'hls-segment'
  | 'dash-manifest'
  | 'dash-segment'
  | 'thumbnail'
  | 'subtitle'
  | 'sprite'
  | 'audio-track';

export type MediaAssetContainer = 'mp4' | 'mkv' | 'webm' | 'mov' | 'ts' | 'm4s' | 'm3u8' | 'mpd' | 'vtt' | 'srt' | 'jpg' | 'png' | 'webp';

export type QualityLabel = '2160p' | '1440p' | '1080p' | '720p' | '576p' | '480p' | '360p' | 'original';

@Entity()
@Index(['videoId', 'kind', 'quality'])
export class MediaAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Video, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'videoId' })
  video: Video;

  @Index()
  @Column()
  videoId: string;

  @Column({ type: 'text' })
  kind: MediaAssetKind;

  @Column({ type: 'text', nullable: true })
  quality: QualityLabel | null;

  @Column({ type: 'text', nullable: true })
  container: MediaAssetContainer | null;

  @Column({ type: 'text', default: 'local' })
  storage: 'local' | 's3' | 'r2' | 'network';

  @Column({ type: 'text', default: 'video' })
  category: 'video' | 'audio' | 'image' | 'text';

  @Column()
  absolutePath: string;

  @Column({ nullable: true })
  relativePath: string;

  @Column({ nullable: true })
  publicUrl: string;

  @Column({ type: 'bigint', default: 0 })
  sizeBytes: number;

  @Column({ type: 'int', default: 0 })
  width: number;

  @Column({ type: 'int', default: 0 })
  height: number;

  @Column({ type: 'int', default: 0 })
  bitrateKbps: number;

  @Column({ type: 'real', default: 0 })
  durationSeconds: number;

  @Column({ nullable: true })
  codecVideo: string;

  @Column({ nullable: true })
  codecAudio: string;

  @Column({ nullable: true })
  language: string;

  @Column({ type: 'int', default: 0 })
  bandwidthBps: number;

  @Column({ type: 'text', nullable: true })
  checksumSha256: string | null;

  @Column({ type: 'boolean', default: false })
  encrypted: boolean;

  @Column({ type: 'boolean', default: false })
  archived: boolean;

  @Column({ type: 'boolean', default: false })
  syncedExternally: boolean;

  @Column({ nullable: true })
  trackLabel: string;

  @Column({ nullable: true })
  drmKeyId: string;

  @Column({ type: 'simple-array', default: '' })
  syncedTargets: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
