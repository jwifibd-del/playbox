'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Download, DownloadStatus, getDownloads, saveDownloads, getStorageStats, StorageStats, sampleMovies } from '@/lib/data';
import { Pause, Play, Trash2, CheckCircle2, Clock, HardDriveDownload, Sparkles, Filter, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { StorageBreakdownVisualization, categorizeQuality } from '@/components/StorageBreakdownVisualization';

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [storageStats, setStorageStats] = useState<StorageStats>(getStorageStats());
  const [categoryFilter, setCategoryFilter] = useState<'all' | '4k' | '1080p' | '720p'>('all');

  useEffect(() => {
    setDownloads(getDownloads());
    // Simulate download progress
    const interval = setInterval(() => {
      setDownloads(prev => 
        prev.map(download => {
          if (download.status === 'downloading' && download.progress < 100) {
            return {
              ...download,
              progress: Math.min(100, download.progress + 1),
            };
          }
          return download;
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const filteredDownloads = downloads.filter(d => {
    if (categoryFilter === 'all') return true;
    return categorizeQuality(d.quality) === categoryFilter;
  });

  const activeDownloads = filteredDownloads.filter(d => ['downloading', 'paused', 'pending'].includes(d.status));
  const completedDownloads = filteredDownloads.filter(d => d.status === 'completed');

  const togglePause = (id: string) => {
    setDownloads(prev => 
      prev.map(d => {
        if (d.id === id) {
          return {
            ...d,
            status: d.status === 'downloading' ? 'paused' : 'downloading',
          };
        }
        return d;
      })
    );
  };

  const deleteDownload = (id: string) => {
    setDownloads(prev => {
      const next = prev.filter(d => d.id !== id);
      saveDownloads(next);
      return next;
    });
  };

  const handleAddMockDownload = (category: '4k' | '1080p' | '720p') => {
    const movie = sampleMovies[Math.floor(Math.random() * sampleMovies.length)] || sampleMovies[0];
    const newId = 'dl-' + Date.now();
    let size = '1.8 GB';
    let quality = '1080p';
    if (category === '4k') {
      size = (4.0 + Math.random() * 2.0).toFixed(1) + ' GB';
      quality = '4K';
    } else if (category === '1080p') {
      size = (1.5 + Math.random() * 0.9).toFixed(1) + ' GB';
      quality = '1080p';
    } else {
      size = Math.round(600 + Math.random() * 300) + ' MB';
      quality = '720p';
    }

    const newDownload: Download = {
      id: newId,
      title: movie.title,
      posterPath: movie.posterPath,
      url: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4',
      status: 'completed',
      progress: 100,
      size,
      downloadedSize: size,
      quality,
      addedAt: new Date().toISOString(),
      isEncrypted: true,
    };

    setDownloads(prev => {
      const next = [newDownload, ...prev];
      saveDownloads(next);
      return next;
    });
  };

  const handleClearCategory = (category: '4k' | '1080p' | '720p') => {
    setDownloads(prev => {
      const next = prev.filter(d => categorizeQuality(d.quality) !== category);
      saveDownloads(next);
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Downloads</h1>
            <p className="text-zinc-400 text-sm mt-1">Manage offline media and storage allocation</p>
          </div>
          <Link
            href="/mobile-app"
            className="inline-flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all self-start sm:self-auto"
          >
            <Smartphone className="h-4 w-4" />
            <span>Open Mobile App Simulator</span>
          </Link>
        </div>
        
        {/* Storage Breakdown Visualization Component */}
        <div className="mb-10">
          <StorageBreakdownVisualization
            items={downloads}
            deviceTotalGB={256}
            systemUsedGB={48.5}
            isCompact={false}
            selectedCategory={categoryFilter}
            onSelectCategory={setCategoryFilter}
            onAddMockDownload={handleAddMockDownload}
            onDeleteDownload={deleteDownload}
            onClearCategory={handleClearCategory}
            showQuickActions={true}
          />
        </div>
        
        {/* Active Downloads */}
        {activeDownloads.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-zinc-500" /> Active Downloads
            </h2>
            <div className="space-y-4">
              {activeDownloads.map(download => (
                <div key={download.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row items-start gap-6">
                  <img src={download.posterPath} alt={download.title} className="w-24 h-36 object-cover rounded-xl" />
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold">{download.title}</h3>
                      <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-sm">{download.quality}</span>
                      {download.isEncrypted && (
                        <span className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-sm">Encrypted</span>
                      )}
                    </div>
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-sm text-zinc-400 mb-1">
                        <span>{download.downloadedSize} / {download.size}</span>
                        <span>{Math.round(download.progress)}%</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-600 transition-all duration-500"
                          style={{ width: `${download.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => togglePause(download.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
                      >
                        {download.status === 'downloading' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {download.status === 'downloading' ? 'Pause' : 'Resume'}
                      </button>
                      <button
                        onClick={() => deleteDownload(download.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-red-900/30 hover:text-red-400 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Downloads */}
        {completedDownloads.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-500" /> Completed Downloads
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {completedDownloads.map(download => (
                <div key={download.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group">
                  <img src={download.posterPath} alt={download.title} className="w-full aspect-[2/3] object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold truncate">{download.title}</h3>
                    <p className="text-sm text-zinc-500 mt-1">{download.quality} • {download.size}</p>
                    <button
                      onClick={() => deleteDownload(download.id)}
                      className="mt-3 w-full py-2 bg-zinc-800 hover:bg-red-900/30 hover:text-red-400 rounded-xl transition-colors text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
