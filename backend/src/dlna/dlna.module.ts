import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { DlnaDevice } from './dlna-device.entity';
import { DlnaService } from './dlna.service';
import { DlnaController } from './dlna.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([DlnaDevice]),
    ScheduleModule,
  ],
  controllers: [DlnaController],
  providers: [DlnaService],
  exports: [DlnaService],
})
export class DlnaModule {}
