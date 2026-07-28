import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { DlnaService } from './dlna.service';
import { DlnaDevice, DlnaDeviceStatus } from './dlna-device.entity';
import { CastToDlnaDto, DlnaBrowseDto, DlnaPlaybackControlDto, UpdateDlnaDeviceDto } from './dto/dlna.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('dlna')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DlnaController {
  constructor(private readonly dlna: DlnaService) {}

  @Get('devices')
  @Roles('admin', 'user')
  getDevices(@Query('status') status?: DlnaDeviceStatus): Promise<DlnaDevice[]> {
    return this.dlna.findAll(status);
  }

  @Get('devices/:id')
  @Roles('admin', 'user')
  getDevice(@Param('id') id: string) {
    return this.dlna.findOne(id);
  }

  @Put('devices/:id')
  @Roles('admin')
  updateDevice(@Param('id') id: string, @Body() dto: UpdateDlnaDeviceDto) {
    return this.dlna.update(id, dto);
  }

  @Delete('devices/:id')
  @Roles('admin')
  removeDevice(@Param('id') id: string) {
    return this.dlna.remove(id);
  }

  @Post('discover')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'user')
  triggerDiscover() {
    return this.dlna.discoverAll();
  }

  @Post('devices/:id/discover')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'user')
  refreshDevice(@Param('id') id: string) {
    return this.dlna.discoverById(id);
  }

  @Post('devices/:id/describe')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'user')
  describeDevice(@Param('id') id: string) {
    return this.dlna.fetchDeviceDescription(id);
  }

  @Post('cast')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'user')
  castMedia(@Body() dto: CastToDlnaDto) {
    return this.dlna.castMedia(dto.deviceId, dto);
  }

  @Post('devices/:id/play')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'user')
  play(@Param('id') id: string) {
    return this.dlna.play(id);
  }

  @Post('devices/:id/pause')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'user')
  pause(@Param('id') id: string) {
    return this.dlna.pause(id);
  }

  @Post('devices/:id/stop')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'user')
  stop(@Param('id') id: string) {
    return this.dlna.stop(id);
  }

  @Post('devices/:id/seek')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'user')
  seek(@Param('id') id: string, @Body('seconds') seconds: number) {
    return this.dlna.seek(id, seconds);
  }

  @Post('devices/:id/control')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'user')
  control(@Param('id') id: string, @Body() dto: DlnaPlaybackControlDto) {
    return this.dlna.controlPlayback(id, dto);
  }

  @Get('devices/:id/transport')
  @Roles('admin', 'user')
  transportInfo(@Param('id') id: string) {
    return this.dlna.getTransportInfo(id);
  }

  @Post('devices/:id/browse')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'user')
  browseServer(@Param('id') id: string, @Body() dto: DlnaBrowseDto) {
    return this.dlna.browseServer(id, dto);
  }
}
