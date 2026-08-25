import { IsOptional, IsInt, IsBoolean, IsString, Min, Max } from 'class-validator';

export class UpdateWatchHistoryDto {
  @IsString()
  @IsOptional()
  movieId?: string;

  @IsString()
  @IsOptional()
  tvShowId?: string;

  @IsString()
  @IsOptional()
  episodeId?: string;

  @IsInt()
  @Min(0)
  progress: number;

  @IsInt()
  @Min(0)
  duration: number;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}

export class GetWatchHistoryQueryDto {
  @IsInt()
  @Min(1)
  @Max(200)
  @IsOptional()
  take?: number;

  @IsBoolean()
  @IsOptional()
  includeCompleted?: boolean;
}
