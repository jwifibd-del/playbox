import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type CodecPreset =
  | 'h264-fast'
  | 'h264-slow'
  | 'h264-main'
  | 'h265-fast'
  | 'h265-slow'
  | 'av1'
  | 'copy'
  | 'vp9';

export type TranscodingFormat = 'hls' | 'dash' | 'hls+dash' | 'mp4' | 'webm';

export type QualityPreset = {
  label: '2160p' | '1440p' | '1080p' | '720p' | '576p' | '480p' | '360p' | 'original';
  width: number;
  height: number;
  videoBitrateKbps: number;
  audioBitrateKbps: number;
  fps: number;
};

@Entity()
export class TranscodingProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', default: 'hls+dash' })
  outputFormat: TranscodingFormat;

  @Column({
    type: 'text',
    default: 'h264-main',
  })
  codec: CodecPreset;

  @Column({ type: 'text', default: 'medium' })
  presetSpeed: 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow' | 'slower' | 'veryslow';

  @Column({ type: 'int', default: 23 })
  crf: number;

  @Column({ type: 'text', default: 'aac' })
  audioCodec: 'aac' | 'opus' | 'copy' | 'mp3' | 'ac3';

  @Column({ type: 'int', default: 2 })
  audioChannels: number;

  @Column({ type: 'simple-json', default: '[]' })
  qualities: QualityPreset[];

  @Column({ nullable: true })
  watermarkPath: string;

  @Column({ type: 'text', default: 'bottom-right' })
  watermarkPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  @Column({ type: 'int', default: 4 })
  segmentDurationSec: number;

  @Column({ type: 'boolean', default: true })
  keyframeAlignment: boolean;

  @Column({ type: 'boolean', default: true })
  produceThumbnailSprite: boolean;

  @Column({ type: 'boolean', default: true })
  generateSubtitleWebVTT: boolean;

  @Column({ type: 'boolean', default: false })
  twoPass: boolean;

  @Column({ type: 'boolean', default: false })
  hardwareAcceleration: boolean;

  @Column({ nullable: true })
  hardwareEncoder: string;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'int', default: 1 })
  priority: number;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'text', default: 'on-upload' })
  autoTriggerMode: 'on-upload' | 'schedule-only' | 'manual';

  @Column({ nullable: true })
  scheduleCron: string;

  @Column({ type: 'boolean', default: false })
  retryOnFailure: boolean;

  @Column({ type: 'int', default: 3 })
  maxRetries: number;

  @Column({ type: 'int', default: 60 })
  retryBackoffSeconds: number;

  @Column({ type: 'int', default: 2 })
  maxConcurrentWorkers: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
