'use client';

import type { KeyboardEvent } from 'react';
import Link from 'next/link';
import { Play, Radio, Star, Tv } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TVRailItem {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  href: string;
  imageUrl?: string;
  badge?: string;
  accentColor?: string;
  kind: 'movie' | 'tv' | 'live';
}

interface TVMediaCardProps {
  item: TVRailItem;
  railIndex: number;
  itemIndex: number;
  onKeyDown: (event: KeyboardEvent<HTMLAnchorElement>, itemIndex: number) => void;
}

const kindIconMap = {
  movie: Play,
  tv: Tv,
  live: Radio,
} as const;

export function TVMediaCard({ item, railIndex, itemIndex, onKeyDown }: TVMediaCardProps) {
  const KindIcon = kindIconMap[item.kind];

  return (
    <Link
      href={item.href}
      data-tv-focusable="true"
      data-tv-rail-index={railIndex}
      data-tv-item-index={itemIndex}
      onKeyDown={(event) => onKeyDown(event, itemIndex)}
      onFocus={(event) =>
        event.currentTarget.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        })
      }
      className={cn(
        'tv-focus-ring group relative block w-[320px] flex-shrink-0 snap-start overflow-hidden rounded-[28px] border border-zinc-800 bg-zinc-950/90',
        'sm:w-[360px] xl:w-[400px]'
      )}
    >
      <div className="relative aspect-video overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: item.accentColor || '#dc2626' }}
          >
            <KindIcon className="h-14 w-14 text-white" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
        <div className="absolute left-5 top-5 flex items-center gap-2">
          <span className="rounded-full border border-white/15 bg-black/45 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-100">
            {item.kind === 'live' ? 'Live TV' : item.kind === 'tv' ? 'Series' : 'Movie'}
          </span>
          {item.badge ? (
            <span className="rounded-full bg-amber-400/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-black">
              {item.badge}
            </span>
          ) : null}
        </div>
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-300">
              {item.subtitle}
            </p>
            <h3 className="line-clamp-2 text-2xl font-bold text-white">{item.title}</h3>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md">
            <KindIcon className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="min-w-0">
          <p className="truncate text-sm text-zinc-400">{item.meta}</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/90 px-3 py-1.5 text-sm text-zinc-200">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span>Focus</span>
        </div>
      </div>
    </Link>
  );
}
