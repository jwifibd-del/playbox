import { Module } from '@nestjs/common';
import { FanartService } from './fanart.service';
import { FanartController } from './fanart.controller';

@Module({
  controllers: [FanartController],
  providers: [FanartService],
  exports: [FanartService],
})
export class FanartModule {}
