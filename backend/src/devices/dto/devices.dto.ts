import { IsString, IsEnum, IsOptional, IsBoolean, IsInt, IsArray, IsUUID, Min, IsObject, IsNotEmpty, MaxLength, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { DevicePlatform, DeviceFormFactor, DeviceConnectionState } from '../device.entity';

export class RegisterDeviceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  deviceKey: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name: string;

  @IsOptional()
  @IsEnum([
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
    'web-pwa',
  ])
  platform?: DevicePlatform;

  @IsOptional()
  @IsEnum(['phone', 'tablet', 'tv', 'desktop', 'stick', 'unknown'])
  formFactor?: DeviceFormFactor;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  osVersion?: string;

  @IsOptional()
  @IsString()
  appVersion?: string;

  @IsOptional()
  @IsString()
  appBuild?: string;

  @IsOptional()
  @IsString()
  locale?: string;

  @IsOptional()
  @IsString()
  languageCode?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  storagePath?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  pushToken?: string;

  @IsOptional()
  @IsString()
  macAddress?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  totalBytes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  freeBytes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  usedBytes?: number;

  @IsOptional()
  @IsObject()
  capabilities?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  offlineEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  autoSyncNewContent?: boolean;

  @IsOptional()
  @IsArray()
  autoSyncMediaTypes?: string[];

  @IsOptional()
  @IsArray()
  preferredQualities?: string[];
}

export class UpdateDeviceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum([
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
    'web-pwa',
  ])
  platform?: DevicePlatform;

  @IsOptional()
  @IsEnum(['phone', 'tablet', 'tv', 'desktop', 'stick', 'unknown'])
  formFactor?: DeviceFormFactor;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  osVersion?: string;

  @IsOptional()
  @IsString()
  appVersion?: string;

  @IsOptional()
  @IsString()
  appBuild?: string;

  @IsOptional()
  @IsString()
  locale?: string;

  @IsOptional()
  @IsString()
  languageCode?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  totalBytes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  freeBytes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  usedBytes?: number;

  @IsOptional()
  @IsString()
  storagePath?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  pushToken?: string;

  @IsOptional()
  @IsString()
  macAddress?: string;

  @IsOptional()
  @IsEnum(['online', 'offline', 'idle', 'syncing', 'error'])
  connectionState?: DeviceConnectionState;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  offlineEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  autoSyncNewContent?: boolean;

  @IsOptional()
  @IsArray()
  autoSyncMediaTypes?: string[];

  @IsOptional()
  @IsArray()
  preferredQualities?: string[];

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  autoSyncOnWifiOnly?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeSubtitles?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeAudioTracks?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  maxOfflineGB?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  batteryLevel?: number;

  @IsOptional()
  lastSeenAt?: Date;

  @IsOptional()
  lastSyncAt?: Date;

  @IsOptional()
  @IsObject()
  capabilities?: Record<string, any>;
}

export class HeartbeatDeviceDto {
  @IsOptional()
  @IsEnum(['online', 'offline', 'idle', 'syncing', 'error'])
  connectionState?: DeviceConnectionState;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  batteryLevel?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  freeBytes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  usedBytes?: number;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}

export class GetOfflineManifestDto {
  @IsOptional()
  @IsArray()
  movieIds?: string[];

  @IsOptional()
  @IsArray()
  tvShowIds?: string[];

  @IsOptional()
  @IsArray()
  episodeIds?: string[];

  @IsOptional()
  @IsArray()
  liveTvChannelIds?: string[];

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
  includeMetadata?: boolean;
}
