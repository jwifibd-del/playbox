import { diskStorage, memoryStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { BadRequestException } from '@nestjs/common';

export const UPLOADS_ROOT = path.resolve(process.cwd(), 'uploads');
export const UPLOADS_VIDEOS_DIR = path.join(UPLOADS_ROOT, 'videos');
export const UPLOADS_THUMBNAILS_DIR = path.join(UPLOADS_ROOT, 'thumbnails');
export const UPLOADS_SUBTITLES_DIR = path.join(UPLOADS_ROOT, 'subtitles');
export const UPLOADS_TEMP_DIR = path.join(UPLOADS_ROOT, 'temp');
export const UPLOADS_STORAGE_DIR = path.join(UPLOADS_ROOT, 'storage');
export const UPLOADS_TRANSCODED_DIR = path.join(UPLOADS_ROOT, 'transcoded');

export function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function ensureAllUploadDirs(): void {
  ensureDir(UPLOADS_ROOT);
  ensureDir(UPLOADS_VIDEOS_DIR);
  ensureDir(UPLOADS_THUMBNAILS_DIR);
  ensureDir(UPLOADS_SUBTITLES_DIR);
  ensureDir(UPLOADS_TEMP_DIR);
  ensureDir(UPLOADS_STORAGE_DIR);
  ensureDir(UPLOADS_TRANSCODED_DIR);
}

ensureAllUploadDirs();

const VIDEO_EXTENSIONS = [
  '.mp4', '.mov', '.mkv', '.avi', '.webm', '.m4v',
  '.ts', '.m3u8', '.flv', '.wmv', '.mpeg', '.mpg', '.3gp',
];

const VIDEO_MIME_TYPES = [
  'video/mp4', 'video/quicktime', 'video/x-matroska',
  'video/x-msvideo', 'video/webm', 'video/x-m4v',
  'video/mp2t', 'application/vnd.apple.mpegurl',
  'video/x-flv', 'video/x-ms-wmv', 'video/mpeg', 'video/3gpp',
];

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
const IMAGE_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp',
];

const SUBTITLE_EXTENSIONS = ['.vtt', '.srt'];
const SUBTITLE_MIME_TYPES = [
  'text/vtt', 'text/plain', 'application/x-subrip',
];

function matchesExtensions(filename: string, extensions: string[]): boolean {
  const ext = path.extname(filename || '').toLowerCase();
  return extensions.includes(ext);
}

function matchesMime(mimetype: string, allowed: string[]): boolean {
  if (!mimetype) return false;
  const mt = mimetype.toLowerCase();
  return allowed.includes(mt);
}

export const videoFileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  const okExt = matchesExtensions(file.originalname, VIDEO_EXTENSIONS);
  const okMime = matchesMime(file.mimetype, VIDEO_MIME_TYPES);
  if (!okExt && !okMime) {
    return cb(
      new BadRequestException(
        `Invalid video file. Allowed types: ${VIDEO_EXTENSIONS.join(', ')}`,
      ),
      false,
    );
  }
  cb(null, true);
};

export const imageFileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  const okExt = matchesExtensions(file.originalname, IMAGE_EXTENSIONS);
  const okMime = matchesMime(file.mimetype, IMAGE_MIME_TYPES);
  if (!okExt && !okMime) {
    return cb(
      new BadRequestException(
        `Invalid image file. Allowed types: ${IMAGE_EXTENSIONS.join(', ')}`,
      ),
      false,
    );
  }
  cb(null, true);
};

export const subtitleFileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  const okExt = matchesExtensions(file.originalname, SUBTITLE_EXTENSIONS);
  const okMime = matchesMime(file.mimetype, SUBTITLE_MIME_TYPES);
  if (!okExt && !okMime) {
    return cb(
      new BadRequestException(
        `Invalid subtitle file. Allowed types: ${SUBTITLE_EXTENSIONS.join(', ')}`,
      ),
      false,
    );
  }
  cb(null, true);
};

function sanitizeFilename(name: string): string {
  const base = name
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .replace(/-+/g, '-');
  return base || `file-${Date.now()}`;
}

export function makeDiskStorage(destDir: string) {
  return diskStorage({
    destination: (_req, _file, cb) => {
      ensureDir(destDir);
      cb(null, destDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const base = sanitizeFilename(path.basename(file.originalname, ext));
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${base}-${uniqueSuffix}${ext}`);
    },
  });
}

export const videoDiskStorage = makeDiskStorage(UPLOADS_VIDEOS_DIR);
export const thumbnailDiskStorage = makeDiskStorage(UPLOADS_THUMBNAILS_DIR);
export const subtitleDiskStorage = makeDiskStorage(UPLOADS_SUBTITLES_DIR);
export const tempDiskStorage = makeDiskStorage(UPLOADS_TEMP_DIR);

export const multerVideoOptions = {
  storage: videoDiskStorage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 30 * 1024 * 1024 * 1024, // 30 GB
    fieldSize: 30 * 1024 * 1024 * 1024,
  },
};

export const multerThumbnailOptions = {
  storage: thumbnailDiskStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },
};

export const multerSubtitleOptions = {
  storage: subtitleDiskStorage,
  fileFilter: subtitleFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
};

export { memoryStorage };
