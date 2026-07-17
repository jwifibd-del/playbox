import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { XtreamApiService } from './xtream-api.service';
import { XtreamConfig } from './xtream-config.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('xtream-api')
export class XtreamApiController {
  constructor(private readonly xtreamApiService: XtreamApiService) {}

  @Get('configs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getConfigs(): Promise<XtreamConfig[]> {
    return this.xtreamApiService.getAllConfigs();
  }

  @Get('configs/active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getActiveConfig(): Promise<XtreamConfig | null> {
    return this.xtreamApiService.getActiveConfig();
  }

  @Post('configs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createConfig(@Body() configData: Partial<XtreamConfig>): Promise<XtreamConfig> {
    return this.xtreamApiService.createConfig(configData);
  }

  @Put('configs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateConfig(
    @Param('id') id: string,
    @Body() configData: Partial<XtreamConfig>,
  ): Promise<XtreamConfig | null> {
    return this.xtreamApiService.updateConfig(parseInt(id), configData);
  }

  @Delete('configs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteConfig(@Param('id') id: string): Promise<void> {
    return this.xtreamApiService.deleteConfig(parseInt(id));
  }

  @Post('configs/:id/authenticate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async authenticateConfig(@Param('id') id: string): Promise<any> {
    const config = await this.xtreamApiService.getConfigById(parseInt(id));
    if (!config) throw new Error('Config not found');
    return this.xtreamApiService.authenticate(config);
  }

  @Get('live/categories')
  @UseGuards(JwtAuthGuard)
  async getLiveCategories(): Promise<any[]> {
    return this.xtreamApiService.getLiveCategories();
  }

  @Get('live/streams')
  @UseGuards(JwtAuthGuard)
  async getLiveStreams(@Query('categoryId') categoryId?: string): Promise<any[]> {
    return this.xtreamApiService.getLiveStreams(categoryId);
  }

  @Get('vod/categories')
  @UseGuards(JwtAuthGuard)
  async getVodCategories(): Promise<any[]> {
    return this.xtreamApiService.getVodCategories();
  }

  @Get('vod/streams')
  @UseGuards(JwtAuthGuard)
  async getVodStreams(@Query('categoryId') categoryId?: string): Promise<any[]> {
    return this.xtreamApiService.getVodStreams(categoryId);
  }

  @Get('series/categories')
  @UseGuards(JwtAuthGuard)
  async getSeriesCategories(): Promise<any[]> {
    return this.xtreamApiService.getSeriesCategories();
  }

  @Get('series/streams')
  @UseGuards(JwtAuthGuard)
  async getSeriesStreams(@Query('categoryId') categoryId?: string): Promise<any[]> {
    return this.xtreamApiService.getSeriesStreams(categoryId);
  }
}
