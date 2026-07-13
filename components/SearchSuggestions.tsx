'use client';

import React from 'react';
import { TrendingUp, Clock, Search } from 'lucide-react';

interface SearchSuggestionsProps {
  trendingSearches: string[];
  recentSearches: string[];
}

export function SearchSuggestions({ trendingSearches, recentSearches }: SearchSuggestionsProps) {
  return (
    <div className="px-6 md:px-12 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trending Searches */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-yellow-400" size={24} />
            <h3 className="text-xl font-bold text-white">Trending Searches</h3>
          </div>
          <div className="space-y-2">
            {trendingSearches.map((search, index) => (
              <div key={index} className="flex items-center gap-3 py-2 px-3 hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors">
                <span className="text-yellow-400 font-bold w-6">{index + 1}</span>
                <span className="text-white">{search}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-blue-400" size={24} />
              <h3 className="text-xl font-bold text-white">Recent Searches</h3>
            </div>
            <div className="space-y-2">
              {recentSearches.map((search, index) => (
                <div key={index} className="flex items-center gap-3 py-2 px-3 hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors">
                  <Search className="text-gray-500" size={18} />
                  <span className="text-white">{search}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
