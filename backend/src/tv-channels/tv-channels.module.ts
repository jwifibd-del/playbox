import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TvChannelsService } from './tv-channels.service';
import { TvChannelsController } from './tv-channels.controller';
import { TvChannel } from './tv-channel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TvChannel])],
  providers: [TvChannelsService],
  controllers: [TvChannelsController],
  exports: [TypeOrmModule, TvChannelsService],
})
export class TvChannelsModule {}
