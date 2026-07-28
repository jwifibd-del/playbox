import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type SyncTargetType =
  | 'local-folder'
  | 'external-drive'
  | 'network-share'
  | 's3'
  | 'r2'
  | 'android'
  | 'android-tv'
  | 'google-tv'
  | 'ios'
  | 'tvos'
  | 'tizen'
  | 'webos'
  | 'roku'
  | 'fire-tv'
  | 'titan-os'
  | 'tablet';

export type SyncMode = 'copy' | 'mirror' | 'move';
export type SyncDirection = 'backup' | 'archive' | 'restore' | 'two-way';

@Entity()
export class MediaSyncTarget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  userId?: string;

  @Column({ nullable: true })
  deviceId?: string;

  @Column({
    type: 'text',
    default: 'local-folder',
  })
  type: SyncTargetType;

  @Column({ type: 'text', default: 'copy' })
  defaultMode: SyncMode;

  @Column({ type: 'text', default: 'backup' })
  defaultDirection: SyncDirection;

  @Column({ nullable: true, type: 'text' })
  path?: string;

  @Column({ nullable: true })
  label?: string;

  @Column({ nullable: true })
  mountPoint?: string;

  @Column({ nullable: true })
  bucketName?: string;

  @Column({ nullable: true })
  endpoint?: string;

  @Column({ nullable: true })
  region?: string;

  @Column({ nullable: true })
  accessKeyId?: string;

  @Column({ nullable: true })
  secretAccessKeyEncrypted?: string;

  @Column({ type: 'boolean', default: true })
  includeQualities: boolean;

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

  @Column({ type: 'boolean', default: false })
  compress: boolean;

  @Column({ type: 'boolean', default: false })
  splitIntoParts: boolean;

  @Column({ type: 'int', default: 4 })
  partSizeGB: number;

  @Column({ type: 'int', default: 0 })
  maxBandwidthMbps: number;

  @Column({ type: 'boolean', default: false })
  autoDetectOnConnect: boolean;

  @Column({ type: 'boolean', default: false })
  isConnected: boolean;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'bigint', default: 0 })
  freeBytes: number;

  @Column({ type: 'bigint', default: 0 })
  totalBytes: number;

  @Column({ type: 'bigint', default: 0 })
  usedBytes: number;

  @Column({ nullable: true })
  filesystem?: string;

  @Column({ type: 'boolean', default: false })
  autoSyncNewContent: boolean;

  @Column({ type: 'simple-array', default: '' })
  autoSyncMediaTypes: string[];

  @Column({ nullable: true })
  lastSeenAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
