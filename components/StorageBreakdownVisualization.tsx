'use client';

import React, { useState, useMemo } from 'react';
import {
  HardDrive,
  Film,
  Sparkles,
  Trash2,
  Plus,
  CheckCircle2,
  Info,
  Layers,
  Smartphone,
  Zap,
  ArrowDownToLine,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StorageDownloadItem {
  id: string;
  title: string;
  size: string;
  quality: string;
  progress?: number;
  status?: string;
  poster?: string;
  posterPath?: string;
  isEncrypted?: boolean;
}

export interface CategoryBreakdown {
  id: '4k' | '1080p' | '720p' | 'audio_meta';
  label: string;
  shortLabel: string;
  sizeMB: number;
  formattedSize: string;
  percentOfDownloads: number;
  percentOfDevice: number;
  count: number;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  badgeBg: string;
  spec: string;
  codec: string;
  description: string;
}

export function parseSizeToMB(sizeStr: string): number {
  if (!sizeStr) return 0;
  const match = sizeStr.match(/([\d.]+)\s*(GB|MB|KB)?/i);
  if (!match) return 0;
  const val = parseFloat(match[1]);
  const unit = (match[2] || 'MB').toUpperCase();
  if (unit === 'GB') return val * 1024;
  if (unit === 'KB') return val / 1024;
  return val;
}

export function formatMB(mb: number): string {
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(1)} GB`;
  }
  return `${Math.round(mb)} MB`;
}

export function categorizeQuality(quality: string): '4k' | '1080p' | '720p' {
  const q = (quality || '').toLowerCase();
  if (q.includes('4k') || q.includes('2160') || q.includes('uhd')) return '4k';
  if (q.includes('1080') || q.includes('fhd') || q.includes('full hd')) return '1080p';
  return '720p';
}

interface StorageBreakdownVisualizationProps {
  items: StorageDownloadItem[];
  deviceTotalGB?: number;
  systemUsedGB?: number;
  isCompact?: boolean; // For inside the simulated phone viewport
  onAddMockDownload?: (category: '4k' | '1080p' | '720p') => void;
  onDeleteDownload?: (id: string) => void;
  onClearCategory?: (category: '4k' | '1080p' | '720p') => void;
  selectedCategory?: 'all' | '4k' | '1080p' | '720p';
  onSelectCategory?: (category: 'all' | '4k' | '1080p' | '720p') => void;
  showQuickActions?: boolean;
}

export function StorageBreakdownVisualization({
  items,
  deviceTotalGB = 128,
  systemUsedGB = 22.4,
  isCompact = false,
  onAddMockDownload,
  onDeleteDownload,
  onClearCategory,
  selectedCategory = 'all',
  onSelectCategory,
  showQuickActions = true,
}: StorageBreakdownVisualizationProps) {
  const [activeTab, setActiveTab] = useState<'all' | '4k' | '1080p' | '720p'>(selectedCategory);
  const [activeHoverCategory, setActiveHoverCategory] = useState<string | null>(null);

  // Sync internal filter if controlled from outside
  const currentCategory = onSelectCategory ? selectedCategory : activeTab;
  const handleCategoryChange = (cat: 'all' | '4k' | '1080p' | '720p') => {
    setActiveTab(cat);
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
  };

  // Compute breakdown metrics
  const stats = useMemo(() => {
    const totalDeviceMB = deviceTotalGB * 1024;
    const systemMB = systemUsedGB * 1024;

    let size4kMB = 0;
    let count4k = 0;
    let size1080pMB = 0;
    let count1080p = 0;
    let size720pMB = 0;
    let count720p = 0;

    items.forEach((item) => {
      const mb = parseSizeToMB(item.size);
      const cat = categorizeQuality(item.quality);
      if (cat === '4k') {
        size4kMB += mb;
        count4k++;
      } else if (cat === '1080p') {
        size1080pMB += mb;
        count1080p++;
      } else {
        size720pMB += mb;
        count720p++;
      }
    });

    // Simulated audio tracks, subtitles & DRM keys overhead (~4% of total video)
    const audioMetaMB = items.length > 0 ? Math.max(120, Math.round((size4kMB + size1080pMB + size720pMB) * 0.04)) : 0;
    const totalDownloadsMB = size4kMB + size1080pMB + size720pMB + audioMetaMB;
    const freeMB = Math.max(0, totalDeviceMB - systemMB - totalDownloadsMB);

    const categories: CategoryBreakdown[] = [
      {
        id: '4k',
        label: '4K Ultra HD',
        shortLabel: '4K UHD',
        sizeMB: size4kMB,
        formattedSize: formatMB(size4kMB),
        percentOfDownloads: totalDownloadsMB > 0 ? (size4kMB / totalDownloadsMB) * 100 : 0,
        percentOfDevice: (size4kMB / totalDeviceMB) * 100,
        count: count4k,
        color: 'bg-purple-500',
        bgColor: 'bg-purple-500/10',
        textColor: 'text-purple-400',
        borderColor: 'border-purple-500/30',
        badgeBg: 'bg-purple-500/20 text-purple-300',
        spec: '2160p • HDR10 / Dolby Vision',
        codec: 'HEVC H.265 (Main 10)',
        description: 'Highest fidelity with expanded dynamic range',
      },
      {
        id: '1080p',
        label: '1080p Full HD',
        shortLabel: '1080p FHD',
        sizeMB: size1080pMB,
        formattedSize: formatMB(size1080pMB),
        percentOfDownloads: totalDownloadsMB > 0 ? (size1080pMB / totalDownloadsMB) * 100 : 0,
        percentOfDevice: (size1080pMB / totalDeviceMB) * 100,
        count: count1080p,
        color: 'bg-amber-400',
        bgColor: 'bg-amber-400/10',
        textColor: 'text-amber-400',
        borderColor: 'border-amber-400/30',
        badgeBg: 'bg-amber-400/20 text-amber-300',
        spec: '1080p • 60fps High Profile',
        codec: 'AVC H.264 / AV1',
        description: 'Optimal balance of crystal clarity & storage',
      },
      {
        id: '720p',
        label: '720p Standard HD',
        shortLabel: '720p HD',
        sizeMB: size720pMB,
        formattedSize: formatMB(size720pMB),
        percentOfDownloads: totalDownloadsMB > 0 ? (size720pMB / totalDownloadsMB) * 100 : 0,
        percentOfDevice: (size720pMB / totalDeviceMB) * 100,
        count: count720p,
        color: 'bg-emerald-400',
        bgColor: 'bg-emerald-400/10',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-400/30',
        badgeBg: 'bg-emerald-400/20 text-emerald-300',
        spec: '720p • Compact Travel Format',
        codec: 'Optimized AVC',
        description: 'Lightweight space-saver for flights and travel',
      },
      {
        id: 'audio_meta',
        label: 'Audio & DRM Licenses',
        shortLabel: 'Audio & DRM',
        sizeMB: audioMetaMB,
        formattedSize: formatMB(audioMetaMB),
        percentOfDownloads: totalDownloadsMB > 0 ? (audioMetaMB / totalDownloadsMB) * 100 : 0,
        percentOfDevice: (audioMetaMB / totalDeviceMB) * 100,
        count: items.length,
        color: 'bg-sky-400',
        bgColor: 'bg-sky-400/10',
        textColor: 'text-sky-400',
        borderColor: 'border-sky-400/30',
        badgeBg: 'bg-sky-400/20 text-sky-300',
        spec: 'Dolby Atmos + Subtitles',
        codec: 'E-AC3 & Widevine L1 Keys',
        description: 'Multi-language audio, closed captions & security tokens',
      },
    ];

    return {
      totalDeviceMB,
      systemMB,
      totalDownloadsMB,
      freeMB,
      formattedTotalDevice: `${deviceTotalGB} GB`,
      formattedSystem: formatMB(systemMB),
      formattedTotalDownloads: formatMB(totalDownloadsMB),
      formattedFree: formatMB(freeMB),
      categories,
    };
  }, [items, deviceTotalGB, systemUsedGB]);

  // Compact layout (designed for smartphone viewport width ~320px)
  if (isCompact) {
    return (
      <div className="space-y-2.5">
        {/* Device Storage Header */}
        <div className="rounded-xl border border-zinc-800/90 bg-zinc-900/90 p-2.5 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <HardDrive className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[11px] font-bold text-white">Device Storage</span>
            </div>
            <span className="text-[10px] font-medium text-zinc-400">
              <strong className="text-zinc-200">{stats.formattedTotalDownloads}</strong> used of {stats.formattedTotalDevice}
            </span>
          </div>

          {/* Multi-segment visual bar */}
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-zinc-800/90 p-0.5 flex gap-0.5">
            {stats.categories.map((cat) => {
              const widthPct = cat.percentOfDevice;
              if (widthPct <= 0) return null;
              return (
                <div
                  key={cat.id}
                  style={{ width: `${Math.max(1.5, widthPct)}%` }}
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    cat.color,
                    activeHoverCategory === cat.id ? 'brightness-125 ring-1 ring-white' : ''
                  )}
                  title={`${cat.label}: ${cat.formattedSize} (${cat.percentOfDownloads.toFixed(1)}% of downloads)`}
                />
              );
            })}
            {/* System storage segment */}
            <div
              style={{ width: `${(stats.systemMB / stats.totalDeviceMB) * 100}%` }}
              className="h-full rounded-full bg-zinc-600/70"
              title={`System & Apps: ${stats.formattedSystem}`}
            />
          </div>

          {/* Legend / Category Chips */}
          <div className="mt-2 flex flex-wrap items-center gap-1 text-[9px]">
            {stats.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  if (cat.id !== 'audio_meta') {
                    handleCategoryChange(currentCategory === cat.id ? 'all' : (cat.id as any));
                  }
                }}
                className={cn(
                  'flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium transition-all',
                  currentCategory === cat.id
                    ? `${cat.bgColor} ${cat.textColor} ring-1 ring-current font-bold`
                    : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', cat.color)} />
                <span>{cat.shortLabel}</span>
                <span className="font-mono text-zinc-500">({cat.formattedSize})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category Breakdown Cards in Compact View */}
        <div className="grid grid-cols-2 gap-1.5">
          {stats.categories
            .filter((c) => c.id !== 'audio_meta')
            .map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleCategoryChange(currentCategory === cat.id ? 'all' : (cat.id as any))}
                className={cn(
                  'cursor-pointer rounded-xl border p-2 transition-all',
                  currentCategory === cat.id
                    ? `${cat.bgColor} ${cat.borderColor} ring-1 ring-amber-400/40`
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn('text-[9px] font-bold uppercase tracking-wider', cat.textColor)}>
                    {cat.shortLabel}
                  </span>
                  <span className="rounded bg-black/40 px-1 py-0.2 text-[8px] font-mono text-zinc-400">
                    {cat.count} {cat.count === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xs font-black text-white">{cat.formattedSize}</span>
                  <span className="text-[9px] font-semibold text-zinc-400">
                    {cat.percentOfDownloads.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
        </div>

        {/* Quick Simulated Download Controls */}
        {showQuickActions && onAddMockDownload && (
          <div className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-1.5">
            <span className="text-[9px] font-semibold text-zinc-400 pl-1">Add Mock:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onAddMockDownload('4k')}
                className="rounded-md bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 px-1.5 py-0.5 text-[8px] font-bold text-purple-300 transition-colors"
              >
                +4K (3.8 GB)
              </button>
              <button
                onClick={() => onAddMockDownload('1080p')}
                className="rounded-md bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/40 px-1.5 py-0.5 text-[8px] font-bold text-amber-300 transition-colors"
              >
                +1080p (1.6 GB)
              </button>
              <button
                onClick={() => onAddMockDownload('720p')}
                className="rounded-md bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/40 px-1.5 py-0.5 text-[8px] font-bold text-emerald-300 transition-colors"
              >
                +720p (750 MB)
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full detailed desktop / expanded mobile dashboard
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Mobile Storage Breakdown
              </h3>
              <p className="text-xs md:text-sm text-zinc-400">
                Detailed allocation across resolution tiers, audio tracks & DRM storage
              </p>
            </div>
          </div>
        </div>

        {/* Global Storage Meter Summary */}
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5">
          <div className="text-right">
            <p className="text-[11px] font-semibold text-zinc-400">Downloads Allocated</p>
            <p className="text-base font-black text-amber-400">{stats.formattedTotalDownloads}</p>
          </div>
          <div className="h-8 w-px bg-zinc-800" />
          <div>
            <p className="text-[11px] font-semibold text-zinc-400">Free Space</p>
            <p className="text-base font-black text-emerald-400">{stats.formattedFree}</p>
          </div>
        </div>
      </div>

      {/* Main Stacked Storage Progress Bar */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
          <span>Storage Utilization Overview</span>
          <span>
            {stats.formattedTotalDownloads} of {stats.formattedTotalDevice} ({((stats.totalDownloadsMB / stats.totalDeviceMB) * 100).toFixed(1)}% used)
          </span>
        </div>

        {/* Multi-tier bar */}
        <div className="relative h-6 w-full overflow-hidden rounded-2xl bg-zinc-900 p-1 flex gap-1 border border-zinc-800/80 shadow-inner">
          {stats.categories.map((cat) => {
            const widthPct = cat.percentOfDevice;
            if (widthPct <= 0) return null;
            return (
              <div
                key={cat.id}
                onMouseEnter={() => setActiveHoverCategory(cat.id)}
                onMouseLeave={() => setActiveHoverCategory(null)}
                style={{ width: `${Math.max(1.8, widthPct)}%` }}
                className={cn(
                  'h-full rounded-xl transition-all duration-300 relative group cursor-pointer',
                  cat.color,
                  activeHoverCategory === cat.id ? 'ring-2 ring-white scale-[1.02] z-10 brightness-110' : 'hover:brightness-110'
                )}
              >
                {/* Floating tooltip on bar hover */}
                <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-30 whitespace-nowrap rounded-lg bg-black/90 px-2 py-1 text-[10px] font-bold text-white border border-zinc-700 shadow-lg">
                  {cat.label}: {cat.formattedSize} ({cat.percentOfDownloads.toFixed(1)}%)
                </div>
              </div>
            );
          })}

          {/* System Reserved Segment */}
          <div
            style={{ width: `${(stats.systemMB / stats.totalDeviceMB) * 100}%` }}
            className="h-full rounded-xl bg-zinc-700/60 transition-all hover:bg-zinc-700 relative group cursor-help"
          >
            <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-30 whitespace-nowrap rounded-lg bg-black/90 px-2 py-1 text-[10px] font-bold text-zinc-300 border border-zinc-700">
              System OS & Apps: {stats.formattedSystem}
            </div>
          </div>

          {/* Free Segment remainder */}
          <div
            style={{ width: `${(stats.freeMB / stats.totalDeviceMB) * 100}%` }}
            className="h-full rounded-xl bg-emerald-500/10 transition-all relative group cursor-help"
          >
            <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-30 whitespace-nowrap rounded-lg bg-black/90 px-2 py-1 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
              Available Free Storage: {stats.formattedFree}
            </div>
          </div>
        </div>

        {/* Legend Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {stats.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  if (cat.id !== 'audio_meta') {
                    handleCategoryChange(currentCategory === cat.id ? 'all' : (cat.id as any));
                  }
                }}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-2 py-1 font-medium transition-all text-xs',
                  currentCategory === cat.id
                    ? `${cat.bgColor} ${cat.textColor} ring-1 ring-current font-bold`
                    : 'text-zinc-400 hover:text-white'
                )}
              >
                <span className={cn('h-2.5 w-2.5 rounded-full', cat.color)} />
                <span>{cat.label}</span>
                <span className="font-mono text-zinc-400">({cat.formattedSize})</span>
              </button>
            ))}
            <div className="flex items-center gap-2 text-zinc-500 text-xs px-2 py-1">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
              <span>System & Apps</span>
              <span className="font-mono text-zinc-400">({stats.formattedSystem})</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold px-2 py-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span>Available</span>
            <span className="font-mono">({stats.formattedFree})</span>
          </div>
        </div>
      </div>

      {/* Category Cards Detailed Breakdown Grid */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.categories.map((cat) => {
          const isSelected = currentCategory === cat.id;
          return (
            <div
              key={cat.id}
              onClick={() => {
                if (cat.id !== 'audio_meta') {
                  handleCategoryChange(isSelected ? 'all' : (cat.id as any));
                }
              }}
              className={cn(
                'group relative rounded-2xl border p-5 transition-all duration-200 cursor-pointer overflow-hidden',
                isSelected
                  ? `${cat.bgColor} ${cat.borderColor} ring-2 ring-amber-400/50 shadow-lg`
                  : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900/90'
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn('rounded-lg px-2.5 py-1 text-xs font-black uppercase tracking-wider', cat.badgeBg)}>
                  {cat.shortLabel}
                </span>
                <span className="text-xs font-semibold text-zinc-400">
                  {cat.count} {cat.count === 1 ? 'title' : 'titles'}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-black text-white">{cat.formattedSize}</span>
                  <span className={cn('text-xs font-bold', cat.textColor)}>
                    {cat.percentOfDownloads.toFixed(1)}%
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400 truncate">{cat.spec}</p>
                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">{cat.codec}</p>
              </div>

              {/* Progress bar inside card */}
              <div className="mt-4 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, cat.percentOfDownloads)}%` }}
                  className={cn('h-full rounded-full transition-all duration-500', cat.color)}
                />
              </div>

              <div className="mt-4 flex items-center justify-between pt-2 border-t border-zinc-800/60 text-[11px]">
                <span className="text-zinc-400 font-medium">Device Share</span>
                <span className="font-mono font-bold text-zinc-300">
                  {cat.percentOfDevice.toFixed(1)}% of {stats.formattedTotalDevice}
                </span>
              </div>

              {/* Clean category button */}
              {onClearCategory && cat.id !== 'audio_meta' && cat.count > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearCategory(cat.id as any);
                  }}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950/60 py-1.5 text-xs font-medium text-zinc-400 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear {cat.shortLabel} ({cat.formattedSize})</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Simulator Actions: Add Mock Downloads & Storage Insights */}
      {showQuickActions && (
        <div className="mt-8 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-bold text-white">Simulate Device Storage Changes</span>
              </div>
              <p className="text-xs text-zinc-400">
                Test how high-bitrate 4K UHD vs compressed 1080p and 720p affects mobile storage capacity
              </p>
            </div>

            {onAddMockDownload && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => onAddMockDownload('4k')}
                  className="flex items-center gap-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 px-3 py-2 text-xs font-bold text-purple-300 transition-all hover:scale-105 active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add 4K HDR (+3.8 GB)</span>
                </button>
                <button
                  onClick={() => onAddMockDownload('1080p')}
                  className="flex items-center gap-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-3 py-2 text-xs font-bold text-amber-300 transition-all hover:scale-105 active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add 1080p (+1.6 GB)</span>
                </button>
                <button
                  onClick={() => onAddMockDownload('720p')}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 px-3 py-2 text-xs font-bold text-emerald-300 transition-all hover:scale-105 active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add 720p (+750 MB)</span>
                </button>
              </div>
            )}
          </div>

          {/* Storage Optimization Tip Banner */}
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-xs text-sky-200">
            <Info className="h-4 w-4 shrink-0 text-sky-400" />
            <p>
              <strong>Smart Storage Recommendation:</strong> 4K Ultra HD files consume ~2.5× more space than 1080p. On mobile screens below 7 inches, 1080p FHD delivers indistinguishable visual sharpness while saving over 60% of device storage.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
