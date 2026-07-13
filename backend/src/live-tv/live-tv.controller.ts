import { Controller, Get, Post, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LiveTVService } from './live-tv.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('live-tv')
export class LiveTVController {
  constructor(private readonly liveTVService: LiveTVService) {}

  @Get('channels')
  @UseGuards(JwtAuthGuard)
  async getAllChannels() {
    return this.liveTVService.findAll();
  }

  @Post('import-m3u')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    })
  }))
  async importM3U(@UploadedFile() file: Express.Multer.File) {
    return this.liveTVService.importFromM3U(file.path);
  }
}
