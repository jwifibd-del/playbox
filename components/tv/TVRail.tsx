'use client';

import type { KeyboardEvent } from 'react';
import { ChevronRight } from 'lucide-react';
import { TVMediaCard, TVRailItem } from '@/components/tv/TVMediaCard';

interface TVRailProps {
  railIndex: number;
  title: string;
  description: string;
  items: TVRailItem[];
}

function findFocusableCard(railIndex: number, itemIndex: number) {
  return document.querySelector<HTMLElement>(
    `[data-tv-focusable="true"][data-tv-rail-index="${railIndex}"][data-tv-item-index="${itemIndex}"]`
  );
}

function focusCard(railIndex: number, itemIndex: number) {
  const sameIndexCard = findFocusableCard(railIndex, itemIndex);
  if (sameIndexCard) {
    sameIndexCard.focus();
    return true;
  }

  const firstCardInRail = document.querySelector<HTMLElement>(
    `[data-tv-focusable="true"][data-tv-rail-index="${railIndex}"]`
  );
  if (firstCardInRail) {
    firstCardInRail.focus();
    return true;
  }

  return false;
}

export function TVRail({ railIndex, title, description, items }: TVRailProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLAnchorElement>, itemIndex: number) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusCard(railIndex, itemIndex + 1);
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusCard(railIndex, Math.max(itemIndex - 1, 0));
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusCard(railIndex + 1, itemIndex);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusCard(Math.max(railIndex - 1, 0), itemIndex);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="tv-section-shell rounded-[32px] px-5 py-6 sm:px-7">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm text-zinc-400 sm:text-base">{description}</p>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/90 px-4 py-2 text-sm text-zinc-300 lg:flex">
          <span>Remote Ready</span>
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>

      <div className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2">
        {items.map((item, itemIndex) => (
          <TVMediaCard
            key={item.id}
            item={item}
            railIndex={railIndex}
            itemIndex={itemIndex}
            onKeyDown={handleKeyDown}
          />
        ))}
      </div>
    </section>
  );
}
