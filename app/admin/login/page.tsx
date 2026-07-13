'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, ShieldCheck, User } from 'lucide-react';
import { isAdminAuthenticated, setAdminAuthenticated, verifyAdminCredentials, getAdminCredentials } from '@/lib/data';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAdminAuthenticated()) {
      router.replace('/admin');
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!verifyAdminCredentials(username, password)) {
      setError('Invalid admin username or password.');
      return;
    }

    setAdminAuthenticated(true);
    router.push('/admin');
  };

  return (
    <main className="min-h-screen bg-[#080808] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_30%),radial-gradient(circle_at_bottom,_rgba(239,68,68,0.16),_transparent_35%)]" />
      <div className="relative min-h-screen flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-5xl grid lg:grid-cols-2 gap-8"
        >
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 text-sm mb-6">
              <ShieldCheck className="w-4 h-4" />
              Separate Admin Login
            </div>
            <h1 className="text-4xl font-bold mb-4">Admin Access</h1>
            <p className="text-zinc-400 leading-relaxed">
              This admin login is different from the user login page and protects the PlayFlix dashboard.
            </p>

            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
              <p className="text-sm text-zinc-400 mb-3">Built-in default admin credentials</p>
              <p className="text-white">Username: `admin`</p>
              <p className="text-white">Password: `admin`</p>
              <p className="text-zinc-500 text-sm mt-3">
                You can change the admin password later from <code>Admin {'->'} Settings</code>.
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="rounded-3xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl p-8 lg:p-10"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-semibold">Admin Login</h2>
              <p className="text-zinc-500 mt-2">Enter your admin username and password.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-zinc-400 mb-2 text-sm font-medium">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Enter admin username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-2 text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-12 py-3.5 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Enter admin password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-200 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3.5 rounded-2xl font-semibold transition-colors"
              >
                Login to Admin Panel
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm">
              <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
                Back to Home
              </Link>
              <span className="text-zinc-600">Protected Admin Access</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
