import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveTVService } from './live-tv.service';
import { LiveTVController } from './live-tv.controller';
import { LiveTVChannel } from './live-tv-channel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LiveTVChannel])],
  controllers: [LiveTVController],
  providers: [LiveTVService],
  exports: [LiveTVService],
})
export class LiveTVModule {}
