import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { redisStore } from 'cache-manager-redis-yet';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MoviesModule } from './movies/movies.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GenresModule } from './genres/genres.module';
import { TVShowsModule } from './tv-shows/tv-shows.module';
import { TmdbModule } from './tmdb/tmdb.module';
import { VideosModule } from './videos/videos.module';
import { ImdbModule } from './imdb/imdb.module';
import { CsvImportModule } from './csv-import/csv-import.module';

import { StorageModule } from './storage/storage.module';
import { XtreamApiModule } from './xtream-api/xtream-api.module';
import { ServerHealthModule } from './server-health/server-health.module';
import { MediaSyncModule } from './media-sync/media-sync.module';
import { MediaAssetsModule } from './media-assets/media-assets.module';
import { TranscodingModule } from './transcoding/transcoding.module';
import { FanartModule } from './fanart/fanart.module';
import { DevicesModule } from './devices/devices.module';
import { DlnaModule } from './dlna/dlna.module';
import { TvChannelsModule } from './tv-channels/tv-channels.module';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '../uploads'),
      serveRoot: '/uploads',
    }),
    ScheduleModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: true,
          },
        },
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        let store: any;
        try {
          store = await redisStore({
            socket: {
              host: process.env.REDIS_HOST || 'localhost',
              port: parseInt(process.env.REDIS_PORT || '6379'),
            },
            ttl: 60 * 1000,
          });
        } catch (e) {
          store = 'memory';
        }
        return { store };
      },
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'playflix.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: 'all',
    }),
    StorageModule,
    MoviesModule,
    GenresModule,
    TVShowsModule,
    UsersModule,
    AuthModule,
    TmdbModule,
    VideosModule,
    ImdbModule,
    CsvImportModule,
    XtreamApiModule,
    ServerHealthModule,
    MediaSyncModule,
    MediaAssetsModule,
    TranscodingModule,
    FanartModule,
    DevicesModule,
    DlnaModule,
    TvChannelsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
