import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import * as path from 'path';

type StorageProvider = 'local' | 's3' | 'r2';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly provider: StorageProvider;
  private s3Client: S3Client | null = null;
  private readonly bucketName: string;
  private readonly localBasePath: string;
  private readonly publicBaseUrl: string;

  constructor(private configService: ConfigService) {
    this.provider = (this.configService.get<string>('STORAGE_PROVIDER') || 'local') as StorageProvider;
    this.bucketName = this.configService.get<string>('S3_BUCKET_NAME') || this.configService.get<string>('R2_BUCKET_NAME') || '';
    this.localBasePath = this.configService.get<string>('LOCAL_STORAGE_PATH') || './uploads/storage';
    this.publicBaseUrl = this.configService.get<string>('STORAGE_PUBLIC_URL') || '';

    if (this.provider === 's3' || this.provider === 'r2') {
      this.s3Client = new S3Client({
        region: this.configService.get<string>('AWS_REGION') || 'auto',
        credentials: {
          accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || this.configService.get<string>('R2_ACCESS_KEY_ID') || '',
          secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || this.configService.get<string>('R2_SECRET_ACCESS_KEY') || '',
        },
        ...(this.provider === 'r2' ? {
          endpoint: this.configService.get<string>('R2_ENDPOINT'),
        } : {}),
      });
    }

    if (this.provider === 'local' && !fs.existsSync(this.localBasePath)) {
      fs.mkdirSync(this.localBasePath, { recursive: true });
    }
  }

  async uploadFile(key: string, filePath: string, contentType?: string): Promise<string> {
    try {
      if (this.provider === 'local') {
        const destPath = path.join(this.localBasePath, key);
        const dir = path.dirname(destPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.copyFileSync(filePath, destPath);
        return `${this.publicBaseUrl}/${key}`;
      } else if (this.s3Client) {
        const fileContent = fs.readFileSync(filePath);
        await this.s3Client.send(new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: fileContent,
          ContentType: contentType,
        }));
        if (this.provider === 'r2') {
          return `${this.publicBaseUrl}/${key}`;
        }
        return `https://${this.bucketName}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${key}`;
      }
      throw new Error('Storage provider not configured');
    } catch (error) {
      this.logger.error('Error uploading file:', error);
      throw error;
    }
  }

  async getFileUrl(key: string, expiresIn = 3600): Promise<string> {
    if (this.provider === 'local') {
      return `${this.publicBaseUrl}/${key}`;
    } else if (this.s3Client) {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      return getSignedUrl(this.s3Client, command, { expiresIn });
    }
    throw new Error('Storage provider not configured');
  }

  async deleteFile(key: string): Promise<void> {
    try {
      if (this.provider === 'local') {
        const filePath = path.join(this.localBasePath, key);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } else if (this.s3Client) {
        await this.s3Client.send(new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }));
      }
    } catch (error) {
      this.logger.error('Error deleting file:', error);
      throw error;
    }
  }

  getLocalPath(key: string): string {
    return path.join(this.localBasePath, key);
  }

  ensureLocalDir(dirPath: string): void {
    const fullPath = path.join(this.localBasePath, dirPath);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  }
}
