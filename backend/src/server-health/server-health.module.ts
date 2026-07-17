import { Module } from '@nestjs/common';
import { ServerHealthService } from './server-health.service';
import { ServerHealthController } from './server-health.controller';

@Module({
  controllers: [ServerHealthController],
  providers: [ServerHealthService],
})
export class ServerHealthModule {}
