import { IsString, IsOptional, IsBoolean, IsInt, Min, Max, IsArray, IsEnum, IsUrl, IsObject, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

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

export type DlnaTransportState = 'STOPPED' | 'PLAYING' | 'TRANSITIONING' | 'PAUSED_PLAYBACK' | 'PAUSED_RECORDING' | 'RECORDING' | 'NO_MEDIA_PRESENT' | 'CUSTOM';

export class UpdateDlnaDeviceDto {
  @IsOptional() @IsString()
  friendlyName?: string;

  @IsOptional() @IsBoolean()
  pinned?: boolean;

  @IsOptional() @IsBoolean()
  autoReconnect?: boolean;

  @IsOptional() @IsBoolean()
  isMediaRenderer?: boolean;

  @IsOptional() @IsBoolean()
  isMediaServer?: boolean;

  @IsOptional() @IsString()
  label?: string;
}

export class CastToDlnaDto {
  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  mediaUrl: string;

  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsString()
  artist?: string;

  @IsOptional() @IsString()
  album?: string;

  @IsOptional() @IsString()
  genre?: string;

  @IsOptional() @IsUrl({ require_tld: false })
  posterUrl?: string;

  @IsOptional() @IsString()
  contentType?: string;

  @IsOptional() @IsInt() @Min(0)
  startPositionSeconds?: number;

  @IsOptional() @IsInt() @Min(0) @Max(100)
  initialVolume?: number;

  @IsOptional() @IsBoolean()
  autoPlay?: boolean;
}

export class DlnaPlaybackControlDto {
  @IsOptional() @IsInt() @Min(0) @Max(100)
  volume?: number;

  @IsOptional() @IsBoolean()
  mute?: boolean;

  @IsOptional() @IsInt() @Min(0)
  seekSeconds?: number;

  @IsOptional() @IsString()
  seekRelative?: string;
}

export class DlnaBrowseDto {
  @IsOptional() @IsString()
  objectId?: string;

  @IsOptional() @IsString()
  browseFlag?: 'BrowseMetadata' | 'BrowseDirectChildren';

  @IsOptional() @IsString()
  filter?: string;

  @IsOptional() @IsInt() @Min(0)
  startingIndex?: number;

  @IsOptional() @IsInt() @Min(0) @Max(500)
  requestedCount?: number;

  @IsOptional() @IsString()
  sortCriteria?: string;
}
