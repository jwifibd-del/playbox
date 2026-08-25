import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { normalizeRating } from './data';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRating(value: unknown, digits = 1, fallback = '0.0'): string {
  const n = normalizeRating(value, NaN);
  if (!Number.isFinite(n)) return fallback;
  try {
    return n.toFixed(digits);
  } catch {
    return fallback;
  }
}

export function maskStreamUrl(url: string, options?: { head?: number; tail?: number }): string {
  const trimmed = (url || '').trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    const origin = parsed.origin;
    const segments = parsed.pathname.split('/').filter(Boolean);
    const filename = segments.length > 0 ? segments[segments.length - 1] : '';
    if (!filename) return origin;
    const parent = segments.length > 1 ? segments[segments.length - 2] : '';
    if (parent) {
      return `${origin}/…/${parent}/${filename}`;
    }
    return `${origin}/…/${filename}`;
  } catch {
    const head = options?.head ?? 14;
    const tail = options?.tail ?? 12;
    const withoutProtocol = trimmed.includes('://') ? trimmed.split('://').slice(1).join('://') : trimmed;
    if (withoutProtocol.length <= head + tail + 3) return withoutProtocol;
    return `${withoutProtocol.slice(0, head)}…${withoutProtocol.slice(-tail)}`;
  }
}
