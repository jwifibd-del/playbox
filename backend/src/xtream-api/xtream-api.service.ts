import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { XtreamConfig } from './xtream-config.entity';
import { firstValueFrom } from 'rxjs';

interface XtreamAuthResponse {
  user_info: {
    username: string;
    password: string;
    message: string;
    auth: number;
    status: string;
    exp_date: string;
    is_trial: string;
    active_cons: string;
    created_at: string;
    max_connections: string;
  };
  server_info: {
    url: string;
    port: string;
    https_port: string;
    server_protocol: string;
    rtmp_port: string;
    timezone: string;
    timestamp_now: number;
    time_now: string;
  };
}

interface XtreamCategory {
  category_id: string;
  category_name: string;
}

interface XtreamStream {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  epg_channel_id: string;
  added: string;
  is_adult: string;
  category_id: string;
  custom_sid: string;
  tv_archive: number;
  tv_archive_duration: number;
  direct_source: string;
}

interface XtreamVod {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  rating: string;
  rating_5based: number;
  added: string;
  category_id: string;
  container_extension: string;
  custom_sid: string;
  direct_source: string;
}

interface XtreamSerie {
  num: number;
  name: string;
  series_id: number;
  cover: string;
  plot: string;
  cast: string;
  director: string;
  genre: string;
  releaseDate: string;
  last_modified: string;
  rating: string;
  rating_5based: number;
  backdrop_path: string[];
  youtube_trailer: string;
  episode_run_time: string;
  category_id: string;
}

@Injectable()
export class XtreamApiService {
  private readonly logger = new Logger(XtreamApiService.name);

  constructor(
    @InjectRepository(XtreamConfig)
    private xtreamConfigRepository: Repository<XtreamConfig>,
    private httpService: HttpService,
  ) {}

  async getAllConfigs(): Promise<XtreamConfig[]> {
    return this.xtreamConfigRepository.find();
  }

  async getActiveConfig(): Promise<XtreamConfig | null> {
    return this.xtreamConfigRepository.findOne({ where: { isActive: true } });
  }

  async getConfigById(id: number): Promise<XtreamConfig | null> {
    return this.xtreamConfigRepository.findOne({ where: { id } });
  }

  async createConfig(configData: Partial<XtreamConfig>): Promise<XtreamConfig> {
    if (configData.isActive) {
      await this.xtreamConfigRepository.update({}, { isActive: false });
    }
    const config = this.xtreamConfigRepository.create(configData);
    return this.xtreamConfigRepository.save(config);
  }

  async updateConfig(id: number, configData: Partial<XtreamConfig>): Promise<XtreamConfig | null> {
    if (configData.isActive) {
      await this.xtreamConfigRepository.update({}, { isActive: false });
    }
    await this.xtreamConfigRepository.update(id, configData);
    return this.xtreamConfigRepository.findOne({ where: { id } });
  }

  async deleteConfig(id: number): Promise<void> {
    await this.xtreamConfigRepository.delete(id);
  }

  async authenticate(config: XtreamConfig): Promise<XtreamAuthResponse> {
    try {
      const url = `${config.serverUrl}/player_api.php?username=${config.username}&password=${config.password}`;
      const response = await firstValueFrom(this.httpService.get(url));
      const authData = response.data as XtreamAuthResponse;
      
      await this.xtreamConfigRepository.update(config.id, { authData: authData as any });
      return authData;
    } catch (error) {
      this.logger.error('Xtream authentication failed:', error);
      throw error;
    }
  }

  async getLiveCategories(config?: XtreamConfig): Promise<XtreamCategory[]> {
    const activeConfig = config || (await this.getActiveConfig());
    if (!activeConfig) throw new Error('No active Xtream config found');

    try {
      const url = `${activeConfig.serverUrl}/player_api.php?username=${activeConfig.username}&password=${activeConfig.password}&action=get_live_categories`;
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data as XtreamCategory[];
    } catch (error) {
      this.logger.error('Failed to get live categories:', error);
      throw error;
    }
  }

  async getLiveStreams(categoryId?: string, config?: XtreamConfig): Promise<XtreamStream[]> {
    const activeConfig = config || (await this.getActiveConfig());
    if (!activeConfig) throw new Error('No active Xtream config found');

    try {
      let url = `${activeConfig.serverUrl}/player_api.php?username=${activeConfig.username}&password=${activeConfig.password}&action=get_live_streams`;
      if (categoryId) {
        url += `&category_id=${categoryId}`;
      }
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data as XtreamStream[];
    } catch (error) {
      this.logger.error('Failed to get live streams:', error);
      throw error;
    }
  }

  async getVodCategories(config?: XtreamConfig): Promise<XtreamCategory[]> {
    const activeConfig = config || (await this.getActiveConfig());
    if (!activeConfig) throw new Error('No active Xtream config found');

    try {
      const url = `${activeConfig.serverUrl}/player_api.php?username=${activeConfig.username}&password=${activeConfig.password}&action=get_vod_categories`;
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data as XtreamCategory[];
    } catch (error) {
      this.logger.error('Failed to get VOD categories:', error);
      throw error;
    }
  }

  async getVodStreams(categoryId?: string, config?: XtreamConfig): Promise<XtreamVod[]> {
    const activeConfig = config || (await this.getActiveConfig());
    if (!activeConfig) throw new Error('No active Xtream config found');

    try {
      let url = `${activeConfig.serverUrl}/player_api.php?username=${activeConfig.username}&password=${activeConfig.password}&action=get_vod_streams`;
      if (categoryId) {
        url += `&category_id=${categoryId}`;
      }
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data as XtreamVod[];
    } catch (error) {
      this.logger.error('Failed to get VOD streams:', error);
      throw error;
    }
  }

  async getSeriesCategories(config?: XtreamConfig): Promise<XtreamCategory[]> {
    const activeConfig = config || (await this.getActiveConfig());
    if (!activeConfig) throw new Error('No active Xtream config found');

    try {
      const url = `${activeConfig.serverUrl}/player_api.php?username=${activeConfig.username}&password=${activeConfig.password}&action=get_series_categories`;
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data as XtreamCategory[];
    } catch (error) {
      this.logger.error('Failed to get series categories:', error);
      throw error;
    }
  }

  async getSeriesStreams(categoryId?: string, config?: XtreamConfig): Promise<XtreamSerie[]> {
    const activeConfig = config || (await this.getActiveConfig());
    if (!activeConfig) throw new Error('No active Xtream config found');

    try {
      let url = `${activeConfig.serverUrl}/player_api.php?username=${activeConfig.username}&password=${activeConfig.password}&action=get_series`;
      if (categoryId) {
        url += `&category_id=${categoryId}`;
      }
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data as XtreamSerie[];
    } catch (error) {
      this.logger.error('Failed to get series streams:', error);
      throw error;
    }
  }

  getStreamUrl(
    streamId: number,
    streamType: 'live' | 'vod' | 'series',
    extension?: string,
    config?: XtreamConfig
  ): string {
    const activeConfig = config || (this.getActiveConfig() as any);
    if (!activeConfig) throw new Error('No active Xtream config found');

    if (streamType === 'live') {
      return `${activeConfig.serverUrl}/live/${activeConfig.username}/${activeConfig.password}/${streamId}.ts`;
    } else if (streamType === 'vod') {
      return `${activeConfig.serverUrl}/movie/${activeConfig.username}/${activeConfig.password}/${streamId}.${extension || 'mkv'}`;
    } else if (streamType === 'series') {
      return `${activeConfig.serverUrl}/series/${activeConfig.username}/${activeConfig.password}/${streamId}.${extension || 'mkv'}`;
    }
    throw new Error('Invalid stream type');
  }
}
