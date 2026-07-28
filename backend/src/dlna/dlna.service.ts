import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import * as dgram from 'dgram';
import * as http from 'http';
import { URL } from 'url';
import { DlnaDevice, DlnaDeviceStatus } from './dlna-device.entity';
import {
  CastToDlnaDto,
  DlnaBrowseDto,
  DlnaPlaybackControlDto,
  UpdateDlnaDeviceDto,
  DlnaTransportState,
} from './dto/dlna.dto';

const SSDP_ADDR = '239.255.255.250';
const SSDP_PORT = 1900;
const SSDP_MX = 3;
const ST_MEDIARENDERER = 'urn:schemas-upnp-org:device:MediaRenderer:1';
const ST_MEDIASERVER = 'urn:schemas-upnp-org:device:MediaServer:1';
const ST_ALL = 'ssdp:all';
const ST_ROOTDEVICE = 'upnp:rootdevice';

@Injectable()
export class DlnaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DlnaService.name);
  private ssdpSocket: dgram.Socket | null = null;
  private dmsHttpServer: http.Server | null = null;
  private discoveryTimeouts: NodeJS.Timeout[] = [];
  private readonly serverName: string;
  private readonly serverUuid: string;
  private readonly dmsPort: number;
  private readonly serverUsn: string;

  constructor(
    @InjectRepository(DlnaDevice)
    private readonly dlnaDeviceRepo: Repository<DlnaDevice>,
    private readonly configService: ConfigService,
  ) {
    this.serverName =
      this.configService.get<string>('DLNA_SERVER_NAME') || 'PlayFlix Media Server';
    this.serverUuid =
      this.configService.get<string>('DLNA_SERVER_UUID') || this.generateStableUuid();
    this.dmsPort = parseInt(
      this.configService.get<string>('DLNA_DMS_PORT') || '8200',
      10,
    );
    this.serverUsn = 'uuid:' + this.serverUuid;
  }

  onModuleInit() {
    this.logger.log(
      'DLNA Service initializing - Easy DLNA auto-discovery and DMS content server',
    );
    this.startSsdpListener();
    this.startDmsContentServer();
    setTimeout(() => this.announceDmsAlive(), 800);
    setTimeout(() => this.discoverAll(), 2000);
  }

  onModuleDestroy() {
    this.discoveryTimeouts.forEach((t) => clearTimeout(t));
    this.discoveryTimeouts = [];
    if (this.ssdpSocket) {
      try {
        this.ssdpSocket.close();
      } catch (e) {
        // empty
      }
      this.ssdpSocket = null;
    }
    if (this.dmsHttpServer) {
      try {
        this.dmsHttpServer.close();
      } catch (e) {
        // empty
      }
      this.dmsHttpServer = null;
    }
  }

  private generateStableUuid(): string {
    return 'playflix-dlna-0000-000000000001';
  }

  async findAll(status?: DlnaDeviceStatus): Promise<DlnaDevice[]> {
    const where: any = {};
    if (status) where.status = status;
    return this.dlnaDeviceRepo.find({ where, order: { lastSeenAt: 'DESC' } });
  }

  async findOne(id: string): Promise<DlnaDevice | null> {
    return this.dlnaDeviceRepo.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateDlnaDeviceDto): Promise<DlnaDevice> {
    const dev = await this.dlnaDeviceRepo.findOne({ where: { id } });
    if (!dev) throw new Error('DLNA device not found');
    Object.assign(dev, dto);
    return this.dlnaDeviceRepo.save(dev);
  }

  async remove(id: string) {
    return this.dlnaDeviceRepo.delete({ id });
  }

  async discoverAll(): Promise<{ devicesFound: number }> {
    const targets = [ST_MEDIARENDERER, ST_MEDIASERVER, ST_ROOTDEVICE, ST_ALL];
    let found = 0;
    for (const target of targets) {
      try {
        const result = await this.sendSsdpDiscover(target);
        found += result;
      } catch (e: any) {
        this.logger.debug('SSDP discover failed for ' + target + ': ' + e.message);
      }
    }
    return { devicesFound: found };
  }

  async discoverById(id: string) {
    const dev = await this.dlnaDeviceRepo.findOne({ where: { id } });
    if (!dev) throw new Error('DLNA device not found');
    return this.refreshDevice(dev);
  }

  private startSsdpListener() {
    try {
      const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
      socket.on('error', (err) => {
        this.logger.warn('SSDP socket error: ' + err.message);
      });
      socket.on('listening', () => {
        try {
          socket.addMembership(SSDP_ADDR);
          socket.setMulticastTTL(4);
        } catch (e: any) {
          this.logger.warn('SSDP addMembership failed: ' + e.message);
        }
      });
      socket.on('message', (msg, rinfo) =>
        this.handleSsdpMessage(msg.toString(), rinfo),
      );
      socket.bind(SSDP_PORT, '0.0.0.0', () => {
        this.ssdpSocket = socket;
        this.logger.log('SSDP discovery listener bound on 0.0.0.0:' + SSDP_PORT);
      });
    } catch (e: any) {
      this.logger.error('Failed to bind SSDP socket: ' + e.message);
    }
  }

  private sendSsdpDiscover(st: string, retries = 2): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      if (!this.ssdpSocket) {
        reject(new Error('SSDP socket not ready'));
        return;
      }
      let discovered = 0;
      const mx = SSDP_MX;
      const msgLines = [
        'M-SEARCH * HTTP/1.1',
        'HOST: ' + SSDP_ADDR + ':' + SSDP_PORT,
        'MAN: "ssdp:discover"',
        'MX: ' + mx,
        'ST: ' + st,
        '',
        '',
      ].join('\r\n');
      const buf = Buffer.from(msgLines);
      const timeout = setTimeout(() => resolve(discovered), (mx + 1) * 1000);
      this.discoveryTimeouts.push(timeout);
      const onMessage = (msg: Buffer, rinfo: dgram.RemoteInfo) => {
        const text = msg.toString();
        if (text.startsWith('HTTP/1.1 200 OK')) {
          const locationMatch = /LOCATION:\s*(\S+)/i.exec(text);
          const location = locationMatch ? locationMatch[1] : undefined;
          const usnMatch = /USN:\s*(\S+)/i.exec(text);
          const usn = usnMatch ? usnMatch[1] : rinfo.address + ':' + location;
          const stMatch = /ST:\s*(\S+)/i.exec(text);
          const stResp = stMatch ? stMatch[1] : st;
          if (location) {
            discovered++;
            this.handleDiscoveredDevice({
              location: location,
              usn: usn,
              st: stResp,
              ip: rinfo.address,
            });
          }
        }
      };
      this.ssdpSocket!.on('message', onMessage);
      let attempts = 0;
      const doSend = () => {
        try {
          this.ssdpSocket!.send(buf, 0, buf.length, SSDP_PORT, SSDP_ADDR);
          attempts++;
          if (attempts < retries) {
            const retryT = setTimeout(doSend, 500);
            this.discoveryTimeouts.push(retryT);
          }
        } catch (e: any) {
          this.logger.warn('SSDP send failed: ' + e.message);
        }
      };
      doSend();
      setTimeout(() => {
        this.ssdpSocket?.off('message', onMessage);
      }, (mx + 1) * 1000);
    });
  }

  private handleSsdpMessage(text: string, rinfo: dgram.RemoteInfo) {
    try {
      const notifyMatch = /^NOTIFY \* HTTP\/1\.1/i.test(text);
      const locMatch = /LOCATION:\s*(\S+)/i.exec(text);
      const location = locMatch ? locMatch[1] : undefined;
      if (location) {
        const usnMatch = /USN:\s*(\S+)/i.exec(text);
        const usn = usnMatch ? usnMatch[1] : undefined;
        const ntsMatch = /NTS:\s*(\S+)/i.exec(text);
        const nts = ntsMatch ? ntsMatch[1] : undefined;
        const ntMatch = /NT:\s*(\S+)/i.exec(text);
        const stRespMatch = /ST:\s*(\S+)/i.exec(text);
        const st = (ntMatch ? ntMatch[1] : undefined) || (stRespMatch ? stRespMatch[1] : undefined);
        if (notifyMatch && nts === 'ssdp:byebye') {
          if (usn) {
            this.markOfflineByUdn(usn);
          }
          return;
        }
        this.handleDiscoveredDevice({
          location: location,
          usn: usn || rinfo.address + ':' + location,
          st: st || 'ssdp:rootdevice',
          ip: rinfo.address,
        });
      }
    } catch (e: any) {
      this.logger.debug('SSDP message parse error: ' + e.message);
    }
  }

  private async handleDiscoveredDevice(info: {
    location: string;
    usn: string;
    st: string;
    ip: string;
  }) {
    try {
      const existing = await this.dlnaDeviceRepo.findOne({
        where: [{ udn: info.usn }],
      });
      if (!existing) {
        const parsed = this.parseUdn(info.usn);
        const portMatch = /:(\d+)$/.exec(info.location);
        const locationUrl = new URL(info.location);
        const newDev = this.dlnaDeviceRepo.create({
          udn: info.usn,
          friendlyName: parsed.udn || info.ip + ':' + (locationUrl.port || (portMatch ? portMatch[1] : '')),
          locationUrl: info.location,
          baseUrl: info.location,
          status: 'discovering' as DlnaDeviceStatus,
          ipAddress: info.ip,
          port: parseInt(locationUrl.port || '80', 10),
          discoverCount: 1,
          lastSeenAt: new Date(),
        });
        await this.dlnaDeviceRepo.save(newDev);
        await this.fetchDeviceDescription(newDev.id);
      } else {
        existing.locationUrl = info.location;
        existing.ipAddress = info.ip;
        try {
          const u = new URL(info.location);
          existing.port = parseInt(u.port || '80', 10);
        } catch (_) {
          // ignore
        }
        existing.lastSeenAt = new Date();
        existing.status = 'online';
        existing.discoverCount = (existing.discoverCount || 0) + 1;
        existing.failedAttempts = 0;
        await this.dlnaDeviceRepo.save(existing);
      }
    } catch (e: any) {
      this.logger.debug('Failed to save discovered DLNA device: ' + e.message);
    }
  }

  private parseUdn(usn: string): { udn: string; rest?: string } {
    const uuidMatch = /uuid:([^:]+)(?:::.+)?$/.exec(usn || '');
    if (uuidMatch) {
      return {
        udn: uuidMatch[0],
        rest: usn.slice(uuidMatch[0].length + 2) || undefined,
      };
    }
    return { udn: usn };
  }

  private async markOfflineByUdn(udn: string) {
    const dev = await this.dlnaDeviceRepo.findOne({ where: [{ udn }] });
    if (dev) {
      dev.status = 'offline';
      await this.dlnaDeviceRepo.save(dev);
    }
  }

  fetchDeviceDescription(id: string): Promise<DlnaDevice | undefined> {
    return new Promise<DlnaDevice | undefined>(async (resolve) => {
      try {
        const dev = await this.dlnaDeviceRepo.findOne({ where: { id } });
        if (!dev) return resolve(undefined);
        const url = new URL(dev.locationUrl);
        const req = http.request(
          {
            host: url.hostname,
            port: url.port || 80,
            method: 'GET',
            path: url.pathname + url.search,
            timeout: 8000,
            headers: {
              'User-Agent': 'PlayFlix/1.0 DLNA/1.0 EasyDLNA/1.0',
            },
          },
          (res) => {
            let xml = '';
            res.setEncoding('utf8');
            res.on('data', (c) => (xml += c));
            res.on('end', async () => {
              try {
                const parsed = this.upnpDeviceXmlToObject(xml);
                Object.assign(dev, {
                  friendlyName: parsed.friendlyName || dev.friendlyName,
                  manufacturer: parsed.manufacturer,
                  manufacturerUrl: parsed.manufacturerURL,
                  modelName: parsed.modelName,
                  modelDescription: parsed.modelDescription,
                  modelNumber: parsed.modelNumber,
                  modelUrl: parsed.modelURL,
                  serialNumber: parsed.serialNumber,
                  deviceClass: (parsed.deviceType || dev.deviceClass) as any,
                  baseUrl: parsed.baseUrl || url.protocol + '//' + url.host + '/',
                  rawDeviceDescription: parsed,
                  isMediaRenderer: /MediaRenderer/i.test(parsed.deviceType || ''),
                  isMediaServer: /MediaServer/i.test(parsed.deviceType || ''),
                  lastSeenAt: new Date(),
                  status: 'online',
                });
                const services: string[] = [];
                const serviceList = Array.isArray(parsed.serviceList)
                  ? parsed.serviceList
                  : [];
                if (serviceList.length) {
                  for (const svc of serviceList) {
                    const serviceType = String(svc.serviceType || '');
                    services.push(serviceType);
                    if (/AVTransport/i.test(serviceType)) {
                      dev.avTransportControlUrl = this.resolveServiceUrl(
                        svc.controlURL,
                        dev.baseUrl,
                      );
                      dev.supportsPlay = true;
                      dev.supportsPause = true;
                      dev.supportsStop = true;
                      dev.supportsSeek = true;
                      dev.isRemoteControllable = true;
                    }
                    if (/RenderingControl/i.test(serviceType)) {
                      dev.renderingControlUrl = this.resolveServiceUrl(
                        svc.controlURL,
                        dev.baseUrl,
                      );
                      dev.supportsSetVolume = true;
                      dev.supportsSetMute = true;
                    }
                    if (/ConnectionManager/i.test(serviceType)) {
                      dev.connectionManagerUrl = this.resolveServiceUrl(
                        svc.controlURL,
                        dev.baseUrl,
                      );
                    }
                    if (/ContentDirectory/i.test(serviceType)) {
                      dev.contentDirectoryUrl = this.resolveServiceUrl(
                        svc.controlURL,
                        dev.baseUrl,
                      );
                      dev.isMediaServer = true;
                    }
                  }
                }
                dev.services = services;
                await this.dlnaDeviceRepo.save(dev);
                resolve(dev);
              } catch (inner) {
                dev.status = 'error';
                dev.failedAttempts = (dev.failedAttempts || 0) + 1;
                await this.dlnaDeviceRepo.save(dev);
                resolve(dev);
              }
            });
          },
        );
        req.on('error', async (err) => {
          dev.status = 'error';
          dev.failedAttempts = (dev.failedAttempts || 0) + 1;
          await this.dlnaDeviceRepo.save(dev);
          resolve(dev);
        });
        req.on('timeout', () => req.destroy(new Error('timeout')));
        req.end();
      } catch (e: any) {
        this.logger.debug('fetch description failed: ' + e.message);
        resolve(undefined);
      }
    });
  }

  private resolveServiceUrl(
    control: string | undefined,
    base: string | undefined,
  ): string | undefined {
    if (!control) return undefined;
    if (/^https?:\/\//i.test(control)) return control;
    if (!base) return control;
    try {
      return new URL(control, base).toString();
    } catch {
      return control;
    }
  }

  private upnpDeviceXmlToObject(xml: string): Record<string, any> {
    const getTag = (name: string): string | undefined => {
      const reSrc = '<' + name + '[^>]*>([\\s\\S]*?)<\\/' + name + '>';
      const re = new RegExp(reSrc, 'i');
      const m = re.exec(xml);
      return m ? this.stripCdata(m[1]).trim() : undefined;
    };
    const stripCdata = (s: string): string =>
      s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
    const services: any[] = [];
    const serviceRe = /<service>([\s\S]*?)<\/service>/gi;
    let sm: RegExpExecArray | null;
    while ((sm = serviceRe.exec(xml)) !== null) {
      const s = sm[1];
      const getS = (n: string): string | undefined => {
        const reS = new RegExp('<' + n + '[^>]*>([\\s\\S]*?)<\\/' + n + '>', 'i');
        const m2 = reS.exec(s);
        return m2 ? stripCdata(m2[1]).trim() : undefined;
      };
      services.push({
        serviceType: getS('serviceType'),
        serviceId: getS('serviceId'),
        controlURL: getS('controlURL'),
        eventSubURL: getS('eventSubURL'),
        SCPDURL: getS('SCPDURL'),
      });
    }
    const iconList: any[] = [];
    const iconRe = /<icon>([\s\S]*?)<\/icon>/gi;
    let im: RegExpExecArray | null;
    while ((im = iconRe.exec(xml)) !== null) {
      const i = im[1];
      const getI = (n: string): string | undefined => {
        const reI = new RegExp('<' + n + '[^>]*>([\\s\\S]*?)<\\/' + n + '>', 'i');
        const m2 = reI.exec(i);
        return m2 ? stripCdata(m2[1]).trim() : undefined;
      };
      iconList.push({
        mimetype: getI('mimetype'),
        width: getI('width'),
        height: getI('height'),
        depth: getI('depth'),
        url: getI('url'),
      });
    }
    return {
      friendlyName: getTag('friendlyName'),
      manufacturer: getTag('manufacturer'),
      manufacturerURL: getTag('manufacturerURL'),
      modelDescription: getTag('modelDescription'),
      modelName: getTag('modelName'),
      modelNumber: getTag('modelNumber'),
      modelURL: getTag('modelURL'),
      serialNumber: getTag('serialNumber'),
      udn: getTag('UDN') || getTag('udn'),
      deviceType: getTag('deviceType'),
      presentationURL: getTag('presentationURL'),
      baseUrl: getTag('URLBase'),
      serviceList: services,
      iconList,
    };
  }

  private async refreshDevice(dev: DlnaDevice): Promise<DlnaDevice | undefined> {
    return this.fetchDeviceDescription(dev.id);
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async periodicRefresh() {
    this.logger.debug('Running periodic DLNA discover refresh');
    this.discoverAll();
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async staleDeviceReaper() {
    try {
      const all = await this.dlnaDeviceRepo.find();
      const now = Date.now();
      for (const d of all) {
        if (d.pinned) continue;
        const cutoff = d.lastSeenAt ? d.lastSeenAt.getTime() : 0;
        const age = (now - cutoff) / 1000;
        if (age > d.cacheControlMaxAge && d.status === 'online') {
          d.status = 'offline';
          await this.dlnaDeviceRepo.save(d);
        }
      }
    } catch (e: any) {
      this.logger.warn('stale reaper: ' + e.message);
    }
  }

  async castMedia(
    deviceId: string,
    dto: CastToDlnaDto,
  ): Promise<{ ok: boolean; message: string }> {
    const dev = await this.dlnaDeviceRepo.findOne({ where: { id: deviceId } });
    if (!dev) throw new Error('DLNA device not found');
    if (!dev.isMediaRenderer || !dev.avTransportControlUrl) {
      throw new Error('Device is not a controllable media renderer');
    }
    const metadata = this.buildDidlLite(dto);
    try {
      await this.upnpSoap(dev.avTransportControlUrl!, 'AVTransport', 'SetAVTransportURI', [
        { name: 'InstanceID', val: '0' },
        { name: 'CurrentURI', val: dto.mediaUrl },
        { name: 'CurrentURIMetaData', val: metadata },
      ]);
    } catch (e: any) {
      this.logger.warn('SetAVTransportURI failed, continuing: ' + e.message);
    }
    try {
      if (typeof dto.initialVolume === 'number') {
        await this.setVolume(dev.renderingControlUrl!, 'Master', dto.initialVolume);
      }
      if (dto.autoPlay !== false) {
        await this.upnpSoap(dev.avTransportControlUrl!, 'AVTransport', 'Play', [
          { name: 'InstanceID', val: '0' },
          { name: 'Speed', val: '1' },
        ]);
      }
      dev.lastPlayingTitle = dto.title || undefined;
      dev.lastPlayingUrl = dto.mediaUrl;
      dev.lastConnectedAt = new Date();
      await this.dlnaDeviceRepo.save(dev);
      return { ok: true, message: 'Casting to ' + dev.friendlyName };
    } catch (e: any) {
      return { ok: false, message: e.message };
    }
  }

  async play(deviceId: string): Promise<{ ok: boolean }> {
    const dev = await this.requireRenderer(deviceId);
    await this.upnpSoap(dev.avTransportControlUrl!, 'AVTransport', 'Play', [
      { name: 'InstanceID', val: '0' },
      { name: 'Speed', val: '1' },
    ]);
    return { ok: true };
  }

  async pause(deviceId: string): Promise<{ ok: boolean }> {
    const dev = await this.requireRenderer(deviceId);
    await this.upnpSoap(dev.avTransportControlUrl!, 'AVTransport', 'Pause', [
      { name: 'InstanceID', val: '0' },
    ]);
    return { ok: true };
  }

  async stop(deviceId: string): Promise<{ ok: boolean }> {
    const dev = await this.requireRenderer(deviceId);
    await this.upnpSoap(dev.avTransportControlUrl!, 'AVTransport', 'Stop', [
      { name: 'InstanceID', val: '0' },
    ]);
    return { ok: true };
  }

  async seek(deviceId: string, seconds: number): Promise<{ ok: boolean }> {
    const dev = await this.requireRenderer(deviceId);
    const target = this.secondsToTimestamp(seconds);
    await this.upnpSoap(dev.avTransportControlUrl!, 'AVTransport', 'Seek', [
      { name: 'InstanceID', val: '0' },
      { name: 'Unit', val: 'REL_TIME' },
      { name: 'Target', val: target },
    ]);
    return { ok: true };
  }

  async controlPlayback(deviceId: string, dto: DlnaPlaybackControlDto) {
    const dev = await this.requireRenderer(deviceId);
    const out: any = {};
    if (typeof dto.volume === 'number') {
      await this.setVolume(dev.renderingControlUrl!, 'Master', dto.volume);
      dev.lastKnownVolume = dto.volume;
      out.volume = dto.volume;
    }
    if (typeof dto.mute === 'boolean') {
      await this.setMute(dev.renderingControlUrl!, 'Master', dto.mute);
      dev.lastKnownMute = dto.mute;
      out.mute = dto.mute;
    }
    if (typeof dto.seekSeconds === 'number') {
      const target = this.secondsToTimestamp(dto.seekSeconds);
      await this.upnpSoap(dev.avTransportControlUrl!, 'AVTransport', 'Seek', [
        { name: 'InstanceID', val: '0' },
        { name: 'Unit', val: 'REL_TIME' },
        { name: 'Target', val: target },
      ]);
      out.seek = target;
    }
    await this.dlnaDeviceRepo.save(dev);
    return out;
  }

  async getTransportInfo(deviceId: string): Promise<{
    currentTransportState: DlnaTransportState;
    currentSpeed: string;
    currentStatus: string;
    trackDuration?: string;
    relTime?: string;
    absTime?: string;
    currentTrack?: number;
    currentTrackDuration?: string;
    currentTrackMetaData?: any;
    volume?: number;
    mute?: boolean;
  }> {
    const dev = await this.requireRenderer(deviceId);
    const info: any = {
      currentTransportState: 'NO_MEDIA_PRESENT',
      currentSpeed: '1',
      currentStatus: 'OK',
    };
    try {
      const r1 = await this.upnpSoap(dev.avTransportControlUrl!, 'AVTransport', 'GetTransportInfo', [
        { name: 'InstanceID', val: '0' },
      ]);
      info.currentTransportState =
        this.extractSoapValue(r1, 'CurrentTransportState') || info.currentTransportState;
      info.currentSpeed = this.extractSoapValue(r1, 'CurrentSpeed') || '1';
    } catch (e) {
      // ignore
    }
    try {
      const r2 = await this.upnpSoap(dev.avTransportControlUrl!, 'AVTransport', 'GetPositionInfo', [
        { name: 'InstanceID', val: '0' },
      ]);
      info.trackDuration = this.extractSoapValue(r2, 'TrackDuration');
      info.relTime = this.extractSoapValue(r2, 'RelTime');
      info.absTime = this.extractSoapValue(r2, 'AbsTime');
      const trk = this.extractSoapValue(r2, 'Track');
      info.currentTrack = trk ? parseInt(trk, 10) : 0;
      info.currentTrackDuration = this.extractSoapValue(r2, 'TrackDuration');
      info.currentTrackMetaData = this.parseDidl(
        this.extractSoapValue(r2, 'TrackMetaData') || '',
      );
    } catch (e) {
      // ignore
    }
    try {
      const r3 = await this.upnpSoap(dev.renderingControlUrl!, 'RenderingControl', 'GetVolume', [
        { name: 'InstanceID', val: '0' },
        { name: 'Channel', val: 'Master' },
      ]);
      const v = this.extractSoapValue(r3, 'CurrentVolume');
      info.volume = v ? parseInt(v, 10) : undefined;
    } catch (e) {
      // ignore
    }
    try {
      const r4 = await this.upnpSoap(dev.renderingControlUrl!, 'RenderingControl', 'GetMute', [
        { name: 'InstanceID', val: '0' },
        { name: 'Channel', val: 'Master' },
      ]);
      const m = this.extractSoapValue(r4, 'CurrentMute');
      info.mute = m === '1' || /true/i.test(m || '');
    } catch (e) {
      // ignore
    }
    return info;
  }

  async browseServer(deviceId: string, dto: DlnaBrowseDto) {
    const dev = await this.dlnaDeviceRepo.findOne({ where: { id: deviceId } });
    if (!dev) throw new Error('DLNA device not found');
    if (!dev.contentDirectoryUrl) {
      throw new Error('Device does not expose a Content Directory');
    }
    return this.upnpSoap(dev.contentDirectoryUrl!, 'ContentDirectory', 'Browse', [
      { name: 'ObjectID', val: dto.objectId || '0' },
      { name: 'BrowseFlag', val: dto.browseFlag || 'BrowseDirectChildren' },
      { name: 'Filter', val: dto.filter || '*' },
      { name: 'StartingIndex', val: String(dto.startingIndex ?? 0) },
      { name: 'RequestedCount', val: String(dto.requestedCount ?? 50) },
      { name: 'SortCriteria', val: dto.sortCriteria || '' },
    ]).then((xml) => {
      const result = this.extractSoapValue(xml, 'Result');
      const total = parseInt(this.extractSoapValue(xml, 'TotalMatches') || '0', 10);
      const numberReturned = parseInt(
        this.extractSoapValue(xml, 'NumberReturned') || '0',
        10,
      );
      return {
        numberReturned: numberReturned,
        totalMatches: total,
        items: this.parseDidl(result || ''),
      };
    });
  }

  private setVolume(ctrlUrl: string, channel: string, volume0to100: number) {
    const v = Math.max(0, Math.min(100, volume0to100));
    return this.upnpSoap(ctrlUrl, 'RenderingControl', 'SetVolume', [
      { name: 'InstanceID', val: '0' },
      { name: 'Channel', val: channel },
      { name: 'DesiredVolume', val: String(v) },
    ]);
  }

  private setMute(ctrlUrl: string, channel: string, mute: boolean) {
    return this.upnpSoap(ctrlUrl, 'RenderingControl', 'SetMute', [
      { name: 'InstanceID', val: '0' },
      { name: 'Channel', val: channel },
      { name: 'DesiredMute', val: mute ? '1' : '0' },
    ]);
  }

  private async requireRenderer(deviceId: string): Promise<DlnaDevice> {
    const dev = await this.dlnaDeviceRepo.findOne({ where: { id: deviceId } });
    if (!dev) throw new Error('DLNA device not found');
    if (!dev.isMediaRenderer || !dev.avTransportControlUrl) {
      throw new Error('Device is not a controllable media renderer');
    }
    return dev;
  }

  private secondsToTimestamp(sec: number): string {
    sec = Math.max(0, Math.floor(sec));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return pad(h) + ':' + pad(m) + ':' + pad(s);
  }

  private upnpSoap(
    controlUrl: string,
    serviceType: string,
    action: string,
    args: { name: string; val: string }[],
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        const fullServiceType = 'urn:schemas-upnp-org:service:' + serviceType + ':1';
        let bodyXml =
          '<?xml version="1.0" encoding="utf-8"?>\n' +
          '<s:Envelope s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">\n' +
          '<s:Body>\n' +
          '<u:' + action + ' xmlns:u="' + fullServiceType + '">\n';
        for (const a of args) {
          bodyXml += '<' + a.name + '>' + this.escapeXml(a.val) + '</' + a.name + '>\n';
        }
        bodyXml +=
          '</u:' + action + '>\n' + '</s:Body>\n' + '</s:Envelope>';
        const url = new URL(controlUrl);
        const postData = Buffer.from(bodyXml, 'utf8');
        const req = http.request(
          {
            hostname: url.hostname,
            port: url.port || 80,
            method: 'POST',
            path: url.pathname + url.search,
            headers: {
              'Content-Type': 'text/xml; charset="utf-8"',
              'Content-Length': postData.length,
              SOAPAction: '"' + fullServiceType + '#' + action + '"',
              'User-Agent': 'PlayFlix/1.0 EasyDLNA/1.0',
            },
            timeout: 10000,
          },
          (res) => {
            let xml = '';
            res.setEncoding('utf8');
            res.on('data', (c) => (xml += c));
            res.on('end', () => {
              if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                resolve(xml);
              } else {
                  reject(
                    new Error(
                      'UPnP ' + action + ' failed: ' + res.statusCode + ' ' + xml.slice(0, 200),
                    ),
                  );
                }
            });
          },
        );
        req.on('error', reject);
        req.on('timeout', () => req.destroy(new Error('timeout')));
        req.write(postData);
        req.end();
      } catch (e) {
        reject(e);
      }
    });
  }

  private extractSoapValue(xml: string, tagName: string): string | undefined {
    const reSrc = '<' + tagName + '[^>]*>([\\s\\S]*?)<\\/' + tagName + '>';
    const re = new RegExp(reSrc, 'i');
    const m = re.exec(xml);
    return m ? this.stripCdata(m[1]).trim() : undefined;
  }

  private stripCdata(s: string): string {
    return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  }

  private escapeXml(s: string): string {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private buildDidlLite(dto: CastToDlnaDto): string {
    const title = this.escapeXml(dto.title || 'PlayFlix Media');
    const contentType = dto.contentType || 'video/mpeg';
    const upnpClass = /^audio/i.test(contentType)
      ? 'object.item.audioItem.musicTrack'
      : /^image/i.test(contentType)
        ? 'object.item.imageItem.photo'
        : 'object.item.videoItem.movie';
    const protocolInfo = 'http-get:*:' + contentType + ':*';
    let body =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<DIDL-Lite xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/"\n' +
      ' xmlns:dc="http://purl.org/dc/elements/1.1/"\n' +
      ' xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/"\n' +
      ' xmlns:dlna="urn:schemas-dlna-org:metadata-1-0/">\n' +
      '  <item id="playflix-1" parentID="0" restricted="1">\n' +
      '    <dc:title>' + title + '</dc:title>\n';
    if (dto.artist) body += '    <upnp:artist>' + this.escapeXml(dto.artist) + '</upnp:artist>\n';
    if (dto.album) body += '    <upnp:album>' + this.escapeXml(dto.album) + '</upnp:album>\n';
    if (dto.genre) body += '    <upnp:genre>' + this.escapeXml(dto.genre) + '</upnp:genre>\n';
    if (dto.posterUrl) {
      body +=
        '    <upnp:albumArtURI xmlns:dlna="urn:schemas-dlna-org:metadata-1-0/">' +
        this.escapeXml(dto.posterUrl) +
        '</upnp:albumArtURI>\n';
    }
    body +=
      '    <upnp:class>' + upnpClass + '</upnp:class>\n' +
      '    <res protocolInfo="' + protocolInfo + '">' + this.escapeXml(dto.mediaUrl) + '</res>\n' +
      '  </item>\n' +
      '</DIDL-Lite>';
    return body;
  }

  private parseDidl(xml: string): any[] {
    const items: any[] = [];
    const reItem = /<item\b([^>]*)>([\s\S]*?)<\/item>/gi;
    const reContainer = /<container\b([^>]*)>([\s\S]*?)<\/container>/gi;
    let m: RegExpExecArray | null;
    const extractAttrs = (attrs: string) => {
      const a: Record<string, string> = {};
      const attrRe = /(\w[\w:-]*)\s*=\s*"([^"]*)"/g;
      let am: RegExpExecArray | null;
      while ((am = attrRe.exec(attrs)) !== null) a[am[1]] = am[2];
      return a;
    };
    const extractChildren = (inner: string) => {
      const obj: Record<string, any> = {};
      const childRe = /<([\w:-]+)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi;
      let cm: RegExpExecArray | null;
      while ((cm = childRe.exec(inner)) !== null) {
        const tag = cm[1].replace(/^[\w-]+:/, '');
        obj[tag] = this.stripCdata(cm[3]).trim();
      }
      const resRe = /<res\b([^>]*)>([\s\S]*?)<\/res>/gi;
      const ress: any[] = [];
      let rm: RegExpExecArray | null;
      while ((rm = resRe.exec(inner)) !== null) {
        ress.push({
          attrs: extractAttrs(rm[1]),
          value: this.stripCdata(rm[2]).trim(),
        });
      }
      if (ress.length) obj.res = ress;
      return obj;
    };
    while ((m = reItem.exec(xml)) !== null) {
      items.push({
        type: 'item',
        attrs: extractAttrs(m[1]),
        ...extractChildren(m[2]),
      });
    }
    while ((m = reContainer.exec(xml)) !== null) {
      items.push({
        type: 'container',
        attrs: extractAttrs(m[1]),
        ...extractChildren(m[2]),
      });
    }
    return items;
  }

  private startDmsContentServer() {
    try {
      this.dmsHttpServer = http.createServer((req, res) => {
        try {
          const hostStr = 'http://' + (req.headers.host || 'localhost');
          const url = new URL(req.url || '/', hostStr);
          if (url.pathname === '/description.xml' || url.pathname === '/rootDesc.xml') {
            const desc = this.buildDmsDescription(url);
            const descBuf = Buffer.from(desc, 'utf8');
            res.writeHead(200, {
              'Content-Type': 'text/xml; charset=utf-8',
              'Content-Length': descBuf.length,
            });
            res.end(descBuf);
            return;
          }
          if (req.method === 'POST' && url.pathname.startsWith('/control/')) {
            let xml = '';
            req.on('data', (c) => (xml += c.toString()));
            req.on('end', () => {
              const action = (req.headers['soapaction'] || '').toString();
              this.handleDmsControl(action, xml)
                .then((respXml) => {
                  const buf = Buffer.from(respXml, 'utf8');
                  res.writeHead(200, {
                    'Content-Type': 'text/xml; charset="utf-8"',
                    'Content-Length': buf.length,
                  });
                  res.end(buf);
                })
                .catch((err) => {
                  const f = this.buildSoapFault(err.message || '500', 500);
                  const fbuf = Buffer.from(f, 'utf8');
                  res.writeHead(500, {
                    'Content-Type': 'text/xml; charset="utf-8"',
                    'Content-Length': fbuf.length,
                  });
                  res.end(fbuf);
                });
            });
            return;
          }
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('PlayFlix DMS');
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end(String(e));
        }
      });
      this.dmsHttpServer.listen(this.dmsPort, '0.0.0.0', () => {
        this.logger.log('PlayFlix DLNA DMS running on port ' + this.dmsPort);
      });
      this.dmsHttpServer.on('error', (err) => {
        this.logger.warn('DMS server error: ' + err.message);
      });
    } catch (e: any) {
      this.logger.warn('Failed to start DMS server: ' + e.message);
    }
  }

  private buildDmsDescription(url: URL): string {
    const safeName = this.escapeXml(this.serverName);
    return (
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<root xmlns="urn:schemas-upnp-org:device-1-0">\n' +
      '  <specVersion><major>1</major><minor>0</minor></specVersion>\n' +
      '  <device>\n' +
      '    <deviceType>urn:schemas-upnp-org:device:MediaServer:1</deviceType>\n' +
      '    <friendlyName>' + safeName + '</friendlyName>\n' +
      '    <manufacturer>PlayFlix</manufacturer>\n' +
      '    <manufacturerURL>https://playflix.local</manufacturerURL>\n' +
      '    <modelDescription>PlayFlix Media Server (Easy DLNA)</modelDescription>\n' +
      '    <modelName>PlayFlix DMS</modelName>\n' +
      '    <modelNumber>1.0</modelNumber>\n' +
      '    <UDN>uuid:' + this.serverUuid + '</UDN>\n' +
      '    <serviceList>\n' +
      '      <service>\n' +
      '        <serviceType>urn:schemas-upnp-org:service:ContentDirectory:1</serviceType>\n' +
      '        <serviceId>urn:upnp-org:serviceId:ContentDirectory</serviceId>\n' +
      '        <controlURL>/control/ContentDirectory</controlURL>\n' +
      '        <eventSubURL>/events/ContentDirectory</eventSubURL>\n' +
      '        <SCPDURL>/ContentDirectory.xml</SCPDURL>\n' +
      '      </service>\n' +
      '      <service>\n' +
      '        <serviceType>urn:schemas-upnp-org:service:ConnectionManager:1</serviceType>\n' +
      '        <serviceId>urn:upnp-org:serviceId:ConnectionManager</serviceId>\n' +
      '        <controlURL>/control/ConnectionManager</controlURL>\n' +
      '        <eventSubURL>/events/ConnectionManager</eventSubURL>\n' +
      '        <SCPDURL>/ConnectionManager.xml</SCPDURL>\n' +
      '      </service>\n' +
      '    </serviceList>\n' +
      '    <presentationURL>/</presentationURL>\n' +
      '  </device>\n' +
      '</root>'
    );
  }

  private async handleDmsControl(
    actionHeader: string,
    body: string,
  ): Promise<string> {
    let m: RegExpExecArray | null = null;
    const re1 = /"urn:schemas-upnp-org:service:([^:"]+):\d+#([^"]+)"/;
    const re2 = /urn:schemas-upnp-org:service:([^:"]+):\d+#([^\s<"]+)/;
    m = re1.exec(actionHeader);
    if (!m) m = re2.exec(actionHeader);
    if (!m) return this.buildSoapFault('Invalid service', 400);
    const service = m[1];
    const action = m[2];
    if (service === 'ConnectionManager' && action === 'GetProtocolInfo') {
      return this.soapResponse('ConnectionManager', 'GetProtocolInfo', [
        { name: 'Source', val: '' },
        { name: 'Sink', val: '' },
      ]);
    }
    if (service === 'ConnectionManager' && action === 'GetCurrentConnectionIDs') {
      return this.soapResponse('ConnectionManager', 'GetCurrentConnectionIDs', [
        { name: 'ConnectionIDs', val: '0' },
      ]);
    }
    if (service === 'ConnectionManager' && action === 'GetCurrentConnectionInfo') {
      return this.soapResponse('ConnectionManager', 'GetCurrentConnectionInfo', [
        { name: 'RcsID', val: '-1' },
        { name: 'AVTransportID', val: '-1' },
        { name: 'ProtocolInfo', val: '' },
        { name: 'PeerConnectionManager', val: '' },
        { name: 'PeerConnectionID', val: '-1' },
        { name: 'Direction', val: 'Output' },
        { name: 'Status', val: 'OK' },
      ]);
    }
    if (service === 'ContentDirectory') {
      if (action === 'GetSearchCapabilities') {
        return this.soapResponse('ContentDirectory', 'GetSearchCapabilities', [
          { name: 'SearchCaps', val: '' },
        ]);
      }
      if (action === 'GetSortCapabilities') {
        return this.soapResponse('ContentDirectory', 'GetSortCapabilities', [
          { name: 'SortCaps', val: '' },
        ]);
      }
      if (action === 'GetSystemUpdateID') {
        return this.soapResponse('ContentDirectory', 'GetSystemUpdateID', [
          { name: 'Id', val: '0' },
        ]);
      }
      if (action === 'Browse') {
        const objectId = this.extractSoapValue(body, 'ObjectID') || '0';
        const browseFlag =
          this.extractSoapValue(body, 'BrowseFlag') || 'BrowseDirectChildren';
        const didl = this.buildDidlRoot(objectId, browseFlag);
        return this.soapResponse('ContentDirectory', 'Browse', [
          { name: 'Result', val: didl },
          { name: 'NumberReturned', val: '0' },
          { name: 'TotalMatches', val: '0' },
          { name: 'UpdateID', val: '0' },
        ]);
      }
    }
    return this.buildSoapFault('Unknown action ' + action, 400);
  }

  private buildDidlRoot(objectId: string, browseFlag: string): string {
    return '<?xml version="1.0" encoding="UTF-8"?><DIDL-Lite xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/"></DIDL-Lite>';
  }

  private soapResponse(
    service: string,
    action: string,
    args: { name: string; val: string }[],
  ): string {
    const fst = 'urn:schemas-upnp-org:service:' + service + ':1';
    let body =
      '<?xml version="1.0" encoding="utf-8"?>\n' +
      '<s:Envelope s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">\n' +
      '<s:Body>\n' +
      '<u:' + action + 'Response xmlns:u="' + fst + '">\n';
    for (const a of args) {
      body += '<' + a.name + '>' + this.escapeXml(a.val) + '</' + a.name + '>\n';
    }
    body +=
      '</u:' + action + 'Response>\n' + '</s:Body>\n' + '</s:Envelope>';
    return body;
  }

  private buildSoapFault(desc: string, code: number): string {
    return (
      '<?xml version="1.0" encoding="utf-8"?>\n' +
      '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">\n' +
      '<s:Body><s:Fault>\n' +
      '<faultcode>s:Client</faultcode>\n' +
      '<faultstring>' + this.escapeXml(desc) + '</faultstring>\n' +
      '<detail><UPnPError xmlns="urn:schemas-upnp-org:control-1-0">' +
      '<errorCode>' + code + '</errorCode>' +
      '<errorDescription>' + this.escapeXml(desc) + '</errorDescription>' +
      '</UPnPError></detail>\n' +
      '</s:Fault></s:Body></s:Envelope>'
    );
  }

  private announceDmsAlive() {
    if (!this.ssdpSocket) return;
    const base = this.serverUsn;
    const types = [
      'uuid:' + this.serverUuid,
      ST_ROOTDEVICE,
      'urn:schemas-upnp-org:device:MediaServer:1',
      'urn:schemas-upnp-org:service:ContentDirectory:1',
      'urn:schemas-upnp-org:service:ConnectionManager:1',
    ];
    const doAnnounce = (nts: string, type: string) => {
      const usnLine =
        nts === 'ssdp:alive' && !type.startsWith('uuid:') ? base + '::' + type : type;
      const lines = [
        'NOTIFY * HTTP/1.1',
        'HOST: ' + SSDP_ADDR + ':' + SSDP_PORT,
        'CACHE-CONTROL: max-age=1800',
        'LOCATION: http://' + this.getMyIp() + ':' + this.dmsPort + '/description.xml',
        'NT: ' + type,
        'NTS: ' + nts,
        'SERVER: PlayFlix/1.0 UPnP/1.0 EasyDLNA/1.0',
        'USN: ' + usnLine,
        'BOOTID.UPNP.ORG: 1',
        '',
        '',
      ].join('\r\n');
      try {
        const buf = Buffer.from(lines);
        this.ssdpSocket!.send(buf, 0, buf.length, SSDP_PORT, SSDP_ADDR);
      } catch (e) {
        // empty
      }
    };
    for (const t of types) {
      doAnnounce('ssdp:alive', t);
    }
  }

  private getMyIp(): string {
    try {
      const nets = require('os').networkInterfaces();
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          if (net.family === 'IPv4' && !net.internal) return net.address;
        }
      }
    } catch (e) {
      // empty
    }
    return '127.0.0.1';
  }
}
