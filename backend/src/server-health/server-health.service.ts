import { Injectable } from '@nestjs/common';
import * as os from 'os';

@Injectable()
export class ServerHealthService {
  getServerHealth() {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = os.loadavg();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: uptime,
        formatted: this.formatUptime(uptime),
      },
      memory: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
        arrayBuffers: memoryUsage.arrayBuffers,
        total: totalMemory,
        used: usedMemory,
        free: freeMemory,
        usagePercentage: ((usedMemory / totalMemory) * 100).toFixed(2),
      },
      cpu: {
        load1min: cpuUsage[0],
        load5min: cpuUsage[1],
        load15min: cpuUsage[2],
        cores: os.cpus().length,
      },
      platform: {
        os: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
      },
    };
  }

  private formatUptime(seconds: number): string {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  }
}
