import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type DlnaDeviceClass =
  | 'MediaRenderer'
  | 'MediaServer'
  | 'MediaPlayer'
  | 'MediaRenderer:1'
  | 'MediaServer:1'
  | 'MediaServer:2'
  | 'MediaRenderer:2'
  | 'unknown';

export type DlnaDeviceStatus = 'online' | 'offline' | 'discovering' | 'error';

export type DlnaProtocolInfo = {
  protocol: string;
  network: string;
  contentType: string;
  additionalInfo: string;
};

@Entity()
@Index(['udn'], { unique: true })
export class DlnaDevice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  udn: string;

  @Column()
  friendlyName: string;

  @Column({ type: 'text', default: 'unknown' })
  deviceClass: DlnaDeviceClass;

  @Column({ nullable: true })
  manufacturer?: string;

  @Column({ nullable: true })
  manufacturerUrl?: string;

  @Column({ nullable: true })
  modelName?: string;

  @Column({ nullable: true })
  modelDescription?: string;

  @Column({ nullable: true })
  modelNumber?: string;

  @Column({ nullable: true })
  modelUrl?: string;

  @Column({ nullable: true })
  serialNumber?: string;

  @Column()
  locationUrl: string;

  @Column({ nullable: true })
  baseUrl?: string;

  @Column({ type: 'text', default: 'discovering' })
  status: DlnaDeviceStatus;

  @Column({ nullable: true, type: 'text' })
  ipAddress?: string;

  @Column({ type: 'int', default: 0 })
  port: number;

  @Column({ type: 'boolean', default: false })
  isMediaRenderer: boolean;

  @Column({ type: 'boolean', default: false })
  isMediaServer: boolean;

  @Column({ type: 'boolean', default: false })
  isRemoteControllable: boolean;

  @Column({ type: 'boolean', default: false })
  supportsPlay: boolean;

  @Column({ type: 'boolean', default: false })
  supportsPause: boolean;

  @Column({ type: 'boolean', default: false })
  supportsStop: boolean;

  @Column({ type: 'boolean', default: false })
  supportsSeek: boolean;

  @Column({ type: 'boolean', default: false })
  supportsSetVolume: boolean;

  @Column({ type: 'boolean', default: false })
  supportsSetMute: boolean;

  @Column({ nullable: true, type: 'text' })
  avTransportControlUrl?: string;

  @Column({ nullable: true, type: 'text' })
  renderingControlUrl?: string;

  @Column({ nullable: true, type: 'text' })
  connectionManagerUrl?: string;

  @Column({ nullable: true, type: 'text' })
  contentDirectoryUrl?: string;

  @Column({ type: 'simple-array', default: '' })
  supportedProtocols: string[];

  @Column({ type: 'simple-array', default: '' })
  services: string[];

  @Column({ type: 'int', default: 1800 })
  cacheControlMaxAge: number;

  @Column({ type: 'boolean', default: false })
  pinned: boolean;

  @Column({ type: 'boolean', default: true })
  autoReconnect: boolean;

  @Column({ type: 'int', default: 0 })
  discoverCount: number;

  @Column({ type: 'int', default: 0 })
  failedAttempts: number;

  @Column({ nullable: true, type: 'int' })
  lastKnownVolume?: number;

  @Column({ type: 'boolean', default: false })
  lastKnownMute: boolean;

  @Column({ nullable: true, type: 'text' })
  lastPlayingTitle?: string;

  @Column({ nullable: true, type: 'text' })
  lastPlayingUrl?: string;

  @Column({ nullable: true })
  lastSeenAt?: Date;

  @Column({ nullable: true })
  lastConnectedAt?: Date;

  @Column({ type: 'simple-json', default: '{}' })
  rawDeviceDescription: Record<string, any>;

  @Column({ type: 'simple-json', default: '{}' })
  capabilities: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
