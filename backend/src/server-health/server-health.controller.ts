import { Controller, Get } from '@nestjs/common';
import { ServerHealthService } from './server-health.service';

@Controller('api/server-health')
export class ServerHealthController {
  constructor(private readonly serverHealthService: ServerHealthService) {}

  @Get()
  getHealth() {
    return this.serverHealthService.getServerHealth();
  }
}
