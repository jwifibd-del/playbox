'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-zinc-400 mb-6">The page you are looking for does not exist.</p>
        <Link 
          href="/" 
          className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
