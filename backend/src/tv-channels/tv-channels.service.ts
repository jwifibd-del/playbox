import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { TvChannel } from './tv-channel.entity';
import { CreateTvChannelDto } from './create-tv-channel.dto';

@Injectable()
export class TvChannelsService {
  private readonly logger = new Logger(TvChannelsService.name);

  constructor(
    @InjectRepository(TvChannel)
    private tvChannelsRepository: Repository<TvChannel>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(includeInactive = false): Promise<TvChannel[]> {
    const cacheKey = includeInactive ? 'tv-channels:all:with-inactive' : 'tv-channels:all';
    const cached = await this.cacheManager.get<TvChannel[]>(cacheKey);
    if (cached) {
      return cached;
    }

    let channels: TvChannel[];
    if (includeInactive) {
      channels = await this.tvChannelsRepository.find({ order: { order: 'ASC', name: 'ASC' } });
    } else {
      channels = await this.tvChannelsRepository.find({
        where: { isActive: true },
        order: { order: 'ASC', name: 'ASC' },
      });
    }

    await this.cacheManager.set(cacheKey, channels, 60 * 1000);
    return channels;
  }

  async findByCategory(category: string): Promise<TvChannel[]> {
    const cacheKey = `tv-channels:category:${category}`;
    const cached = await this.cacheManager.get<TvChannel[]>(cacheKey);
    if (cached) return cached;

    const channels = await this.tvChannelsRepository.find({
      where: { isActive: true, category },
      order: { order: 'ASC', name: 'ASC' },
    });

    await this.cacheManager.set(cacheKey, channels, 60 * 1000);
    return channels;
  }

  async findFeatured(): Promise<TvChannel[]> {
    const cacheKey = 'tv-channels:featured';
    const cached = await this.cacheManager.get<TvChannel[]>(cacheKey);
    if (cached) return cached;

    const channels = await this.tvChannelsRepository.find({
      where: { isActive: true, isFeatured: true },
      order: { order: 'ASC', name: 'ASC' },
    });

    await this.cacheManager.set(cacheKey, channels, 60 * 1000);
    return channels;
  }

  async findOne(id: string): Promise<TvChannel | null> {
    const cached = await this.cacheManager.get<TvChannel>(`tv-channels:${id}`);
    if (cached) return cached;

    const channel = await this.tvChannelsRepository.findOne({ where: { id } });
    if (channel) {
      await this.cacheManager.set(`tv-channels:${id}`, channel, 60 * 1000);
    }
    return channel;
  }

  async create(dto: CreateTvChannelDto): Promise<TvChannel> {
    const channel = this.tvChannelsRepository.create({
      ...dto,
      order: dto.order ?? 0,
      isHD: dto.isHD ?? false,
      is4K: dto.is4K ?? false,
      isActive: dto.isActive ?? true,
      isFeatured: dto.isFeatured ?? false,
      isPaid: dto.isPaid ?? false,
      viewerCount: dto.viewerCount ?? 0,
      rating: dto.rating ?? 0,
    });
    const saved = await this.tvChannelsRepository.save(channel);
    await this.invalidateCaches();
    return saved;
  }

  async update(id: string, dto: Partial<CreateTvChannelDto>): Promise<TvChannel> {
    const channel = await this.findOne(id);
    if (!channel) {
      throw new NotFoundException('TV Channel not found');
    }

    const fields: (keyof CreateTvChannelDto)[] = [
      'name', 'description', 'logoPath', 'logoThumbPath', 'streamUrl',
      'category', 'language', 'country', 'isHD', 'is4K', 'order',
      'isActive', 'isFeatured', 'epgId', 'nowPlaying', 'nextProgram',
      'viewerCount', 'rating', 'timezone', 'isPaid', 'packageName',
    ];
    for (const field of fields) {
      if (dto[field] !== undefined) {
        (channel as any)[field] = dto[field];
      }
    }

    const updated = await this.tvChannelsRepository.save(channel);
    await this.invalidateCaches(id);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.tvChannelsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('TV Channel not found');
    }
    await this.invalidateCaches(id);
  }

  private async invalidateCaches(id?: string) {
    const keys = [
      'tv-channels:all',
      'tv-channels:all:with-inactive',
      'tv-channels:featured',
    ];
    if (id) keys.push(`tv-channels:${id}`);
    try {
      for (const k of keys) await this.cacheManager.del(k);
    } catch (e) {
      this.logger.warn(`Cache invalidation warning: ${(e as Error)?.message}`);
    }
  }
}
