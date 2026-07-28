import { IsString, IsOptional, IsEnum, IsInt, IsArray, IsBoolean, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { TranscodingFormat, CodecPreset, QualityPreset } from '../transcoding-profile.entity';

export class QualityPresetDto {
  @IsEnum(['2160p', '1440p', '1080p', '720p', '576p', '480p', '360p', 'original'])
  label: any;

  @IsNumber()
  @Type(() => Number)
  width: number;

  @IsNumber()
  @Type(() => Number)
  height: number;

  @IsNumber()
  @Type(() => Number)
  videoBitrateKbps: number;

  @IsNumber()
  @Type(() => Number)
  audioBitrateKbps: number;

  @IsNumber()
  @Type(() => Number)
  fps: number;
}

const OUTPUT_FORMATS = ['hls', 'dash', 'hls+dash', 'mp4', 'webm'] as const;
const CODECS = ['h264-fast', 'h264-slow', 'h264-main', 'h265-fast', 'h265-slow', 'av1', 'copy', 'vp9'] as const;
const PRESET_SPEEDS = ['ultrafast', 'superfast', 'veryfast', 'faster', 'fast', 'medium', 'slow', 'slower', 'veryslow'] as const;
const AUDIO_CODECS = ['aac', 'opus', 'copy', 'mp3', 'ac3'] as const;
const WATERMARK_POSITIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;
const AUTO_TRIGGER_MODES = ['on-upload', 'schedule-only', 'manual'] as const;

export class CreateTranscodingProfileDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(OUTPUT_FORMATS)
  outputFormat?: TranscodingFormat;

  @IsOptional()
  @IsEnum(CODECS)
  codec?: CodecPreset;

  @IsOptional()
  @IsEnum(PRESET_SPEEDS)
  presetSpeed?: any;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  crf?: number;

  @IsOptional()
  @IsEnum(AUDIO_CODECS)
  audioCodec?: any;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  audioChannels?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QualityPresetDto)
  qualities?: QualityPreset[];

  @IsOptional()
  @IsString()
  watermarkPath?: string;

  @IsOptional()
  @IsEnum(WATERMARK_POSITIONS)
  watermarkPosition?: any;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  segmentDurationSec?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  keyframeAlignment?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  produceThumbnailSprite?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  generateSubtitleWebVTT?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  twoPass?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hardwareAcceleration?: boolean;

  @IsOptional()
  @IsString()
  hardwareEncoder?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isDefault?: boolean;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  priority?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  enabled?: boolean;

  @IsOptional()
  @IsEnum(AUTO_TRIGGER_MODES)
  autoTriggerMode?: any;

  @IsOptional()
  @IsString()
  scheduleCron?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  retryOnFailure?: boolean;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  maxRetries?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  retryBackoffSeconds?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  maxConcurrentWorkers?: number;
}

export class UpdateTranscodingProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(OUTPUT_FORMATS)
  outputFormat?: TranscodingFormat;

  @IsOptional()
  @IsEnum(CODECS)
  codec?: CodecPreset;

  @IsOptional()
  @IsEnum(PRESET_SPEEDS)
  presetSpeed?: any;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  crf?: number;

  @IsOptional()
  @IsEnum(AUDIO_CODECS)
  audioCodec?: any;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  audioChannels?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QualityPresetDto)
  qualities?: QualityPreset[];

  @IsOptional()
  @IsString()
  watermarkPath?: string;

  @IsOptional()
  @IsEnum(WATERMARK_POSITIONS)
  watermarkPosition?: any;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  segmentDurationSec?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  keyframeAlignment?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  produceThumbnailSprite?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  generateSubtitleWebVTT?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  twoPass?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hardwareAcceleration?: boolean;

  @IsOptional()
  @IsString()
  hardwareEncoder?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isDefault?: boolean;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  priority?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  enabled?: boolean;

  @IsOptional()
  @IsEnum(AUTO_TRIGGER_MODES)
  autoTriggerMode?: any;

  @IsOptional()
  @IsString()
  scheduleCron?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  retryOnFailure?: boolean;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  maxRetries?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  retryBackoffSeconds?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  maxConcurrentWorkers?: number;
}

export class QueueTranscodeJobDto {
  @IsString()
  videoId: string;

  @IsOptional()
  @IsString()
  profileId?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  priority?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  qualityOverride?: string[];
}

export class TriggerScheduledJobsDto {
  @IsOptional()
  @IsString()
  profileId?: string;
}
