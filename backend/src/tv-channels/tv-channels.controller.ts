import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { TvChannelsService } from './tv-channels.service';
import { TvChannel } from './tv-channel.entity';
import { CreateTvChannelDto } from './create-tv-channel.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('tv-channels')
export class TvChannelsController {
  constructor(private readonly tvChannelsService: TvChannelsService) {}

  @Get()
  findAll(@Query('includeInactive') includeInactive?: string): Promise<TvChannel[]> {
    return this.tvChannelsService.findAll(includeInactive === 'true');
  }

  @Get('featured')
  findFeatured(): Promise<TvChannel[]> {
    return this.tvChannelsService.findFeatured();
  }

  @Get('category/:category')
  findByCategory(@Param('category') category: string): Promise<TvChannel[]> {
    return this.tvChannelsService.findByCategory(category);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<TvChannel | null> {
    return this.tvChannelsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateTvChannelDto): Promise<TvChannel> {
    const normalized = {
      ...dto,
      order: typeof dto.order === 'string' ? parseInt(dto.order, 10) : dto.order,
      viewerCount: typeof dto.viewerCount === 'string' ? parseInt(dto.viewerCount, 10) : dto.viewerCount,
      rating: typeof dto.rating === 'string' ? parseFloat(dto.rating) : dto.rating,
      isHD: typeof dto.isHD === 'string' ? dto.isHD === 'true' : dto.isHD,
      is4K: typeof dto.is4K === 'string' ? dto.is4K === 'true' : dto.is4K,
      isActive: typeof dto.isActive === 'string' ? dto.isActive === 'true' : dto.isActive,
      isFeatured: typeof dto.isFeatured === 'string' ? dto.isFeatured === 'true' : dto.isFeatured,
      isPaid: typeof dto.isPaid === 'string' ? dto.isPaid === 'true' : dto.isPaid,
    };
    return this.tvChannelsService.create(normalized);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateTvChannelDto>,
  ): Promise<TvChannel> {
    const normalized = {
      ...dto,
      order: typeof dto.order === 'string' ? parseInt(dto.order, 10) : dto.order,
      viewerCount: typeof dto.viewerCount === 'string' ? parseInt(dto.viewerCount, 10) : dto.viewerCount,
      rating: typeof dto.rating === 'string' ? parseFloat(dto.rating) : dto.rating,
      isHD: typeof dto.isHD === 'string' ? dto.isHD === 'true' : dto.isHD,
      is4K: typeof dto.is4K === 'string' ? dto.is4K === 'true' : dto.is4K,
      isActive: typeof dto.isActive === 'string' ? dto.isActive === 'true' : dto.isActive,
      isFeatured: typeof dto.isFeatured === 'string' ? dto.isFeatured === 'true' : dto.isFeatured,
      isPaid: typeof dto.isPaid === 'string' ? dto.isPaid === 'true' : dto.isPaid,
    };
    return this.tvChannelsService.update(id, normalized);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string): Promise<void> {
    return this.tvChannelsService.remove(id);
  }
}
