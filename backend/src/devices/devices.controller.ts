import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  HttpCode,
  NotFoundException,
  Req,
  Headers,
  Res,
  UnauthorizedException,
  StreamableFile,
  Header,
} from '@nestjs/common';
import { createReadStream, statSync, existsSync, readFileSync } from 'fs';
import type { Request, Response } from 'express';
import { join, extname, dirname, basename } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import { DevicesService } from './devices.service';
import { Device } from './device.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RegisterDeviceDto, UpdateDeviceDto, HeartbeatDeviceDto, GetOfflineManifestDto } from './dto/devices.dto';
import { Movie } from '../movies/movie.entity';
import { TVShow } from '../tv-shows/tv-show.entity';
import { Episode } from '../tv-shows/episode.entity';

import { Video } from '../videos/video.entity';
import { Genre } from '../genres/genre.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

@Controller('devices')
export class DevicesController {
  constructor(
    private readonly devicesService: DevicesService,
    @InjectRepository(Movie) private moviesRepository: Repository<Movie>,
    @InjectRepository(TVShow) private tvShowsRepository: Repository<TVShow>,
    @InjectRepository(Episode) private episodesRepository: Repository<Episode>,
    @InjectRepository(Video) private videosRepository: Repository<Video>,
    @InjectRepository(Genre) private genresRepository: Repository<Genre>,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDeviceDto) {
    return this.devicesService.register(dto);
  }

  @Post('heartbeat')
  async heartbeatByDeviceKey(
    @Headers('x-device-key') deviceKey?: string,
    @Body() dto: HeartbeatDeviceDto = {},
    @Req() req?: Request,
  ) {
    const key = deviceKey || (req?.headers as any)['x-device-key'] || (req?.body as any)?.deviceKey;
    if (!key) throw new NotFoundException('Missing x-device-key header');
    return this.devicesService.heartbeatByKey(key, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'user')
  @Get()
  list(@Req() req: Request): Promise<Device[]> {
    const user = (req as any).user as any;
    const scope = user?.roles?.includes('admin') ? undefined : user?.id;
    return this.devicesService.findAll(scope);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  get(@Param('id') id: string): Promise<Device> {
    return this.devicesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDeviceDto): Promise<Device> {
    return this.devicesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    await this.devicesService.remove(id);
  }

  @Post(':id/heartbeat')
  heartbeat(@Param('id') id: string, @Body() dto: HeartbeatDeviceDto): Promise<Device> {
    return this.devicesService.heartbeat(id, dto);
  }

  // --- Offline content manifest (for a given device)
  @Post(':id/offline/manifest')
  async offlineManifest(
    @Param('id') id: string,
    @Body() dto: GetOfflineManifestDto,
  ) {
    const device = await this.devicesService.findOne(id);
    const qualities = dto.qualities?.length ? dto.qualities : device.preferredQualities;
    const includeSubtitles = dto.includeSubtitles ?? device.includeSubtitles;
    const includeMetadata = dto.includeMetadata ?? true;

    const response: any = {
      generatedAt: new Date().toISOString(),
      deviceId: device.id,
      devicePlatform: device.platform,
      qualities,
      includeSubtitles,
      includeMetadata,
      items: [] as any[],
    };

    // Movies
    if (dto.movieIds && dto.movieIds.length > 0) {
      const movies = await this.moviesRepository.find({
        where: { id: In(dto.movieIds) },
        relations: ['genres'],
      });
      for (const m of movies) {
        const videos = await this.videosRepository.find({ where: { movieId: m.id } });
        response.items.push(this.buildMediaEntry('movie', m.id, m.title, m, videos, qualities, includeSubtitles, includeMetadata));
      }
    }

    // TV Shows (episodes)
    if (dto.episodeIds && dto.episodeIds.length > 0) {
      const episodes = await this.episodesRepository.find({
        where: { id: In(dto.episodeIds) },
      });
      for (const ep of episodes) {
        const videos = await this.videosRepository.find({ where: { episodeId: ep.id } });
        response.items.push(this.buildMediaEntry('episode', ep.id, `S${ep.seasonNumber}E${ep.episodeNumber} — ${ep.title}`, ep, videos, qualities, includeSubtitles, includeMetadata));
      }
    } else if (dto.tvShowIds && dto.tvShowIds.length > 0) {
      const shows = await this.tvShowsRepository.find({
        where: { id: In(dto.tvShowIds) },
        relations: ['genres'],
      });
      for (const s of shows) {
        const episodes = await this.episodesRepository.find({ where: { tvShowId: s.id } });
        for (const ep of episodes) {
          const videos = await this.videosRepository.find({ where: { episodeId: ep.id } });
          response.items.push(this.buildMediaEntry('episode', ep.id, `${s.title} S${ep.seasonNumber}E${ep.episodeNumber}`, ep, videos, qualities, includeSubtitles, includeMetadata));
        }
      }
    }

    return response;
  }

  // --- Offline chunked media download (supports Range: bytes=)
  @Get('offline/download/*')
  async offlineDownload(
    @Param('*') subpath: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const safe = subpath.replace(/\.\./g, '');
    const absolute = path.resolve(process.cwd(), 'uploads', safe);
    if (!absolute.startsWith(path.resolve(process.cwd(), 'uploads'))) {
      throw new UnauthorizedException('Invalid path');
    }
    if (!fs.existsSync(absolute)) {
      throw new NotFoundException('File not found');
    }
    const stat = fs.statSync(absolute);
    const total = stat.size;
    const range = req.headers['range'];
    if (range) {
      const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
      const start = parseInt(startStr, 10);
      const end = endStr ? parseInt(endStr, 10) : total - 1;
      if (isNaN(start) || isNaN(end) || start > end || start >= total || end >= total) {
        res.status(416).header('Content-Range', `bytes */${total}`).send('Requested Range Not Satisfiable');
        return;
      }
      const chunksize = end - start + 1;
      res.status(206);
      res.header({
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(chunksize),
        'Content-Type': this.guessContentType(absolute),
      });
      const stream = fs.createReadStream(absolute, { start, end });
      stream.pipe(res);
      return;
    }
    res.status(200);
    res.header({
      'Accept-Ranges': 'bytes',
      'Content-Length': String(total),
      'Content-Type': this.guessContentType(absolute),
    });
    const stream = fs.createReadStream(absolute);
    stream.pipe(res);
  }

  // --- Push sync trigger (admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':id/push-sync')
  async pushSync(@Param('id') id: string, @Body() body?: { mediaType?: 'movie' | 'tv'; movieIds?: string[]; tvShowIds?: string[] }) {
    const device = await this.devicesService.findOne(id);
    return {
      ok: true,
      deviceId: device.id,
      message: 'Device notified. Device will fetch manifest and start offline download next time it calls in.',
      nextAction: 'POST /devices/:id/offline/manifest then GET /devices/offline/download/*',
      requested: body || {},
    };
  }

  private buildMediaEntry(
    kind: 'movie' | 'episode',
    id: string,
    title: string,
    entity: any,
    videos: Video[],
    qualities: string[],
    includeSubtitles: boolean,
    includeMetadata: boolean,
  ): any {
    const entry: any = {
      kind,
      id,
      title,
      year: entity.releaseYear || entity.airDate ? new Date(entity.releaseYear || entity.airDate).getFullYear() : undefined,
      poster: entity.posterPath,
      backdrop: entity.backdropPath,
      overview: entity.overview,
      tagline: entity.tagline,
      rating: entity.rating,
      qualities: [] as any[],
      subtitles: [] as any[],
    };

    if (kind === 'episode') {
      entry.season = entity.seasonNumber;
      entry.episode = entity.episodeNumber;
    }
    if (includeMetadata && entity.genres) {
      entry.genres = entity.genres.map((g: Genre) => ({ id: g.id, name: g.name }));
    }

    for (const v of videos) {
      for (const q of qualities) {
        const matchedQual = (v.qualities || []).find((x) => x && String(x).toLowerCase() === String(q).toLowerCase());
        if (!matchedQual && v.qualities.length > 0) continue;
      }
      if (qualities.length > 0 && v.qualities.length > 0) {
        const anyMatch = qualities.some(q => v.qualities.map(x => String(x).toLowerCase()).includes(String(q).toLowerCase()));
        if (!anyMatch) continue;
      }

      const quals = v.qualities && v.qualities.length > 0 ? v.qualities : ['original'];
      for (const q of quals) {
        const dlBase = v.hlsManifestPath
          ? path.relative(path.resolve(process.cwd(), 'uploads'), v.hlsManifestPath).split(path.sep).join('/')
          : v.originalPath
            ? path.relative(path.resolve(process.cwd(), 'uploads'), v.originalPath).split(path.sep).join('/')
            : null;
        entry.qualities.push({
          quality: q,
          manifestUrl: v.hlsManifestPath ? `${this.uploadsBase()}${dlBase}` : null,
          directUrl: v.originalPath ? `${this.uploadsBase()}${dlBase}` : null,
          downloadUrl: v.originalPath
            ? `/devices/offline/download/${path.relative(path.resolve(process.cwd(), 'uploads'), v.originalPath).split(path.sep).join('/')}`
            : null,
          sizeBytes: this.safeSize(v.originalPath),
          duration: v.duration,
          status: v.status,
        });
      }
      if (includeSubtitles && Array.isArray(v.subtitleTracks)) {
        for (const raw of v.subtitleTracks) {
          if (!raw) continue;
          const [lang, pth] = String(raw).split('|');
          if (pth && fs.existsSync(pth)) {
            const rel = path.relative(path.resolve(process.cwd(), 'uploads'), pth).split(path.sep).join('/');
            entry.subtitles.push({
              lang: lang || 'en',
              url: `${this.uploadsBase()}${rel}`,
              downloadUrl: `/devices/offline/download/${rel}`,
              sizeBytes: this.safeSize(pth),
            });
          }
        }
      }
    }

    return entry;
  }

  private uploadsBase(): string {
    return '/uploads/';
  }

  private safeSize(p?: string): number {
    if (!p || !existsSync(p)) return 0;
    try { return statSync(p).size; } catch { return 0; }
  }

  private guessContentType(p: string): string {
    const e = extname(p).toLowerCase();
    switch (e) {
      case '.mp4': return 'video/mp4';
      case '.m4v': return 'video/x-m4v';
      case '.mkv': return 'video/x-matroska';
      case '.webm': return 'video/webm';
      case '.ts': return 'video/mp2t';
      case '.m3u8': return 'application/vnd.apple.mpegurl';
      case '.mpd': return 'application/dash+xml';
      case '.m4s': return 'video/iso.segment';
      case '.vtt': return 'text/vtt';
      case '.srt': return 'application/x-subrip';
      case '.jpg': case '.jpeg': return 'image/jpeg';
      case '.png': return 'image/png';
      case '.gif': return 'image/gif';
      default: return 'application/octet-stream';
    }
  }
}
