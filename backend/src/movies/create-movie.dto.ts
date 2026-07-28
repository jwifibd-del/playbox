import { IsString, IsOptional, IsInt, IsArray, IsNumber } from 'class-validator';

export class CreateMovieDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  tagline?: string;

  @IsString()
  overview: string;

  @IsString()
  posterPath: string;

  @IsString()
  backdropPath: string;

  @IsInt()
  releaseYear: number;

  @IsNumber()
  rating: number;

  @IsString()
  runtime: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  quality?: string;

  @IsOptional()
  @IsString()
  studio?: string;

  @IsOptional()
  @IsString()
  director?: string;

  @IsOptional()
  @IsInt()
  tmdbId?: number;

  @IsOptional()
  @IsString()
  imdbId?: string;

  @IsOptional()
  @IsString()
  logoPath?: string;

  @IsOptional()
  @IsString()
  hdLogoPath?: string;

  @IsOptional()
  @IsString()
  clearArtPath?: string;

  @IsOptional()
  @IsString()
  hdClearArtPath?: string;

  @IsOptional()
  @IsString()
  bannerPath?: string;

  @IsOptional()
  @IsString()
  thumbPath?: string;

  @IsOptional()
  @IsString()
  discArtPath?: string;

  @IsArray()
  @IsString({ each: true })
  genres: string[];
}
