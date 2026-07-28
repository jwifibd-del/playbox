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
