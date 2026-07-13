import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiveTVChannel } from './live-tv-channel.entity';
import * as fs from 'fs';

interface M3UChannel {
  name: string;
  streamUrl: string;
  logoUrl?: string;
  category?: string;
  tvgId?: string;
  tvgName?: string;
  tvgLogo?: string;
  groupTitle?: string;
}

@Injectable()
export class LiveTVService {
  private readonly logger = new Logger(LiveTVService.name);

  constructor(
    @InjectRepository(LiveTVChannel)
    private liveTVChannelRepository: Repository<LiveTVChannel>,
  ) {}

  async findAll(): Promise<LiveTVChannel[]> {
    return this.liveTVChannelRepository.find({ order: { sortOrder: 'ASC' } });
  }

  async create(channelData: Partial<LiveTVChannel>): Promise<LiveTVChannel> {
    const channel = this.liveTVChannelRepository.create(channelData);
    return this.liveTVChannelRepository.save(channel);
  }

  async importFromM3U(filePath: string): Promise<{ imported: number; errors: string[] }> {
    const errors: string[] = [];
    let imported = 0;

    try {
      const m3uContent = fs.readFileSync(filePath, 'utf8');
      const channels = this.parseM3U(m3uContent);

      for (const channel of channels) {
        try {
          const exists = await this.liveTVChannelRepository.findOne({ where: { streamUrl: channel.streamUrl } });
          if (!exists) {
            await this.create({
              name: channel.name,
              streamUrl: channel.streamUrl,
              logoUrl: channel.logoUrl || channel.tvgLogo,
              category: channel.category || channel.groupTitle,
            });
            imported++;
          }
        } catch (error) {
          this.logger.error(`Error importing channel ${channel.name}:`, error);
          errors.push(`Failed to import "${channel.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      fs.unlink(filePath, (err) => {
        if (err) this.logger.error('Error deleting temporary M3U file:', err);
      });

      return { imported, errors };
    } catch (error) {
      this.logger.error('Error parsing M3U file:', error);
      throw error;
    }
  }

  private parseM3U(content: string): M3UChannel[] {
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    const channels: M3UChannel[] = [];
    let currentChannel: Partial<M3UChannel> = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('#EXTINF:')) {
        currentChannel = this.parseExtInf(line);
      } else if (line && !line.startsWith('#')) {
        if (currentChannel.name || line) {
          channels.push({
            name: currentChannel.name || line,
            streamUrl: line,
            ...currentChannel,
          });
        }
        currentChannel = {};
      }
    }

    return channels;
  }

  private parseExtInf(line: string): Partial<M3UChannel> {
    const channel: Partial<M3UChannel> = {};
    const parts = line.slice(8).split(',');
    if (parts.length > 1) {
      channel.name = parts[parts.length - 1].trim();
    }

    const attrsMatch = parts[0].match(/([a-zA-Z-]+)="([^"]+)"/g);
    if (attrsMatch) {
      for (const attr of attrsMatch) {
        const [key, value] = attr.split('=');
        const cleanKey = key.replace(/"/g, '').trim();
        const cleanValue = value.replace(/"/g, '').trim();
        
        switch (cleanKey.toLowerCase()) {
          case 'tvg-id':
            channel.tvgId = cleanValue;
            break;
          case 'tvg-name':
            channel.tvgName = cleanValue;
            break;
          case 'tvg-logo':
            channel.tvgLogo = cleanValue;
            break;
          case 'group-title':
            channel.groupTitle = cleanValue;
            break;
        }
      }
    }

    return channel;
  }
}
