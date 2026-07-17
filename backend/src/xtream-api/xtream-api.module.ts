import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { XtreamApiService } from './xtream-api.service';
import { XtreamApiController } from './xtream-api.controller';
import { XtreamConfig } from './xtream-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([XtreamConfig]), HttpModule],
  controllers: [XtreamApiController],
  providers: [XtreamApiService],
  exports: [XtreamApiService],
})
export class XtreamApiModule {}
