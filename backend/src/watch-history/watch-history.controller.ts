import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { WatchHistoryService } from './watch-history.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateWatchHistoryDto, GetWatchHistoryQueryDto } from './dto/watch-history.dto';

@Controller('watch-history')
@UseGuards(JwtAuthGuard)
export class WatchHistoryController {
  constructor(private readonly service: WatchHistoryService) {}

  @Get()
  list(
    @Request() req: any,
    @Query() query: GetWatchHistoryQueryDto,
  ) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    return this.service.listForUser(userId, query.take || 24, query.includeCompleted === true);
  }

  @Get('progress')
  getProgress(
    @Request() req: any,
    @Query('movieId') movieId?: string,
    @Query('tvShowId') tvShowId?: string,
    @Query('episodeId') episodeId?: string,
  ) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    return this.service.getProgressForVideo(userId, { movieId, tvShowId, episodeId });
  }

  @Post()
  @HttpCode(200)
  upsert(@Request() req: any, @Body() dto: UpdateWatchHistoryDto) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    return this.service.upsertProgress(userId, dto);
  }

  @Delete('clear')
  @HttpCode(204)
  async clearAll(@Request() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    await this.service.clearForUser(userId);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Request() req: any, @Param('id') id: string) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    await this.service.remove(userId, id);
  }
}
