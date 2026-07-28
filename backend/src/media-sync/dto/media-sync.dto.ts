import { IsString, IsEnum, IsOptional, IsArray, IsBoolean, IsInt, Min, IsNumber, IsUUID, IsObject, IsIn, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { SyncTargetType, SyncMode, SyncDirection } from '../media-sync-target.entity';

export const DEVICE_PLATFORMS = [
  'android',
  'android-tv',
  'google-tv',
  'ios',
  'tvos',
  'tizen',
  'webos',
  'roku',
  'fire-tv',
  'titan-os',
  'tablet',
] as const;

export type DevicePlatform = (typeof DEVICE_PLATFORMS)[number];

export const ALL_SYNC_TARGET_TYPES = [
  'local-folder',
  'external-drive',
  'network-share',
  's3',
  'r2',
  ...DEVICE_PLATFORMS,
] as const;

export class CreateSyncTargetDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsIn([...ALL_SYNC_TARGET_TYPES] as unknown as string[])
  type?: SyncTargetType;

  @IsOptional()
  @IsEnum(['copy', 'mirror', 'move'])
  defaultMode?: SyncMode;

  @IsOptional()
  @IsEnum(['backup', 'archive', 'restore', 'two-way'])
  defaultDirection?: SyncDirection;

  @IsOptional()
  @IsString()
  path?: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  mountPoint?: string;

  @IsOptional()
  @IsString()
  bucketName?: string;

  @IsOptional()
  @IsString()
  endpoint?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  accessKeyId?: string;

  @IsOptional()
  @IsString()
  secretAccessKeyEncrypted?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeQualities?: boolean;

  @IsOptional()
  @IsArray()
  qualities?: string[];

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeSubtitles?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeThumbnails?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeOriginal?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeMetadata?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  compress?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  splitIntoParts?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  partSizeGB?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxBandwidthMbps?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  autoDetectOnConnect?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isConnected?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  autoSyncNewContent?: boolean;

  @IsOptional()
  @IsArray()
  @IsIn(['movie', 'tv'], { each: true })
  autoSyncMediaTypes?: string[];
}

export class UpdateSyncTargetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn([...ALL_SYNC_TARGET_TYPES] as unknown as string[])
  type?: SyncTargetType;

  @IsOptional()
  @IsEnum(['copy', 'mirror', 'move'])
  defaultMode?: SyncMode;

  @IsOptional()
  @IsEnum(['backup', 'archive', 'restore', 'two-way'])
  defaultDirection?: SyncDirection;

  @IsOptional()
  @IsString()
  path?: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  mountPoint?: string;

  @IsOptional()
  @IsString()
  bucketName?: string;

  @IsOptional()
  @IsString()
  endpoint?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  accessKeyId?: string;

  @IsOptional()
  @IsString()
  secretAccessKeyEncrypted?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeQualities?: boolean;

  @IsOptional()
  @IsArray()
  qualities?: string[];

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeSubtitles?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeThumbnails?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeOriginal?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeMetadata?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  compress?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  splitIntoParts?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  partSizeGB?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxBandwidthMbps?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  autoDetectOnConnect?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isConnected?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  enabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  freeBytes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  totalBytes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  usedBytes?: number;

  @IsOptional()
  @IsString()
  filesystem?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  autoSyncNewContent?: boolean;

  @IsOptional()
  @IsArray()
  @IsIn(['movie', 'tv'], { each: true })
  autoSyncMediaTypes?: string[];
}

export class CreateSyncJobDto {
  @IsOptional()
  @IsUUID()
  targetId?: string;

  @IsOptional()
  @IsUUID()
  deviceId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  videoIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  movieIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  tvShowIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  episodeIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  liveTvChannelIds?: string[];

  @IsOptional()
  @IsEnum(['backup', 'archive', 'restore', 'two-way'])
  direction?: 'backup' | 'archive' | 'restore' | 'two-way';

  @IsOptional()
  @IsEnum(['copy', 'mirror', 'move'])
  mode?: 'copy' | 'mirror' | 'move';

  @IsOptional()
  @IsArray()
  qualities?: string[];

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeSubtitles?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeThumbnails?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeOriginal?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeMetadata?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  verifyAfterCopy?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  deleteSourceAfter?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxBandwidthMbps?: number;

  @IsOptional()
  @IsIn([...DEVICE_PLATFORMS] as unknown as string[])
  platform?: DevicePlatform;
}
