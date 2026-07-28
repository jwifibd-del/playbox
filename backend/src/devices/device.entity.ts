import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

export type DevicePlatform =
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
  | 'tablet'
  | 'web-pwa';

export type DeviceFormFactor = 'phone' | 'tablet' | 'tv' | 'desktop' | 'stick' | 'unknown';
export type DeviceConnectionState = 'online' | 'offline' | 'idle' | 'syncing' | 'error';

@Entity()
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  deviceKey: string;

  @Column()
  name: string;

  @Column({ type: 'text', default: 'web-pwa' })
  platform: DevicePlatform;

  @Column({ type: 'text', default: 'unknown' })
  formFactor: DeviceFormFactor;

  @Column({ nullable: true })
  userId?: string;

  @Column({ nullable: true })
  model?: string;

  @Column({ nullable: true })
  manufacturer?: string;

  @Column({ nullable: true })
  osVersion?: string;

  @Column({ nullable: true })
  appVersion?: string;

  @Column({ nullable: true })
  appBuild?: string;

  @Column({ nullable: true, type: 'text' })
  locale?: string;

  @Column({ nullable: true, type: 'text' })
  languageCode?: string;

  @Column({ nullable: true, type: 'text' })
  countryCode?: string;

  @Column({ nullable: true, type: 'text' })
  timezone?: string;

  @Column({ type: 'bigint', default: 0 })
  totalBytes: number;

  @Column({ type: 'bigint', default: 0 })
  freeBytes: number;

  @Column({ type: 'bigint', default: 0 })
  usedBytes: number;

  @Column({ nullable: true, type: 'text' })
  storagePath?: string;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  macAddress?: string;

  @Column({ nullable: true })
  pushToken?: string;

  @Column({ type: 'text', default: 'offline' })
  connectionState: DeviceConnectionState;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'boolean', default: true })
  offlineEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  autoSyncNewContent: boolean;

  @Column({ type: 'simple-array', default: '' })
  autoSyncMediaTypes: string[];

  @Column({ type: 'simple-array', default: '' })
  preferredQualities: string[];

  @Column({ type: 'boolean', default: true })
  autoSyncOnWifiOnly: boolean;

  @Column({ type: 'boolean', default: true })
  includeSubtitles: boolean;

  @Column({ type: 'boolean', default: true })
  includeAudioTracks: boolean;

  @Column({ type: 'bigint', default: 0 })
  maxOfflineGB: number;

  @Column({ nullable: true, type: 'int' })
  batteryLevel?: number;

  @Column({ nullable: true })
  lastSeenAt?: Date;

  @Column({ nullable: true })
  lastSyncAt?: Date;

  @Column({ type: 'simple-json', default: '{}' })
  capabilities: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
