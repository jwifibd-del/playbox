import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaAssetsService } from './media-assets.service';
import { MediaAssetsController } from './media-assets.controller';
import { MediaAsset } from './media-asset.entity';
import { Video } from '../videos/video.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MediaAsset, Video])],
  providers: [MediaAssetsService],
  controllers: [MediaAssetsController],
  exports: [MediaAssetsService],
})
export class MediaAssetsModule {}
