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

  @IsArray()
  @IsString({ each: true })
  genres: string[];
}
