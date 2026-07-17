'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Download, DownloadStatus, getDownloads, saveDownloads, getStorageStats, StorageStats } from '@/lib/data';
import { Pause, Play, Trash2, CheckCircle2, Clock, HardDriveDownload } from 'lucide-react';

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [storageStats, setStorageStats] = useState<StorageStats>(getStorageStats());

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

  const activeDownloads = downloads.filter(d => ['downloading', 'paused', 'pending'].includes(d.status));
  const completedDownloads = downloads.filter(d => d.status === 'completed');

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
    setDownloads(prev => prev.filter(d => d.id !== id));
  };

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">Downloads</h1>
        
        {/* Storage Stats */}
        <div className="bg-zinc-900 rounded-2xl p-6 mb-10 border border-zinc-800">
          <div className="flex items-center gap-4 mb-4">
            <HardDriveDownload className="text-red-500 w-8 h-8" />
            <h2 className="text-2xl font-semibold">Storage Usage</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-zinc-800 rounded-xl">
                <p className="text-zinc-500 text-sm mb-1">Total Available</p>
                <p className="text-xl font-bold">{storageStats.totalAvailable}</p>
              </div>
              <div className="p-4 bg-zinc-800 rounded-xl">
                <p className="text-zinc-500 text-sm mb-1">Total Used</p>
                <p className="text-xl font-bold">{storageStats.used}</p>
              </div>
              <div className="p-4 bg-zinc-800 rounded-xl">
                <p className="text-zinc-500 text-sm mb-1">Downloads</p>
                <p className="text-xl font-bold">{storageStats.downloadsUsed}</p>
              </div>
              <div className="p-4 bg-zinc-800 rounded-xl">
                <p className="text-zinc-500 text-sm mb-1">Free</p>
                <p className="text-xl font-bold">{storageStats.free}</p>
              </div>
            </div>
          </div>
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
