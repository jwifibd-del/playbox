import { IsString, IsOptional, IsInt, IsBoolean, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateTvChannelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logoPath?: string;

  @IsOptional()
  @IsString()
  logoThumbPath?: string;

  @IsString()
  @IsNotEmpty()
  streamUrl: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsBoolean()
  isHD?: boolean;

  @IsOptional()
  @IsBoolean()
  is4K?: boolean;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsString()
  epgId?: string;

  @IsOptional()
  @IsString()
  nowPlaying?: string;

  @IsOptional()
  @IsString()
  nextProgram?: string;

  @IsOptional()
  @IsInt()
  viewerCount?: number;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsString()
  packageName?: string;
}
