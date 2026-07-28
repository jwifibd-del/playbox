import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as crypto from 'crypto';
import { Device, DevicePlatform } from './device.entity';
import { RegisterDeviceDto, UpdateDeviceDto, HeartbeatDeviceDto } from './dto/devices.dto';

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(
    @InjectRepository(Device)
    private devicesRepository: Repository<Device>,
  ) {}

  async findAll(userId?: string): Promise<Device[]> {
    const where: any = {};
    if (userId) where.userId = userId;
    return this.devicesRepository.find({
      where,
      order: { lastSeenAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Device> {
    const d = await this.devicesRepository.findOne({ where: { id } });
    if (!d) throw new NotFoundException('Device not found');
    return d;
  }

  async findByKey(deviceKey: string): Promise<Device | null> {
    return this.devicesRepository.findOne({ where: { deviceKey } });
  }

  async register(dto: RegisterDeviceDto): Promise<{ device: Device; authToken: string }> {
    const existing = await this.findByKey(dto.deviceKey);
    if (existing) {
      Object.assign(existing, dto, { lastSeenAt: new Date(), connectionState: 'online' });
      const saved = await this.devicesRepository.save(existing);
      const authToken = this.issueTokenForDevice(saved);
      return { device: saved, authToken };
    }
    const device = this.devicesRepository.create({
      ...dto,
      name: dto.name || `New ${dto.platform || 'device'}`,
      connectionState: 'online',
      lastSeenAt: new Date(),
      enabled: true,
      offlineEnabled: dto.offlineEnabled ?? true,
      autoSyncOnWifiOnly: true,
      includeSubtitles: true,
      includeAudioTracks: true,
      autoSyncMediaTypes: dto.autoSyncMediaTypes || ['movie', 'tv'],
      preferredQualities: dto.preferredQualities || ['1080p', '720p'],
      capabilities: dto.capabilities || {},
    });
    const saved = await this.devicesRepository.save(device);
    const authToken = this.issueTokenForDevice(saved);
    return { device: saved, authToken };
  }

  async update(id: string, dto: UpdateDeviceDto): Promise<Device> {
    const device = await this.findOne(id);
    Object.assign(device, dto);
    return this.devicesRepository.save(device);
  }

  async heartbeat(id: string, dto: HeartbeatDeviceDto): Promise<Device> {
    const device = await this.findOne(id);
    Object.assign(device, dto, { lastSeenAt: new Date() });
    if (!dto.connectionState) device.connectionState = 'online';
    return this.devicesRepository.save(device);
  }

  async heartbeatByKey(deviceKey: string, dto: HeartbeatDeviceDto): Promise<Device> {
    const device = await this.findByKey(deviceKey);
    if (!device) throw new NotFoundException('Device not found by key');
    Object.assign(device, dto, { lastSeenAt: new Date() });
    if (!dto.connectionState) device.connectionState = 'online';
    return this.devicesRepository.save(device);
  }

  async setSyncState(id: string, state: 'idle' | 'syncing' | 'error', lastSyncAt?: Date): Promise<Device> {
    const device = await this.findOne(id);
    device.connectionState = state;
    if (lastSyncAt) device.lastSyncAt = lastSyncAt;
    device.lastSeenAt = new Date();
    return this.devicesRepository.save(device);
  }

  async findAutoSyncTargets(mediaType: 'movie' | 'tv'): Promise<Device[]> {
    const all = await this.devicesRepository.find({ where: { enabled: true, autoSyncNewContent: true } });
    return all.filter(d => {
      if (!d.offlineEnabled) return false;
      if (!d.autoSyncMediaTypes || d.autoSyncMediaTypes.length === 0) return true;
      return d.autoSyncMediaTypes.includes(mediaType);
    });
  }

  async remove(id: string): Promise<void> {
    const d = await this.findOne(id);
    await this.devicesRepository.remove(d);
  }

  private issueTokenForDevice(device: Device): string {
    const payload = { did: device.id, dk: device.deviceKey, iat: Date.now() };
    const enc = Buffer.from(JSON.stringify(payload)).toString('base64');
    const sig = crypto
      .createHmac('sha256', process.env.JWT_SECRET || 'playflix-device-secret')
      .update(enc)
      .digest('base64url');
    return `${enc}.${sig}`;
  }

  validateDeviceToken(token: string): { did: string; dk: string } | null {
    try {
      const [enc, sig] = token.split('.');
      if (!enc || !sig) return null;
      const expectedSig = crypto
        .createHmac('sha256', process.env.JWT_SECRET || 'playflix-device-secret')
        .update(enc)
        .digest('base64url');
      if (expectedSig !== sig) return null;
      return JSON.parse(Buffer.from(enc, 'base64').toString('utf-8'));
    } catch {
      return null;
    }
  }
}
