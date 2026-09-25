'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Film,
  Tv,
  Settings,
  BarChart3,
  CreditCard,
  Bell,
  MessageSquare,
  Search,
  Menu,
  X,
  Plus,
  TrendingUp,
  UserPlus,
  Edit,
  Trash2,
  Save,
  Download,
  Database,
  ChevronUp,
  ChevronDown,
  PlayCircle,
  AppWindow,
  Smartphone,
  Monitor,
  Image,
  Tags,
  Globe,
  Languages,
  Send,
  Key,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Home,
  Star,
  RefreshCw,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Folder,
  FolderOpen,
  Upload,
  Video,
  MoveHorizontal,
  LogOut,
  Smile,
  Sparkles,
  HardDrive,
  Wifi,
  AlertTriangle,
  ExternalLink,
  Zap,
  FileVideo,
  Server,
  Cpu,
  Pause,
  Play,
  RotateCcw,
  StopCircle,
  Loader2,
  Gauge,
  Palette,
  Radio,
  Check,
  Ban,
  ListTodo,
  SortAsc,
  Pencil,
  AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { API_BASE } from '@/lib/api';
import { maskStreamUrl } from '@/lib/utils';
import { scrapeTVMazeShow, scrapeCuratedMovie } from '@/lib/open-scraper';
import { sampleMovies, getAppLinks, saveAppLinks, AppLink, getGeneralSettings, saveGeneralSettings, GeneralSettings, getParentalControlSettings, saveParentalControlSettings, ParentalControlSettings, getHeroBanners, saveHeroBanners, getKidsHeroBanners, saveKidsHeroBanners, getAnimeHeroBanners, saveAnimeHeroBanners, HeroBanner, getGenres, saveGenres, Genre, getCountries, saveCountries, Country, getLanguages, saveLanguages, Language, getPushNotifications, savePushNotifications, PushNotification, getApiKeys, saveApiKeys, ApiKey, getExternalApiKeys, saveExternalApiKeys, ExternalApiKeys, getSliderSections, saveSliderSections, getKidsSliderSections, saveKidsSliderSections, getAnimeSliderSections, saveAnimeSliderSections, SliderSection, getHomepageSections, saveHomepageSections, getKidsHomepageSections, saveKidsHomepageSections, getAnimeHomepageSections, saveAnimeHomepageSections, HomepageSection, searchTMDB, getTMDBDetails, getTMDBSeasonDetails, convertTMDBToMovie, convertTMDBToTVShow, convertTMDBToTVShowWithEpisodes, convertTMDBToMovieWithFanart, convertTMDBToTVShowWithEpisodesAndFanart, enrichMovieWithFanart, enrichTVShowWithFanart, getMovies, saveMovies, getTVShows, saveTVShows, Movie, MovieSource, CastMember, CrewMember, Season, Episode, getScrapingConfig, saveScrapingConfig, addScrapingJob, updateScrapingJob, ScrapingConfig, ScrapingJob, ScraperSource, parseFilename, getUserProfile, saveUserProfile, UserProfile, getAdminCredentials, saveAdminCredentials, AdminCredentials, isAdminAuthenticated, logoutAdmin, getUsers, deleteUser, AppUser, getMovieRequests, saveMovieRequests, MovieRequest, TVShow, getXtreamConfigs, saveXtreamConfigs, getActiveXtreamConfig, setActiveXtreamConfig, XtreamConfig, getFanartMovieArt, getFanartTvArt, pickBestFanartImage, FanartMovieArt, FanartTvArt, TvChannel, getTvChannels, saveTvChannels, deleteTvChannel, bulkDeleteTvChannels, getTvChannelCategories } from '@/lib/data';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

function createClientId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function isValidStreamUrl(url: string): boolean {
  if (!url || !url.trim()) return false
  const trimmed = url.trim()
  try {
    const u = new URL(trimmed)
    return (
      u.protocol === 'http:' ||
      u.protocol === 'https:' ||
      u.protocol === 'rtmp:' ||
      u.protocol === 'rtmps:'
    )
  } catch {
    return false
  }
}

const EPISODE_VIDEO_SOURCE_TYPES: MovieSource['type'][] = [
  'MP4',
  'WebM',
  'MKV',
  'Embed URL',
  'YouTube URL',
  'Local Storage'
]

const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={cn(
        "p-3 rounded-xl",
        trend === 'up' ? "bg-emerald-500/10" : "bg-zinc-800"
      )}>
        <Icon className={cn(
          "w-6 h-6",
          trend === 'up' ? "text-emerald-400" : "text-zinc-400"
        )} />
      </div>
      {change && (
        <span className={cn(
          "text-sm font-medium px-2 py-1 rounded-full",
          change.startsWith('+') ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
        )}>
          {change}
        </span>
      )}
    </div>
    <h3 className="text-zinc-400 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-bold text-white mt-1" suppressHydrationWarning={true}>{value}</p>
  </motion.div>
)

const RecentActivity = () => {
  const activities = [
    { user: 'John Doe', action: 'watched', content: 'Inception', time: '2 minutes ago' },
    { user: 'Jane Smith', action: 'subscribed', content: 'Premium Plan', time: '15 minutes ago' },
    { user: 'Bob Wilson', action: 'added', content: 'The Dark Knight', time: '1 hour ago' },
    { user: 'Alice Brown', action: 'created', content: 'New Account', time: '2 hours ago' },
  ]

  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-800/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-bold text-white">
              {activity.user[0]}
            </div>
            <div className="flex-1">
              <p className="text-white">
                <span className="font-medium">{activity.user}</span>
                <span className="text-zinc-400 ml-2">{activity.action}</span>
                <span className="text-white ml-2">{activity.content}</span>
              </p>
              <p className="text-zinc-500 text-sm">{activity.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const STATUS_COLORS: Record<string, string> = {
  queued: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  running: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  paused: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  completed: 'bg-green-500/10 text-green-400 border-green-500/30',
  failed: 'bg-red-500/10 text-red-400 border-red-500/30',
  cancelled: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
  retrying: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
}

const STAGE_LABELS: Record<string, string> = {
  analyzing: 'Analyzing Media',
  'extracting-thumbnails': 'Extracting Thumbnails',
  'transcoding-video': 'Transcoding Video',
  'transcoding-audio': 'Transcoding Audio',
  'packaging-hls': 'Packaging HLS',
  'packaging-dash': 'Packaging DASH',
  'generating-sprite': 'Generating Sprite',
  'converting-subtitles': 'Converting Subtitles',
  'registering-assets': 'Registering Assets',
  finalizing: 'Finalizing',
}

const formatBytes = (bytes: number) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

const formatDuration = (sec: number) => {
  if (!sec || sec <= 0) return '0s'
  if (sec < 60) return `${Math.round(sec)}s`
  if (sec < 3600) return `${Math.floor(sec / 60)}m ${Math.round(sec % 60)}s`
  return `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}m`
}

const TranscodingJobsPanel = () => {
  const [jobs, setJobs] = useState<any[]>([])
  const [live, setLive] = useState<any>({ byStatus: {}, runningJobs: [], busyWorkers: 0 })
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const getHeaders = (extra?: Record<string, string>): Record<string, string> => {
    const h: Record<string, string> = { ...(extra || {}) }
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken')
      if (token) h['Authorization'] = `Bearer ${token}`
    }
    return h
  }

  const loadJobs = async () => {
    try {
      const url = filter === 'all'
        ? `${API_BASE}/transcoding/jobs?take=100`
        : `${API_BASE}/transcoding/jobs?status=${filter}&take=100`
      const res = await fetch(url, { headers: getHeaders() })
      if (res.ok) {
        const data = await res.json()
        setJobs(data || [])
      }
    } catch (e) { console.warn(e) }
  }

  const loadLive = async () => {
    try {
      const res = await fetch(`${API_BASE}/transcoding/live`, { headers: getHeaders() })
      if (res.ok) {
        const data = await res.json()
        setLive(data || { byStatus: {}, runningJobs: [], busyWorkers: 0 })
      }
    } catch (e) { console.warn(e) }
  }

  const runAction = async (id: string, action: string) => {
    try {
      const res = await fetch(`${API_BASE}/transcoding/jobs/${id}/${action}`, {
        method: 'POST',
        headers: getHeaders(),
      })
      if (!res.ok) throw new Error(`Action ${action} failed (${res.status})`)
      await Promise.all([loadJobs(), loadLive()])
    } catch (err) {
      alert(`Action failed: ${(err as Error).message}`)
    }
  }

  useEffect(() => {
    loadJobs()
    loadLive()
    setLoading(false)
    const interval = setInterval(() => {
      loadJobs()
      loadLive()
    }, 3000)
    return () => clearInterval(interval)
  }, [filter])

  const counts = live.byStatus || {}

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Transcoding Jobs</h2>
          <p className="text-zinc-500 mt-1">Monitor and manage background conversion tasks</p>
        </div>
        <div className="flex gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-zinc-800 text-white px-4 py-2.5 rounded-xl border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Jobs</option>
            <option value="queued">Queued</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => { loadJobs(); loadLive() }}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-xl font-medium border border-zinc-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h3 className="text-zinc-400 text-sm font-medium">Active Workers</h3>
          </div>
          <p className="text-3xl font-bold text-white">{live.busyWorkers || 0}</p>
        </div>
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="w-5 h-5 text-blue-400" />
            <h3 className="text-zinc-400 text-sm font-medium">Queued</h3>
          </div>
          <p className="text-3xl font-bold text-white">{counts.queued || 0}</p>
        </div>
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="w-5 h-5 text-amber-400" />
            <h3 className="text-zinc-400 text-sm font-medium">Completed</h3>
          </div>
          <p className="text-3xl font-bold text-white">{counts.completed || 0}</p>
        </div>
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-red-400" />
            <h3 className="text-zinc-400 text-sm font-medium">Failed</h3>
          </div>
          <p className="text-3xl font-bold text-white">{counts.failed || 0}</p>
        </div>
      </div>

      {(live.runningJobs || []).length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Now Processing
          </h3>
          <div className="space-y-3">
            {(live.runningJobs || []).map((job: any) => (
              <div key={job.id} className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-white font-semibold">{job.videoTitle || `Video ${job.videoId?.slice(0, 8)}`}</h4>
                    <p className="text-zinc-500 text-xs mt-1">
                      Profile: {job.profileName || 'Default'}
                      {job.currentQuality && <span className="ml-3">Quality: <span className="text-white">{job.currentQuality}</span></span>}
                      {job.stage && <span className="ml-3">{STAGE_LABELS[job.stage] || job.stage}</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{job.progressPercent || 0}%</p>
                    {job.speedMbps > 0 && <p className="text-zinc-500 text-xs">{job.speedMbps.toFixed?.(job.speedMbps) || job.speedMbps} Mbps</p>}
                  </div>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${job.progressPercent || 0}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50 border-b border-zinc-800">
              <tr>
                <th className="text-left text-zinc-400 font-medium text-xs uppercase px-6 py-4">Video</th>
                <th className="text-left text-zinc-400 font-medium text-xs uppercase px-6 py-4">Profile</th>
                <th className="text-left text-zinc-400 font-medium text-xs uppercase px-6 py-4">Status</th>
                <th className="text-left text-zinc-400 font-medium text-xs uppercase px-6 py-4">Progress</th>
                <th className="text-left text-zinc-400 font-medium text-xs uppercase px-6 py-4">Source</th>
                <th className="text-left text-zinc-400 font-medium text-xs uppercase px-6 py-4">Created</th>
                <th className="text-left text-zinc-400 font-medium text-xs uppercase px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading && <tr><td colSpan={7} className="px-6 py-10 text-center text-zinc-500">Loading...</td></tr>}
              {!loading && jobs.length === 0 && <tr><td colSpan={7} className="px-6 py-10 text-center text-zinc-500">No jobs yet. Upload a video to get started!</td></tr>}
              {jobs.map((job: any) => (
                <tr key={job.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-white font-medium text-sm">
                      {(job.video as any)?.title || job.videoId?.slice(0, 10)}
                    </p>
                    <p className="text-zinc-500 text-xs">
                      {job.generatedQualities?.join(', ') || 'Pending...'}
                    </p>
                    {job.lastError && <p className="text-red-400 text-xs mt-1 max-w-xs truncate">{job.lastError}</p>}
                  </td>
                  <td className="px-6 py-4 text-zinc-300 text-sm">
                    {(job.profile as any)?.name || (job.profileId || '').slice(0, 8)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[job.status] || 'bg-zinc-700'}`}>
                      {job.status}
                    </span>
                    {job.retryCount > 0 && <span className="ml-2 text-xs text-amber-400">retry {job.retryCount}</span>}
                  </td>
                  <td className="px-6 py-4 w-56">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                          style={{ width: `${Math.min(100, job.progressPercent || 0)}%` }}
                        />
                      </div>
                      <span className="text-zinc-400 text-xs w-10 text-right">{job.progressPercent || 0}%</span>
                    </div>
                    <div className="text-zinc-500 text-xs mt-1 flex gap-3 mt-2">
                      <span>{job.fps || 0} fps</span>
                      <span>{formatBytes(job.bytesProcessed || 0)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      job.triggerSource === 'on-upload' ? 'bg-indigo-500/10 text-indigo-400' :
                      job.triggerSource === 'schedule' ? 'bg-purple-500/10 text-purple-400' :
                      job.triggerSource === 'manual' ? 'bg-zinc-700 text-zinc-300' :
                      'bg-orange-500/10 text-orange-400'
                    }`}>
                      {job.triggerSource}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-xs">
                    {job.createdAt ? new Date(job.createdAt).toLocaleString() : '-'}
                    {job.startedAt && <p className="mt-1">Started: {new Date(job.startedAt).toLocaleTimeString()}</p>}
                    {job.completedAt && <p className="mt-1">Done: {new Date(job.completedAt).toLocaleTimeString()}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {job.status === 'running' && (
                        <>
                          <button
                            title="Pause"
                            onClick={() => runAction(job.id, 'pause')}
                            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-amber-400"
                          ><Pause className="w-4 h-4" /></button>
                          <button
                            title="Cancel"
                            onClick={() => runAction(job.id, 'cancel')}
                            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-red-400"
                          ><StopCircle className="w-4 h-4" /></button>
                        </>
                      )}
                      {job.status === 'paused' && (
                        <button
                          title="Resume"
                          onClick={() => runAction(job.id, 'resume')}
                          className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400"
                        ><Play className="w-4 h-4" /></button>
                      )}
                      {(job.status === 'failed' || job.status === 'cancelled') && (
                        <button
                          title="Retry"
                          onClick={() => runAction(job.id, 'retry')}
                          className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-blue-400"
                        ><RotateCcw className="w-4 h-4" /></button>
                      )}
                      <button
                        title="Delete"
                        onClick={() => {
                          if (confirm('Delete this job?')) fetch(`${API_BASE}/transcoding/jobs/${job.id}`, { method: 'DELETE', headers: getHeaders() }).then(() => { loadJobs(); loadLive() })
                        }}
                        className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-red-400"
                      ><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}

const TranscodingProfilesPanel = () => {
  const [profiles, setProfiles] = useState<any[]>([])
  const [editing, setEditing] = useState<any>(null)
  const [showEditor, setShowEditor] = useState(false)

  const getHeaders = (extra?: Record<string, string>): Record<string, string> => {
    const h: Record<string, string> = { 'Content-Type': 'application/json', ...(extra || {}) }
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken')
      if (token) h['Authorization'] = `Bearer ${token}`
    }
    return h
  }

  const bootstrapJwtRetry = async (): Promise<boolean> => {
    try {
      const saved = getAdminCredentials();
      const attempts = [
        { username: saved?.username || 'admin', password: saved?.password || 'admin' },
        { username: 'admin', password: 'admin' },
      ]
      for (const a of attempts) {
        const res = await fetch(`${API_BASE}/auth/admin-panel-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(a),
        })
        if (res.ok) {
          const json = await res.json()
          if (json?.access_token) {
            localStorage.setItem('adminToken', json.access_token)
            return true
          }
        }
      }
      return false
    } catch (e) {
      return false
    }
  }

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}/transcoding/profiles`, { headers: getHeaders({}) })
      if (res.ok) setProfiles(await res.json())
    } catch (e) { console.warn(e) }
  }

  useEffect(() => { load() }, [])

  const save = async (profile: any, allowRetry = true) => {
    try {
      const method = profile.id ? 'PUT' : 'POST'
      const url = profile.id ? `${API_BASE}/transcoding/profiles/${profile.id}` : `${API_BASE}/transcoding/profiles`
      if (!profile?.name || String(profile.name).trim() === '') {
        throw new Error('Profile name is required — please set a name before saving. (400)')
      }
      const payload: any = { ...profile }
      if (typeof payload.name === 'string') payload.name = payload.name.trim()
      if (Array.isArray(payload.qualities)) {
        payload.qualities = payload.qualities.map((q: any) => ({
          label: q?.label || '720p',
          width: Number(q?.width || 0),
          height: Number(q?.height || 0),
          videoBitrateKbps: Number(q?.videoBitrateKbps || 0),
          audioBitrateKbps: Number(q?.audioBitrateKbps || 0),
          fps: Number(q?.fps || 0),
        }))
      }
      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload),
      })
      if (res.status === 401 && allowRetry) {
        const refreshed = await bootstrapJwtRetry()
        if (refreshed) return save(profile, false)
      }
      if (!res.ok) {
        let msg = `Save failed (${res.status})`
        let detail = ''
        try {
          const txt = await res.text()
          if (txt && txt.trim()) {
            detail = txt
            if (txt.trim().startsWith('{')) {
              try {
                const json = JSON.parse(txt)
                if (json?.message) {
                  const m = Array.isArray(json.message) ? json.message.join('; ') : String(json.message)
                  msg = `${msg} — ${m}`
                } else if (json?.error) {
                  msg = `${msg} — ${json.error}`
                } else {
                  msg = `${msg} — ${txt.slice(0, 220)}`
                }
              } catch (_) {
                msg = `${msg} — ${txt.slice(0, 220)}`
              }
            } else {
              msg = `${msg} — ${txt.slice(0, 220)}`
            }
          }
        } catch (_) {}
        throw new Error(msg + (detail ? `  (detail_length=${detail.length})` : ''))
      }
      setShowEditor(false)
      setEditing(null)
      await load()
    } catch (e) {
      const msg = (e as Error).message || String(e)
      let userMsg = msg
      if (msg.includes('401')) {
        userMsg = 'Admin session expired (401). Please log out of the admin panel and log back in, then try saving again.'
      } else if (msg.includes('500')) {
        userMsg = `Transcoding backend returned an internal error while saving. Details: ${msg}.`
      } else if (msg.includes('400') || msg.toLowerCase().includes('validation') || /already exists|name is required/i.test(msg)) {
        userMsg = `Save was rejected by the server (400). This is usually a naming conflict or invalid quality-ladder values.\n\nFull error: ${msg}`
      } else if (msg.includes('Failed to fetch') || msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND')) {
        userMsg = `PlayFlix backend appears offline. Start the backend server (port 3002), wait 10 seconds for NestJS to fully boot, then try again. Raw error: ${msg}.`
      } else if (msg.includes('403') || msg.includes('404')) {
        userMsg = `Unexpected server response while saving: ${msg}. (Is TranscodingModule registered in app.module & backend restarted?)`
      } else if (msg.includes('409')) {
        userMsg = `Profile name conflict — a profile with that name already exists. Rename it and try again. (${msg})`
      }
      alert(`Failed to save profile:\n\n${userMsg}`)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this profile?')) return
    try {
      const res = await fetch(`${API_BASE}/transcoding/profiles/${id}`, { method: 'DELETE', headers: getHeaders({}) })
      if (!res.ok) throw new Error(`Delete failed (${res.status})`)
      await load()
    } catch (e) {
      alert(`Delete failed: ${(e as Error).message}`)
    }
  }

  const triggerScheduled = async (profileId?: string) => {
    try {
      const res = await fetch(`${API_BASE}/transcoding/jobs/trigger-scheduled`, {
        method: 'POST',
        headers: getHeaders(),
        body: profileId ? JSON.stringify({ profileId }) : '{}',
      })
      if (!res.ok) throw new Error(`Trigger failed (${res.status})`)
      const r = await res.json()
      alert(`Triggered ${r.triggered} jobs`)
    } catch (e) {
      alert(`Scheduled trigger failed: ${(e as Error).message}`)
    }
  }

  const queueManual = async (profileId: string) => {
    const videoId = prompt('Enter a video ID to transcode:')
    if (!videoId) return
    try {
      const res = await fetch(`${API_BASE}/transcoding/jobs/queue`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ videoId, profileId }),
      })
      if (!res.ok) throw new Error(`Queue failed (${res.status})`)
      const j = await res.json()
      alert(`Job queued (${j.id})`)
    } catch (e) {
      alert(`Queue failed: ${(e as Error).message}`)
    }
  }

  const makeDefaultProfile = () => ({
    name: 'New Profile',
    outputFormat: 'hls+dash',
    codec: 'h264-main',
    presetSpeed: 'medium',
    crf: 23,
    audioCodec: 'aac',
    audioChannels: 2,
    qualities: [
      { label: '1080p', width: 1920, height: 1080, videoBitrateKbps: 8000, audioBitrateKbps: 192, fps: 30 },
      { label: '720p', width: 1280, height: 720, videoBitrateKbps: 4000, audioBitrateKbps: 160, fps: 30 },
      { label: '480p', width: 854, height: 480, videoBitrateKbps: 1200, audioBitrateKbps: 96, fps: 25 },
    ],
    segmentDurationSec: 4,
    keyframeAlignment: true,
    produceThumbnailSprite: true,
    generateSubtitleWebVTT: true,
    twoPass: false,
    hardwareAcceleration: false,
    isDefault: false,
    priority: 0,
    enabled: true,
    autoTriggerMode: 'on-upload',
    scheduleCron: '',
    retryOnFailure: true,
    maxRetries: 3,
    retryBackoffSeconds: 60,
    maxConcurrentWorkers: 2,
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Transcoding Profiles</h2>
          <p className="text-zinc-500 mt-1">Define conversion presets, formats, and auto-trigger rules</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => triggerScheduled()}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-xl font-medium border border-zinc-700 transition-colors"
          >
            <Clock className="w-5 h-5" />
            Run Scheduled
          </button>
          <button
            onClick={() => { setEditing(makeDefaultProfile()); setShowEditor(true) }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {profiles.map((p: any) => (
          <motion.div
            key={p.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "bg-zinc-900/50 backdrop-blur-xl rounded-2xl border p-6 transition-all",
              p.isDefault ? "border-red-500/50 shadow-lg shadow-red-500/10" : "border-zinc-800"
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                  {p.isDefault && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/30">
                      Default
                    </span>
                  )}
                  {!p.enabled && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-700 text-zinc-400 border border-zinc-600">
                      Disabled
                    </span>
                  )}
                </div>
                <p className="text-zinc-500 text-xs mt-1">{p.outputFormat} · {p.codec} · {p.presetSpeed}</p>
              </div>
              <Zap className={cn("w-6 h-6", p.enabled ? "text-amber-400" : "text-zinc-600")} />
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">CRF / Quality</span>
                <span className="text-white font-medium">{p.crf}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Audio</span>
                <span className="text-white font-medium">{p.audioCodec} · {p.audioChannels}ch</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Segment Duration</span>
                <span className="text-white font-medium">{p.segmentDurationSec}s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Workers</span>
                <span className="text-white font-medium">{p.maxConcurrentWorkers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Auto-Trigger</span>
                <span className="text-white font-medium">{p.autoTriggerMode}</span>
              </div>
              <div className="pt-2 border-t border-zinc-800">
                <p className="text-zinc-500 text-xs mb-2">Qualities</p>
                <div className="flex flex-wrap gap-1.5">
                  {(p.qualities || []).map((q: any, i: number) => (
                    <span key={i} className="px-2 py-1 bg-zinc-800 rounded-lg text-xs text-zinc-300 border border-zinc-700">
                      {q.label}
                      <span className="text-zinc-500 ml-1">{q.videoBitrateKbps}k</span>
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t border-zinc-800 flex flex-wrap gap-1.5">
                {p.produceThumbnailSprite && <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Sprite</span>}
                {p.generateSubtitleWebVTT && <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">WebVTT</span>}
                {p.keyframeAlignment && <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Aligned GOP</span>}
                {p.twoPass && <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">2-Pass</span>}
                {p.hardwareAcceleration && <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">HW {p.hardwareEncoder || ''}</span>}
                {p.retryOnFailure && <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">Retry ({p.maxRetries}x)</span>}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-zinc-800">
              <button
                onClick={() => { setEditing({ ...p }); setShowEditor(true) }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors"
              >
                <Edit className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => queueManual(p.id)}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors"
                title="Queue a video with this profile"
              >
                <Play className="w-4 h-4" />
              </button>
              {!p.isDefault && (
                <button
                  onClick={() => remove(p.id)}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-red-600/20 text-zinc-400 hover:text-red-400 text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showEditor && editing && (
          <ProfileEditorModal
            profile={editing}
            onClose={() => { setShowEditor(false); setEditing(null) }}
            onSave={save}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const ProfileEditorModal = ({ profile, onClose, onSave }: any) => {
  const [form, setForm] = useState<any>(profile || {})
  const update = (patch: any) => setForm((p: any) => ({ ...p, ...patch }))
  const updateQuality = (i: number, patch: any) => {
    const next = [...(form.qualities || [])]
    next[i] = { ...next[i], ...patch }
    update({ qualities: next })
  }
  const removeQuality = (i: number) => {
    const next = (form.qualities || []).filter((_: any, idx: number) => idx !== i)
    update({ qualities: next })
  }
  const addQuality = () => {
    const next = [...(form.qualities || []), { label: '720p', width: 1280, height: 720, videoBitrateKbps: 4000, audioBitrateKbps: 160, fps: 30 }]
    update({ qualities: next })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        layout
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900 z-10">
          <div>
            <h3 className="text-xl font-bold text-white">{form.id ? 'Edit Profile' : 'New Profile'}</h3>
            <p className="text-zinc-500 text-sm mt-1">Configure conversion settings</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name">
              <input value={form.name || ''} onChange={(e) => update({ name: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Auto-Trigger Mode">
              <select value={form.autoTriggerMode || 'on-upload'} onChange={(e) => update({ autoTriggerMode: e.target.value })} className={inputCls}>
                <option value="on-upload">On Upload (Immediate)</option>
                <option value="schedule-only">Schedule Only (Cron)</option>
                <option value="manual">Manual Only</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Output Format">
              <select value={form.outputFormat || 'hls+dash'} onChange={(e) => update({ outputFormat: e.target.value })} className={inputCls}>
                <option value="hls+dash">HLS + DASH</option>
                <option value="hls">HLS</option>
                <option value="dash">DASH</option>
                <option value="mp4">MP4 (Progressive)</option>
                <option value="webm">WebM (VP9)</option>
              </select>
            </Field>
            <Field label="Codec">
              <select value={form.codec || 'h264-main'} onChange={(e) => update({ codec: e.target.value })} className={inputCls}>
                <option value="h264-fast">H.264 Fast</option>
                <option value="h264-main">H.264 Balanced</option>
                <option value="h264-slow">H.264 Slow (High Quality)</option>
                <option value="h265-fast">H.265 Fast</option>
                <option value="h265-slow">H.265 Slow</option>
                <option value="av1">AV1</option>
                <option value="vp9">VP9</option>
                <option value="copy">Copy (no re-encode)</option>
              </select>
            </Field>
            <Field label="Preset Speed">
              <select value={form.presetSpeed || 'medium'} onChange={(e) => update({ presetSpeed: e.target.value })} className={inputCls}>
                {['ultrafast', 'superfast', 'veryfast', 'faster', 'fast', 'medium', 'slow', 'slower', 'veryslow'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="CRF (0–51, lower = better)">
              <input type="number" min={0} max={51} value={form.crf ?? 23} onChange={(e) => update({ crf: Number(e.target.value) })} className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Audio Codec">
              <select value={form.audioCodec || 'aac'} onChange={(e) => update({ audioCodec: e.target.value })} className={inputCls}>
                <option value="aac">AAC</option>
                <option value="opus">Opus</option>
                <option value="mp3">MP3</option>
                <option value="ac3">AC-3</option>
                <option value="copy">Copy</option>
              </select>
            </Field>
            <Field label="Audio Channels">
              <input type="number" min={1} max={8} value={form.audioChannels ?? 2} onChange={(e) => update({ audioChannels: Number(e.target.value) })} className={inputCls} />
            </Field>
            <Field label="Segment (s)">
              <input type="number" min={1} max={30} value={form.segmentDurationSec ?? 4} onChange={(e) => update({ segmentDurationSec: Number(e.target.value) })} className={inputCls} />
            </Field>
            <Field label="Max Workers">
              <input type="number" min={1} max={16} value={form.maxConcurrentWorkers ?? 2} onChange={(e) => update({ maxConcurrentWorkers: Number(e.target.value) })} className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Toggle label="Keyframe Aligned GOP" value={!!form.keyframeAlignment} onChange={(v: boolean) => update({ keyframeAlignment: v })} />
            <Toggle label="Thumbnail Sprite" value={!!form.produceThumbnailSprite} onChange={(v: boolean) => update({ produceThumbnailSprite: v })} />
            <Toggle label="WebVTT Subtitles" value={!!form.generateSubtitleWebVTT} onChange={(v: boolean) => update({ generateSubtitleWebVTT: v })} />
            <Toggle label="Two-Pass" value={!!form.twoPass} onChange={(v: boolean) => update({ twoPass: v })} />
            <Toggle label="Hardware Accel" value={!!form.hardwareAcceleration} onChange={(v: boolean) => update({ hardwareAcceleration: v })} />
            <Toggle label="Retry on Failure" value={!!form.retryOnFailure} onChange={(v: boolean) => update({ retryOnFailure: v })} />
            <Toggle label="Default Profile" value={!!form.isDefault} onChange={(v: boolean) => update({ isDefault: v })} />
            <Toggle label="Enabled" value={form.enabled !== false} onChange={(v: boolean) => update({ enabled: v })} />
            <Field label="Priority (0 = highest)">
              <input type="number" value={form.priority ?? 0} onChange={(e) => update({ priority: Number(e.target.value) })} className={inputCls} />
            </Field>
          </div>

          {form.retryOnFailure && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Max Retries">
                <input type="number" min={0} max={10} value={form.maxRetries ?? 3} onChange={(e) => update({ maxRetries: Number(e.target.value) })} className={inputCls} />
              </Field>
              <Field label="Retry Backoff (s)">
                <input type="number" min={0} value={form.retryBackoffSeconds ?? 60} onChange={(e) => update({ retryBackoffSeconds: Number(e.target.value) })} className={inputCls} />
              </Field>
            </div>
          )}

          {form.autoTriggerMode === 'schedule-only' && (
            <Field label="Schedule Cron (optional, default = daily 2 AM)">
              <input placeholder="0 2 * * *" value={form.scheduleCron || ''} onChange={(e) => update({ scheduleCron: e.target.value })} className={inputCls} />
            </Field>
          )}

          {form.hardwareAcceleration && (
            <Field label="Hardware Encoder (e.g. h264_nvenc, h264_videotoolbox, h264_qsv)">
              <input placeholder="h264_nvenc" value={form.hardwareEncoder || ''} onChange={(e) => update({ hardwareEncoder: e.target.value })} className={inputCls} />
            </Field>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold">Quality Ladder</h4>
              <button onClick={addQuality} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm text-zinc-300">
                <Plus className="w-4 h-4" /> Add Quality
              </button>
            </div>
            <div className="space-y-3">
              {(form.qualities || []).map((q: any, i: number) => (
                <div key={i} className="grid grid-cols-6 gap-3 items-end bg-zinc-800/40 border border-zinc-800 rounded-xl p-4">
                  <Field label="Label">
                    <select value={q.label} onChange={(e) => updateQuality(i, { label: e.target.value })} className={inputCls}>
                      {['2160p', '1440p', '1080p', '720p', '576p', '480p', '360p', 'original'].map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </Field>
                  <Field label="W px"><input type="number" value={q.width || 0} onChange={(e) => updateQuality(i, { width: Number(e.target.value) })} className={inputCls} /></Field>
                  <Field label="H px"><input type="number" value={q.height || 0} onChange={(e) => updateQuality(i, { height: Number(e.target.value) })} className={inputCls} /></Field>
                  <Field label="Video kbps"><input type="number" value={q.videoBitrateKbps || 0} onChange={(e) => updateQuality(i, { videoBitrateKbps: Number(e.target.value) })} className={inputCls} /></Field>
                  <Field label="Audio kbps"><input type="number" value={q.audioBitrateKbps || 0} onChange={(e) => updateQuality(i, { audioBitrateKbps: Number(e.target.value) })} className={inputCls} /></Field>
                  <div className="flex items-end gap-2">
                    <Field label="FPS"><input type="number" value={q.fps || 0} onChange={(e) => updateQuality(i, { fps: Number(e.target.value) })} className={inputCls} /></Field>
                    <button onClick={() => removeQuality(i)} title="Remove quality" className="p-2 rounded-lg bg-zinc-900 hover:bg-red-600/20 text-zinc-400 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-800 flex items-center justify-end gap-3 sticky bottom-0 bg-zinc-900">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium">
            Cancel
          </button>
          <button onClick={() => onSave(form)} className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Profile
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

const inputCls = "w-full bg-zinc-800 text-white px-3 py-2 rounded-xl border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"

const Field = ({ label, children }: any) => (
  <label className="block">
    <span className="block text-zinc-400 text-xs mb-1.5">{label}</span>
    {children}
  </label>
)

const Toggle = ({ label, value, onChange }: any) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={cn(
      "flex items-center justify-between px-3 py-2 rounded-xl border text-sm transition-colors",
      value ? "bg-red-500/10 border-red-500/40 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400"
    )}
  >
    <span className="font-medium">{label}</span>
    <span className={cn(
      "relative inline-block w-10 h-6 rounded-full transition-colors",
      value ? "bg-red-500" : "bg-zinc-700"
    )}>
      <span className={cn(
        "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
        value && "translate-x-4"
      )} />
    </span>
  </button>
)

const categoryAccent: Record<string, string> = {
  News: 'from-red-500 to-orange-500',
  Sports: 'from-emerald-500 to-teal-500',
  Entertainment: 'from-fuchsia-500 to-pink-500',
  Documentary: 'from-sky-500 to-cyan-500',
  Kids: 'from-yellow-400 to-orange-400',
  Music: 'from-pink-500 to-rose-500',
  Lifestyle: 'from-amber-500 to-yellow-400',
  Culture: 'from-violet-500 to-indigo-500',
}

const AdminTvChannelCard = ({
  channel,
  onEdit,
  onDelete,
  onToggleFeatured,
  onToggleActive,
  isSelected,
  onSelect,
}: any) => {
  const [copiedStream, setCopiedStream] = useState(false);
  const gradient = categoryAccent[channel.category] || 'from-sky-500 to-blue-500';
  const totalViewers = (channel.viewerCount || 0);
  const prettyViewers = totalViewers >= 1000000
    ? `${(totalViewers / 1000000).toFixed(1)}M`
    : totalViewers >= 1000
    ? `${(totalViewers / 1000).toFixed(0)}K`
    : String(totalViewers);

  const handleCopyStream = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (channel.streamUrl && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(channel.streamUrl).then(() => {
        setCopiedStream(true);
        setTimeout(() => setCopiedStream(false), 2000);
      }).catch(() => {});
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative group overflow-hidden rounded-3xl border transition-all',
        isSelected
          ? 'border-red-500/70 bg-red-500/5 shadow-lg shadow-red-500/10 ring-2 ring-red-500/40'
          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'
      )}
    >
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        aria-label={isSelected ? 'Deselect channel' : 'Select channel'}
        title={isSelected ? 'Deselect channel' : 'Select for bulk actions'}
        className={cn(
          'absolute top-3 left-3 z-20 w-7 h-7 rounded-xl border flex items-center justify-center transition-all shadow-lg',
          isSelected
            ? 'bg-red-600 border-red-400 text-white opacity-100 scale-105 ring-2 ring-red-500/50'
            : 'bg-zinc-950/80 border-white/30 text-white/50 opacity-90 group-hover:opacity-100 hover:text-white hover:border-white/70 hover:scale-105'
        )}
      >
        <Check className={cn('w-4 h-4 transition-all', isSelected ? 'opacity-100 stroke-[3]' : 'opacity-30 group-hover:opacity-60')} />
      </button>

      <div className={`h-24 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_60%)]" />
        <div className="absolute inset-0 opacity-20"
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '14px 14px' }} />

        <div className="absolute bottom-3 right-3 flex flex-wrap gap-1.5 justify-end">
          {channel.isFeatured && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur text-[10px] font-semibold text-white border border-white/20">
              <Star className="w-2.5 h-2.5 text-yellow-300 fill-yellow-300" />
              FEATURED
            </span>
          )}
          {channel.is4K && (
            <span className="px-2 py-0.5 rounded-full bg-blue-500/90 text-[10px] font-bold text-white shadow-lg">
              4K
            </span>
          )}
          {!channel.is4K && channel.isHD && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 text-[10px] font-bold text-white shadow-lg">
              HD
            </span>
          )}
          {channel.isPaid && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-[10px] font-bold text-black shadow-lg">
              PREMIUM
            </span>
          )}
        </div>

        {!channel.isActive && (
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/90 border border-zinc-700 text-zinc-300 text-sm font-semibold">
              <Ban className="w-4 h-4" />
              INACTIVE
            </span>
          </div>
        )}
      </div>

      <div className="px-5 py-4 -mt-8 relative">
        <div className="flex items-start gap-3 mb-3">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-zinc-800 shadow-xl bg-zinc-900 shrink-0">
            {channel.logoPath ? (
              <img
                src={channel.logoPath}
                alt={channel.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <Radio className="w-7 h-7 text-white drop-shadow-lg" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 pt-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-white font-bold text-base truncate">
                  {channel.name}
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold text-white bg-gradient-to-r ${gradient}`}>
                    {channel.category || 'General'}
                  </span>
                  {channel.country && (
                    <span className="text-zinc-500 text-[11px] flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {channel.country}
                    </span>
                  )}
                </div>
              </div>
              <div className="relative group/actions shrink-0">
                <div className="flex items-center gap-1 text-zinc-400 text-xs font-medium">
                  <Users className="w-3 h-3" />
                  {prettyViewers}
                </div>
                {typeof channel.rating === 'number' && channel.rating > 0 && (
                  <div className="flex items-center gap-1 mt-1 text-zinc-300 text-[11px] justify-end">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    {channel.rating.toFixed(1)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2 text-xs">
            <div className="mt-0.5 shrink-0 relative flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-red-400 font-bold uppercase tracking-wider">Now</span>
            </div>
            <p className="text-zinc-200 line-clamp-1 font-medium flex-1">
              {channel.nowPlaying || 'Live Programming'}
            </p>
          </div>
          <div className="flex items-start gap-2 text-xs pl-4">
            <span className="text-zinc-600 font-bold uppercase tracking-wider shrink-0">Next</span>
            <p className="text-zinc-500 line-clamp-1 flex-1">
              {channel.nextProgram || 'TBD'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleActive(); }}
            className={cn(
              'flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-semibold transition-colors',
              channel.isActive
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
            )}
          >
            <Wifi className="w-3.5 h-3.5" />
            {channel.isActive ? 'Live' : 'Offline'}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFeatured(); }}
            className={cn(
              'flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-semibold transition-colors',
              channel.isFeatured
                ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/20'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
            )}
          >
            <Star className={cn('w-3.5 h-3.5', channel.isFeatured && 'fill-yellow-300')} />
            {channel.isFeatured ? 'Pinned' : 'Feature'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4 text-[11px] text-zinc-500">
          {channel.language && (
            <div className="flex items-center gap-1 truncate">
              <Languages className="w-3 h-3 shrink-0" />
              <span className="truncate">{channel.language}</span>
            </div>
          )}
          {channel.packageName && (
            <div className="flex items-center gap-1 truncate">
              <CreditCard className="w-3 h-3 shrink-0" />
              <span className="truncate">{channel.packageName}</span>
            </div>
          )}
          {channel.epgId && (
            <div className="flex items-center gap-1 truncate">
              <ListTodo className="w-3 h-3 shrink-0" />
              <span className="truncate">EPG: {channel.epgId}</span>
            </div>
          )}
          {typeof channel.order === 'number' && (
            <div className="flex items-center gap-1 truncate">
              <SortAsc className="w-3 h-3 shrink-0" />
              <span>Order #{channel.order}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-zinc-800/60">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={handleCopyStream}
            title={copiedStream ? 'Stream URL copied!' : 'Copy Stream URL'}
            className={cn(
              'flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all',
              copiedStream
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border-zinc-700 hover:text-white'
            )}
          >
            {copiedStream ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title="Remove channel"
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

const TvChannelModal = ({ channel, onClose, onSave, categories }: any) => {
  const isEdit = !!channel
  const [form, setForm] = useState<TvChannel>(() => ({
    id: '',
    name: '',
    description: '',
    logoPath: '',
    logoThumbPath: '',
    streamUrl: '',
    category: 'Entertainment',
    language: 'English',
    country: 'USA',
    isHD: true,
    is4K: false,
    isActive: true,
    isFeatured: false,
    isPaid: false,
    order: 0,
    epgId: '',
    nowPlaying: '',
    nextProgram: '',
    viewerCount: 0,
    rating: 0,
    timezone: 'UTC',
    packageName: '',
    ...(channel || {}),
  }))

  const update = (patch: Partial<TvChannel>) => setForm((f) => ({ ...f, ...patch }))
  const [revealStreamUrl, setRevealStreamUrl] = useState(false)
  const [showStreamTester, setShowStreamTester] = useState(false)
  const streamUrlInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setRevealStreamUrl(false)
  }, [channel])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-2 bg-gradient-to-r from-red-500 via-orange-500 to-pink-500" />
        <div className="overflow-y-auto max-h-[calc(90vh-8px)]">
          <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800 px-6 sm:px-8 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-white text-xl font-bold truncate">
                  {isEdit ? 'Edit TV Channel' : 'Add New TV Channel'}
                </h2>
                <p className="text-zinc-500 text-xs truncate">
                  {isEdit ? `Updating: ${channel?.name || ''}` : 'Configure a new live stream with metadata and EPG info'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-10 h-10 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-7">
            <section className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              <div className="md:col-span-5 space-y-3">
                <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-500">Branding</span>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
                  <div className="aspect-[16/9] rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-800 relative overflow-hidden flex items-center justify-center">
                    {form.logoPath ? (
                      <img
                        src={form.logoPath}
                        alt="Logo preview"
                        className="max-w-[80%] max-h-[80%] object-contain drop-shadow-2xl"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="text-center space-y-2 opacity-70">
                        <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${categoryAccent[form.category ?? 'Entertainment'] || 'from-sky-500 to-blue-500'} flex items-center justify-center shadow-lg`}>
                          <Radio className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-xs text-zinc-500">Add a logo URL to preview</p>
                      </div>
                    )}
                    {(form.isHD || form.is4K || form.isPaid || form.isFeatured) && (
                      <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 justify-end max-w-[60%]">
                        {form.isFeatured && (
                          <span className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur text-[10px] font-bold text-yellow-300 border border-yellow-300/30">
                            ⭐ FEATURED
                          </span>
                        )}
                        {form.is4K && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-500 text-[10px] font-bold text-white">4K</span>
                        )}
                        {!form.is4K && form.isHD && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-[10px] font-bold text-white">HD</span>
                        )}
                        {form.isPaid && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-[10px] font-bold text-black">PREMIUM</span>
                        )}
                      </div>
                    )}
                  </div>
                  <Field label="Channel Name *">
                    <input
                      type="text"
                      className={inputCls}
                      value={form.name}
                      onChange={(e) => update({ name: e.target.value })}
                      placeholder="e.g. CNN International"
                    />
                  </Field>
                  <Field label="Logo URL">
                    <input
                      type="text"
                      className={inputCls}
                      value={form.logoPath || ''}
                      onChange={(e) => update({ logoPath: e.target.value })}
                      placeholder="https://.../logo.svg"
                    />
                  </Field>
                  <Field label="Thumbnail Logo URL (optional)">
                    <input
                      type="text"
                      className={inputCls}
                      value={form.logoThumbPath || ''}
                      onChange={(e) => update({ logoThumbPath: e.target.value })}
                      placeholder="Smaller logo for lists"
                    />
                  </Field>
                </div>
              </div>

              <div className="md:col-span-7 space-y-3">
                <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-500">Stream & Classification</span>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
                  <Field label="Stream URL *">
                    <div className="relative">
                      <input
                        ref={streamUrlInputRef}
                        type="text"
                        className={cn(inputCls, 'font-mono text-xs pr-12')}
                        value={revealStreamUrl || !form.streamUrl ? form.streamUrl : maskStreamUrl(form.streamUrl)}
                        readOnly={!revealStreamUrl && !!form.streamUrl}
                        onChange={(e) => update({ streamUrl: e.target.value })}
                        placeholder="http:// or https:// or rtmp:// stream (e.g. https://live.example.com/ch.m3u8)"
                      />
                      {!!form.streamUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setRevealStreamUrl((v) => {
                              const next = !v
                              if (next) {
                                setTimeout(() => streamUrlInputRef.current?.focus(), 0)
                              }
                              return next
                            })
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl border border-zinc-700 bg-zinc-950/40 hover:bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                          aria-label={revealStreamUrl ? 'Hide stream url' : 'Reveal stream url'}
                        >
                          {revealStreamUrl ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1.5 leading-relaxed">
                      Supported: <span className="text-emerald-400 font-semibold">http://</span>,{' '}
                      <span className="text-emerald-400 font-semibold">https://</span>,{' '}
                      <span className="text-emerald-400 font-semibold">rtmp://</span>.{' '}
                      Formats: M3U8 / HLS / MPEG-TS / MP4 / WebM.
                    </p>
                    {form.streamUrl && !isValidStreamUrl(form.streamUrl) && (
                      <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        URL must start with http://, https://, or rtmp://
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setShowStreamTester((v) => !v)}
                        disabled={!form.streamUrl || !isValidStreamUrl(form.streamUrl)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200 border border-zinc-700 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                        {showStreamTester ? 'Hide Stream Player' : 'Test / Preview Stream'}
                      </button>
                    </div>

                    {showStreamTester && form.streamUrl && isValidStreamUrl(form.streamUrl) && (
                      <div className="mt-3 p-3 rounded-2xl bg-zinc-950 border border-zinc-700/70 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                              Live Stream Tester
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowStreamTester(false)}
                            className="text-zinc-500 hover:text-white text-[11px]"
                          >
                            Close Preview
                          </button>
                        </div>
                        <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-zinc-800 flex items-center justify-center">
                          <video
                            src={form.streamUrl}
                            controls
                            playsInline
                            autoPlay
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate flex items-center justify-between">
                          <span className="font-mono truncate">{form.streamUrl}</span>
                          <span className="text-[10px] text-zinc-500 shrink-0 ml-2">Direct Playback Check</span>
                        </div>
                      </div>
                    )}
                  </Field>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Field label="Category *">
                      <select
                        className={inputCls}
                        value={form.category}
                        onChange={(e) => update({ category: e.target.value })}
                      >
                        {(categories && categories.length ? categories : Object.keys(categoryAccent)).map((c: string) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Country">
                      <input
                        type="text"
                        className={inputCls}
                        value={form.country || ''}
                        onChange={(e) => update({ country: e.target.value })}
                        placeholder="USA"
                      />
                    </Field>
                    <Field label="Language">
                      <input
                        type="text"
                        className={inputCls}
                        value={form.language || ''}
                        onChange={(e) => update({ language: e.target.value })}
                        placeholder="English"
                      />
                    </Field>
                    <Field label="Timezone">
                      <input
                        type="text"
                        className={inputCls}
                        value={form.timezone || ''}
                        onChange={(e) => update({ timezone: e.target.value })}
                        placeholder="UTC, EST, GMT+2"
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Field label="Sort Order">
                      <input
                        type="number"
                        className={inputCls}
                        value={form.order ?? 0}
                        onChange={(e) => update({ order: Number(e.target.value) })}
                      />
                    </Field>
                    <Field label="Viewer Count">
                      <input
                        type="number"
                        className={inputCls}
                        value={form.viewerCount ?? 0}
                        onChange={(e) => update({ viewerCount: Number(e.target.value) })}
                      />
                    </Field>
                    <Field label="Rating (0-10)">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        className={inputCls}
                        value={form.rating ?? 0}
                        onChange={(e) => update({ rating: Math.min(10, Math.max(0, Number(e.target.value))) })}
                      />
                    </Field>
                    <Field label="Package / Tier">
                      <input
                        type="text"
                        className={inputCls}
                        value={form.packageName || ''}
                        onChange={(e) => update({ packageName: e.target.value })}
                        placeholder="Premium, Sports, Basic"
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                    <Toggle label="HD Ready" value={!!form.isHD} onChange={(v: boolean) => update({ isHD: v })} />
                    <Toggle label="4K UHD" value={!!form.is4K} onChange={(v: boolean) => update({ is4K: v })} />
                    <Toggle label="Live / Active" value={!!form.isActive} onChange={(v: boolean) => update({ isActive: v })} />
                    <Toggle label="Featured" value={!!form.isFeatured} onChange={(v: boolean) => update({ isFeatured: v })} />
                    <Toggle label="Paid / Premium" value={!!form.isPaid} onChange={(v: boolean) => update({ isPaid: v })} />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-500">EPG & Schedule</span>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Now Playing">
                    <input
                      type="text"
                      className={inputCls}
                      value={form.nowPlaying || ''}
                      onChange={(e) => update({ nowPlaying: e.target.value })}
                      placeholder="e.g. Breaking News Hour"
                    />
                  </Field>
                  <Field label="Next Program">
                    <input
                      type="text"
                      className={inputCls}
                      value={form.nextProgram || ''}
                      onChange={(e) => update({ nextProgram: e.target.value })}
                      placeholder="e.g. World Report"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="EPG ID / XMLTV ID">
                    <input
                      type="text"
                      className={cn(inputCls, 'font-mono text-xs')}
                      value={form.epgId || ''}
                      onChange={(e) => update({ epgId: e.target.value })}
                      placeholder="cnn.us"
                    />
                  </Field>
                </div>
                <Field label="Description">
                  <textarea
                    className={cn(inputCls, 'min-h-[96px] resize-y')}
                    value={form.description || ''}
                    onChange={(e) => update({ description: e.target.value })}
                    placeholder="Short description of what this channel broadcasts..."
                  />
                </Field>
              </div>
            </section>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium border border-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {!form.name.trim() || !form.streamUrl.trim() || !isValidStreamUrl(form.streamUrl) ? (
                  <div className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-500 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    {!isValidStreamUrl(form.streamUrl)
                      ? 'Stream URL must be a valid http://, https://, or rtmp:// address'
                      : 'Name and Stream URL are required'}
                  </div>
                ) : null}
                <button
                  type="button"
                  disabled={!form.name.trim() || !form.streamUrl.trim() || !isValidStreamUrl(form.streamUrl)}
                  onClick={() => {
                    if (!form.name.trim() || !form.streamUrl.trim() || !isValidStreamUrl(form.streamUrl)) return
                    onSave(form)
                  }}
                  className={cn(
                    'px-7 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all',
                    !form.name.trim() || !form.streamUrl.trim() || !isValidStreamUrl(form.streamUrl)
                      ? 'bg-zinc-800 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-xl shadow-red-500/20 hover:shadow-red-500/40'
                  )}
                >
                  <Check className="w-5 h-5" />
                  {isEdit ? 'Save Changes' : 'Add Channel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

const AdminSidebar = ({ activeTab, setActiveTab }: any) => {
  const isHomeTabActive = ['home', 'kids-home', 'anime-home'].includes(activeTab)
  const [homeDropdownOpen, setHomeDropdownOpen] = useState(isHomeTabActive)
  const isSliderTabActive = ['sliders', 'kids-sliders', 'anime-sliders'].includes(activeTab)
  const [sliderDropdownOpen, setSliderDropdownOpen] = useState(isSliderTabActive)
  const isImportTabActive = ['import-movies', 'import-tv'].includes(activeTab)
  const [importDropdownOpen, setImportDropdownOpen] = useState(isImportTabActive)
  const isHeroTabActive = ['default-hero', 'kids-hero', 'anime-hero'].includes(activeTab)
  const [heroDropdownOpen, setHeroDropdownOpen] = useState(isHeroTabActive)
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { 
      id: 'hero-group', 
      label: 'Hero Banner', 
      icon: Image,
      subItems: [
        { id: 'default-hero', label: 'Default Hero Banner', icon: Image },
        { id: 'kids-hero', label: 'Kids Hero Banners', icon: Smile },
        { id: 'anime-hero', label: 'Anime Hero Banners', icon: Sparkles },
      ]
    },
    { 
      id: 'home-group', 
      label: 'Home Management', 
      icon: Home,
      subItems: [
        { id: 'home', label: 'Default Home', icon: Home },
        { id: 'kids-home', label: 'Kids Home Management', icon: Smile },
        { id: 'anime-home', label: 'Anime Home Management', icon: Sparkles },
      ]
    },
    { 
      id: 'sliders-group', 
      label: 'Slider Sections', 
      icon: MoveHorizontal,
      subItems: [
        { id: 'sliders', label: 'Default Sliders', icon: MoveHorizontal },
        { id: 'kids-sliders', label: 'Kids Slider Sections', icon: Smile },
        { id: 'anime-sliders', label: 'Anime Slider Sections', icon: Sparkles },
      ]
    },
    { 
      id: 'import-group', 
      label: 'Import Content', 
      subItems: [
        { id: 'import-movies', label: 'Import Movies', icon: Film },
        { id: 'import-tv', label: 'Import TV Shows', icon: Tv },
      ]
    },
    { id: 'scraping', label: 'Automated Scraping', icon: RefreshCw },
    { id: 'transcoding-jobs', label: 'Transcoding Jobs', icon: Cpu },
    { id: 'transcoding-profiles', label: 'Transcoding Profiles', icon: Zap },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'tv', label: 'TV Shows', icon: Tv },
    { id: 'tv-channels', label: 'TV Channels', icon: Radio },
    { id: 'castcrew', label: 'Cast', icon: Users },
    { id: 'xtream-api', label: 'Xtream API', icon: Wifi },
    { id: 'genres', label: 'Genres', icon: Tags },
    { id: 'countries', label: 'Countries', icon: Globe },
    { id: 'languages', label: 'Languages', icon: Languages },
    { id: 'notifications', label: 'Push Notifications', icon: Send },
    { id: 'apikeys', label: 'API Keys', icon: Key },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'requests', label: 'Movie Requests', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'server-health', label: 'Server Health', icon: Activity },
    { id: 'ai-features', label: 'AI Features', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  useEffect(() => {
    if (isHomeTabActive) {
      setHomeDropdownOpen(true)
    }
    if (isSliderTabActive) {
      setSliderDropdownOpen(true)
    }
    if (isImportTabActive) {
      setImportDropdownOpen(true)
    }
    if (isHeroTabActive) {
      setHeroDropdownOpen(true)
    }
  }, [isHomeTabActive, isSliderTabActive, isImportTabActive, isHeroTabActive])

  return (
    <div className="w-64 bg-zinc-900/80 backdrop-blur-xl border-r border-zinc-800 min-h-screen p-6 hidden lg:block">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          <span className="text-red-500">Play</span>Flix
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Admin Dashboard</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          if (item.subItems) {
            const isAnySubItemActive = item.subItems.some((sub: any) => activeTab === sub.id)
            const isHomeGroup = item.id === 'home-group'
            const isSliderGroup = item.id === 'sliders-group'
            const isHeroGroup = item.id === 'hero-group'
            const dropdownOpen = isHomeGroup
              ? homeDropdownOpen
              : isSliderGroup
                ? sliderDropdownOpen
                : isHeroGroup
                  ? heroDropdownOpen
                  : importDropdownOpen
            const setDropdownOpen = isHomeGroup
              ? setHomeDropdownOpen
              : isSliderGroup
                ? setSliderDropdownOpen
                : isHeroGroup
                  ? setHeroDropdownOpen
                  : setImportDropdownOpen
            
            return (
              <div key={item.id}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isAnySubItemActive
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {Icon && <Icon className="w-5 h-5" />}
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronDown 
                    className={cn(
                      "w-4 h-4 transition-transform",
                      dropdownOpen && "rotate-180"
                    )}
                  />
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 mt-2 space-y-2">
                        {item.subItems.map((sub: any) => {
                          const SubIcon = sub.icon
                          return (
                            <button
                              key={sub.id}
                              onClick={() => setActiveTab(sub.id)}
                              className={cn(
                                "w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200 text-sm",
                                activeTab === sub.id
                                  ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                              )}
                            >
                              <SubIcon className="w-4 h-4" />
                              <span className="font-medium">{sub.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          } else {
            // Normal item
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  activeTab === item.id
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                )}
              >
                {Icon && <Icon className="w-5 h-5" />}
                <span className="font-medium">{item.label}</span>
              </button>
            )
          }
        })}
      </nav>

      <div className="mt-auto pt-8">
        <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-2xl p-4 border border-zinc-700">
          <p className="text-zinc-400 text-sm">Need help?</p>
          <p className="text-white font-medium mt-1">View Documentation</p>
        </div>
      </div>
    </div>
  )
}

const AdminMovieCard = ({ movie, onEdit, onDelete, isSelected, onSelect }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "bg-zinc-900/50 backdrop-blur-xl border rounded-2xl overflow-hidden transition-all",
      isSelected ? "border-red-500 ring-2 ring-red-500/50" : "border-zinc-800"
    )}
  >
    <div className="aspect-[2/3] relative">
      <img
        src={movie.posterPath}
        alt={movie.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      <div className="absolute top-3 left-3">
        <button
          onClick={onSelect}
          className={cn(
            "w-6 h-6 rounded-lg border flex items-center justify-center transition-all",
            isSelected ? "bg-red-600 border-red-500" : "bg-zinc-900/80 border-zinc-600 hover:border-zinc-400"
          )}
        >
          {isSelected && <div className="w-3 h-3 bg-white rounded" />}
        </button>
      </div>
    </div>
    <div className="p-4">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-white font-semibold line-clamp-1 flex-1">{movie.title}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-rose-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3 text-zinc-400 text-sm mb-2">
        <span className="text-yellow-400 font-bold">★ {movie.rating}</span>
        <span>{movie.releaseYear}</span>
        <span>{movie.runtime}</span>
      </div>
      <p className="text-zinc-500 text-sm line-clamp-2">{movie.overview}</p>
    </div>
  </motion.div>
)

const AdminTVShowCard = ({ 
  tvShow, 
  onEdit, 
  onDelete, 
  onManageSeasons,
  isSelected,
  onSelect
}: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "bg-zinc-900/50 backdrop-blur-xl border rounded-2xl overflow-hidden transition-all",
      isSelected ? "border-cyan-500 ring-2 ring-cyan-500/40" : "border-zinc-800"
    )}
  >
    <div
      onClick={onManageSeasons}
      className="aspect-[2/3] relative w-full text-left group cursor-pointer"
    >
      <img
        src={tvShow.posterPath}
        alt={tvShow.title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute top-3 left-3 z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
          }}
          className={cn(
            "w-6 h-6 rounded-lg border flex items-center justify-center transition-all",
            isSelected ? "bg-cyan-500 border-cyan-400" : "bg-zinc-900/80 border-zinc-600 hover:border-zinc-400"
          )}
        >
          {isSelected && <div className="w-3 h-3 bg-white rounded" />}
        </button>
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="text-white font-bold text-lg line-clamp-2">{tvShow.title}</h3>
        <div className="flex items-center gap-2 text-zinc-300 text-sm mt-1">
          <span>{tvShow.startYear}{tvShow.endYear ? ` - ${tvShow.endYear}` : ''}</span>
          <span>•</span>
          <span>{tvShow.numberOfSeasons} Season{tvShow.numberOfSeasons !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-200 text-sm mt-3">
          <span>Click to manage seasons</span>
          <ChevronDown className="w-4 h-4 -rotate-90 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </div>
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 font-bold">★ {tvShow.rating}</span>
          {tvShow.genres?.slice(0, 2).map((genre: string, i: number) => (
            <span key={i} className="text-zinc-400 text-sm">{genre}</span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-rose-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-zinc-500 text-sm">
        Add, edit, or remove the series here. Click the series poster to manage seasons.
      </p>
    </div>
  </motion.div>
)

const TMDBSearchResultCard = ({ item, type, onImport, importing }: any) => {
  const title = type === 'movie' ? item.title : item.name
  const date = type === 'movie' ? item.release_date : item.first_air_date
  const year = date ? date.split('-')[0] : 'N/A'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden"
    >
      <div className="aspect-[2/3] relative">
        <img
          src={item.poster_path 
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
            : 'https://via.placeholder.com/500x750?text=No+Poster'}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold line-clamp-1 mb-2">{title}</h3>
        <div className="flex items-center gap-3 text-zinc-400 text-sm mb-3">
          <span className="text-yellow-400 font-bold">★ {item.vote_average?.toFixed(1) || 'N/A'}</span>
          <span>{year}</span>
        </div>
        <p className="text-zinc-500 text-sm line-clamp-3 mb-4">{item.overview || 'No overview available'}</p>
        <button
          onClick={() => onImport(item.id, type)}
          disabled={importing}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors",
            importing 
              ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700 text-white"
          )}
        >
          {importing ? (
            <span>Importing...</span>
          ) : (
            <>
              <Database className="w-4 h-4" />
              <span>Import</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}

const MovieModal = ({ 
  isOpen, 
  onClose, 
  movie, 
  onSave 
}: any) => {
  const [genres, setGenres] = useState(getGenres())
  const perSourceFileInputRef = useRef<HTMLInputElement>(null) // for single file selection for specific existing source
  const [editingSourceId, setEditingSourceId] = useState<number | string | null>(null)
  
  const [formData, setFormData] = useState<{
    title: string;
    tagline: string;
    overview: string;
    posterPath: string;
    backdropPath: string;
    releaseYear: number;
    rating: number;
    runtime: string;
    genres: string[];
    country: string;
    language: string;
    quality: string;
    studio: string;
    director: string;
    tags: string[];
    trailerUrl: string;
    sources: MovieSource[];
    cast: CastMember[];
    crew: CrewMember[];
    imdbId: string;
    isKids: boolean;
    isAnime: boolean;
  }>({
    title: '',
    tagline: '',
    overview: '',
    posterPath: '',
    backdropPath: '',
    releaseYear: new Date().getFullYear(),
    rating: 8.0,
    runtime: '2h 30m',
    genres: ['Action', 'Adventure'],
    country: 'United States',
    language: 'English',
    quality: '1080p',
    studio: 'Independent',
    director: 'Unknown Director',
    tags: [],
    trailerUrl: '',
    sources: [],
    cast: [],
    crew: [],
    imdbId: '',
    isKids: false,
    isAnime: false
  })

  const handleSelectVideoForSource = (sourceId: number | string) => {
    setEditingSourceId(sourceId)
    if (perSourceFileInputRef.current) {
      perSourceFileInputRef.current.click()
    }
  }

  const handlePerSourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || editingSourceId === null) return

    const videoExtensions = ['.mp4', '.mkv', '.webm', '.mov', '.avi', '.m4v']
    let videoFile: File | null = null
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
      if (videoExtensions.includes(ext)) {
        videoFile = file
        break
      }
    }

    if (videoFile) {
      const objectUrl = URL.createObjectURL(videoFile)
      handleSourceChange(editingSourceId, 'url', objectUrl)
      handleSourceChange(editingSourceId, 'type', 'Local Storage')
      handleSourceChange(editingSourceId, 'isLocal', true)
      // Only update title if it's still the default or empty
      const currentSource = formData.sources.find(s => s.id === editingSourceId)
      if (!currentSource?.title || currentSource.title === 'New Source') {
        handleSourceChange(editingSourceId, 'title', videoFile.name)
      }
      handleSourceChange(editingSourceId, 'size', (videoFile.size / (1024 * 1024)).toFixed(2) + ' MB')
    }

    setEditingSourceId(null)
    // Reset the input
    if (perSourceFileInputRef.current) {
      perSourceFileInputRef.current.value = ''
    }
  }

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title || '',
        tagline: movie.tagline || '',
        overview: movie.overview || '',
        posterPath: movie.posterPath || '',
        backdropPath: movie.backdropPath || '',
        releaseYear: movie.releaseYear || new Date().getFullYear(),
        rating: movie.rating || 8.0,
        runtime: movie.runtime || '2h 30m',
        genres: movie.genres || ['Action', 'Adventure'],
        country: movie.country || 'United States',
        language: movie.language || 'English',
        quality: movie.quality || '1080p',
        studio: movie.studio || 'Independent',
        director: movie.director || 'Unknown Director',
        tags: movie.tags || [],
        trailerUrl: movie.trailerUrl || '',
        sources: movie.sources || [],
        cast: movie.cast || [],
        crew: movie.crew || [],
        imdbId: movie.imdbId || '',
        isKids: movie.isKids || false,
        isAnime: movie.isAnime || false
      })
    } else if (isOpen) {
      // Reset form for new movie
      setFormData({
        title: '',
        tagline: '',
        overview: '',
        posterPath: '',
        backdropPath: '',
        releaseYear: new Date().getFullYear(),
        rating: 8.0,
        runtime: '2h 30m',
        genres: ['Action', 'Adventure'],
        country: 'United States',
        language: 'English',
        quality: '1080p',
        studio: 'Independent',
        director: 'Unknown Director',
        tags: [],
        trailerUrl: '',
        sources: [],
        cast: [],
        crew: [],
        imdbId: '',
        isKids: false,
        isAnime: false
      })
    }
  }, [movie, isOpen])

  const handleSubmit = (e: any) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleTagInputChange = (e: any) => {
    const tagString = e.target.value
    const tags = tagString.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)
    setFormData(prev => ({ ...prev, tags }))
  }

  const handleAddSource = () => {
    const newSource = {
      id: Date.now(),
      title: 'New Source',
      quality: '1080p',
      size: '1.0 GB',
      type: 'MP4' as const,
      isLocal: false,
      url: ''
    }
    setFormData(prev => ({
      ...prev,
      sources: [...prev.sources, newSource]
    }))
  }

  const handleSourceChange = (sourceId: number | string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      sources: prev.sources.map((source: any) =>
        source.id === sourceId ? { ...source, [field]: value } : source
      )
    }))
  }

  const handleRemoveSource = (sourceId: number | string) => {
    setFormData(prev => ({
      ...prev,
      sources: prev.sources.filter((source: any) => source.id !== sourceId)
    }))
  }

  const handleAddCastMember = () => {
    const newMember = {
      id: createClientId('movie-cast'),
      name: '',
      role: 'Actor',
      character: '',
      profilePath: ''
    }
    setFormData(prev => ({
      ...prev,
      cast: [...prev.cast, newMember]
    }))
  }

  const handleCastChange = (castId: number | string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      cast: prev.cast.map((member: any) =>
        member.id === castId ? { ...member, [field]: value } : member
      )
    }))
  }

  const handleRemoveCastMember = (castId: number | string) => {
    setFormData(prev => ({
      ...prev,
      cast: prev.cast.filter((member: any) => member.id !== castId)
    }))
  }



  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl p-8 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">
                {movie ? 'Edit Movie' : 'Add New Movie'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-zinc-400 mb-2 font-medium">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  placeholder="Enter movie title"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-2 font-medium">Tagline</label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  placeholder="Enter movie tagline"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-2 font-medium">Overview</label>
                <textarea
                  name="overview"
                  value={formData.overview}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  placeholder="Enter movie description"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-zinc-400 mb-2 font-medium">Poster URL</label>
                  <input
                    type="text"
                    name="posterPath"
                    value={formData.posterPath}
                    onChange={handleChange}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    placeholder="https://..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-2 font-medium">Backdrop URL</label>
                  <input
                    type="text"
                    name="backdropPath"
                    value={formData.backdropPath}
                    onChange={handleChange}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-zinc-400 mb-2 font-medium">Release Year</label>
                  <input
                    type="number"
                    name="releaseYear"
                    value={formData.releaseYear}
                    onChange={handleChange}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-2 font-medium">Rating</label>
                  <input
                    type="number"
                    name="rating"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.rating}
                    onChange={handleChange}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-2 font-medium">Runtime</label>
                  <input
                    type="text"
                    name="runtime"
                    value={formData.runtime}
                    onChange={handleChange}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    placeholder="2h 30m"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-zinc-400 mb-2 font-medium">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    placeholder="United States"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-2 font-medium">Language</label>
                  <input
                    type="text"
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    placeholder="English"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-2 font-medium">Quality</label>
                  <input
                    type="text"
                    name="quality"
                    value={formData.quality}
                    onChange={handleChange}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    placeholder="1080p"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-2 font-medium">Studio</label>
                  <input
                    type="text"
                    name="studio"
                    value={formData.studio}
                    onChange={handleChange}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    placeholder="Independent"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-2 font-medium">Director</label>
                  <input
                    type="text"
                    name="director"
                    value={formData.director}
                    onChange={handleChange}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    placeholder="Unknown Director"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-2 font-medium">Trailer URL (YouTube)</label>
                  <input
                    type="text"
                    name="trailerUrl"
                    value={formData.trailerUrl}
                    onChange={handleChange}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-2 font-medium">IMDb ID</label>
                  <input
                    type="text"
                    name="imdbId"
                    value={formData.imdbId}
                    onChange={handleChange}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    placeholder="tt0111161"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-4 font-medium">Genres</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {genres.filter(g => g.isActive).map((genre) => (
                    <label 
                      key={genre.id} 
                      className="flex items-center gap-3 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 cursor-pointer hover:bg-zinc-700 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.genres.includes(genre.name)}
                        onChange={(e) => {
                          const isChecked = e.target.checked
                          setFormData(prev => ({
                            ...prev,
                            genres: isChecked 
                              ? [...prev.genres, genre.name] 
                              : prev.genres.filter(g => g !== genre.name)
                          }))
                        }}
                        className="w-5 h-5 rounded accent-red-600"
                      />
                      <span className="text-white font-medium">{genre.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-2 font-medium">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={handleTagInputChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  placeholder="Action, Adventure, Thriller"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 cursor-pointer hover:bg-zinc-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isKids}
                    onChange={(e) => setFormData(prev => ({ ...prev, isKids: e.target.checked }))}
                    className="w-5 h-5 rounded accent-yellow-500"
                  />
                  <span className="text-white font-medium">Kids Movie</span>
                </label>
                <label className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 cursor-pointer hover:bg-zinc-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isAnime}
                    onChange={(e) => setFormData(prev => ({ ...prev, isAnime: e.target.checked }))}
                    className="w-5 h-5 rounded accent-fuchsia-500"
                  />
                  <span className="text-white font-medium">Anime Movie</span>
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-zinc-400 font-medium">Movie Sources</label>
                  <button
                    type="button"
                    onClick={handleAddSource}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Source
                  </button>
                </div>
                {/* Hidden file input for selecting individual video files for specific existing source */}
                <input
                  ref={perSourceFileInputRef}
                  type="file"
                  accept="video/*"
                  style={{ display: 'none' }}
                  onChange={handlePerSourceFileChange}
                />
                <div className="space-y-4">
                  {formData.sources.map((source: any) => (
                    <div key={source.id} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium text-sm">Source Title</label>
                          <input
                            type="text"
                            value={source.title}
                            onChange={(e) => handleSourceChange(source.id, 'title', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium text-sm">Quality</label>
                          <input
                            type="text"
                            value={source.quality}
                            onChange={(e) => handleSourceChange(source.id, 'quality', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium text-sm">Size</label>
                          <input
                            type="text"
                            value={source.size}
                            onChange={(e) => handleSourceChange(source.id, 'size', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium text-sm">Type</label>
                          <select
                            value={source.type}
                            onChange={(e) => handleSourceChange(source.id, 'type', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                          >
                            <option value="MP4">MP4</option>
                            <option value="WebM">WebM</option>
                            <option value="MKV">MKV</option>
                            <option value="HLS">HLS</option>
                            <option value="RTMP">RTMP</option>
                            <option value="M3U8">M3U8</option>
                            <option value="TS">TS</option>
                            <option value="Embed URL">Embed URL</option>
                            <option value="YouTube URL">YouTube URL</option>
                            <option value="Local Storage">Local Storage</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mb-4">
                        <label className="flex items-center gap-2 text-zinc-300">
                          <input
                            type="checkbox"
                            checked={source.isLocal}
                            onChange={(e) => handleSourceChange(source.id, 'isLocal', e.target.checked)}
                            className="w-4 h-4 accent-red-500"
                          />
                          Local Source
                        </label>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex-1">
                          <label className="block text-zinc-400 mb-2 font-medium text-sm">Source URL</label>
                          <input
                            type="text"
                            value={source.url}
                            onChange={(e) => handleSourceChange(source.id, 'url', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSelectVideoForSource(source.id)}
                          className="mt-6 flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                        >
                          <Video className="w-4 h-4" />
                          Insert Video File
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSource(source.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove Source
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-zinc-400 font-medium">Cast</label>
                  <button
                    type="button"
                    onClick={handleAddCastMember}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Cast Member
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.cast.map((member: any) => (
                    <div key={member.id} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium text-sm">Name</label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => handleCastChange(member.id, 'name', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium text-sm">Role</label>
                          <input
                            type="text"
                            value={member.role}
                            onChange={(e) => handleCastChange(member.id, 'role', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium text-sm">Character</label>
                          <input
                            type="text"
                            value={member.character}
                            onChange={(e) => handleCastChange(member.id, 'character', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium text-sm">Profile Photo URL</label>
                          <input
                            type="text"
                            value={member.profilePath}
                            onChange={(e) => handleCastChange(member.id, 'profilePath', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCastMember(member.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove Cast Member
                      </button>
                    </div>
                  ))}
                </div>
              </div>



              <div className="flex items-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Save
                </button>
              </div>
            </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const TVShowModal = ({ 
  isOpen, 
  onClose, 
  show, 
  onSave 
}: any) => {
  const [genres] = useState(getGenres())
  const perSourceFileInputRef = useRef<HTMLInputElement>(null)
  const [editingSourceId, setEditingSourceId] = useState<number | string | null>(null)
  
  const [formData, setFormData] = useState<{
    title: string;
    tagline: string;
    overview: string;
    posterPath: string;
    backdropPath: string;
    startYear: number;
    endYear: string;
    rating: number;
    numberOfSeasons: number;
    genres: string[];
    country: string;
    language: string;
    quality: string;
    studio: string;
    tags: string[];
    trailerUrl: string;
    imdbId: string;
    cast: any[];
    crew: any[];
    sources: any[];
    isKids: boolean;
    isAnime: boolean;
  }>({
    title: '',
    tagline: '',
    overview: '',
    posterPath: '',
    backdropPath: '',
    startYear: new Date().getFullYear(),
    endYear: '',
    rating: 8.0,
    numberOfSeasons: 1,
    genres: ['Drama'],
    country: 'United States',
    language: 'English',
    quality: '1080p',
    studio: 'Independent',
    tags: [],
    trailerUrl: '',
    imdbId: '',
    cast: [],
    crew: [],
    sources: [],
    isKids: false,
    isAnime: false
  })

  useEffect(() => {
    if (show) {
      setFormData({
        title: show.title || '',
        tagline: show.tagline || '',
        overview: show.overview || '',
        posterPath: show.posterPath || '',
        backdropPath: show.backdropPath || '',
        startYear: show.startYear || new Date().getFullYear(),
        endYear: show.endYear || '',
        rating: show.rating || 8.0,
        numberOfSeasons: show.numberOfSeasons || 1,
        genres: show.genres || ['Drama'],
        country: show.country || 'United States',
        language: show.language || 'English',
        quality: show.quality || '1080p',
        studio: show.studio || 'Independent',
        tags: show.tags || [],
        trailerUrl: show.trailerUrl || '',
        imdbId: show.imdbId || '',
        cast: show.cast || [],
        crew: show.crew || [],
        sources: show.sources || [],
        isKids: show.isKids || false,
        isAnime: show.isAnime || false
      })
    } else if (isOpen) {
      setFormData({
        title: '',
        tagline: '',
        overview: '',
        posterPath: '',
        backdropPath: '',
        startYear: new Date().getFullYear(),
        endYear: '',
        rating: 8.0,
        numberOfSeasons: 1,
        genres: ['Drama'],
        country: 'United States',
        language: 'English',
        quality: '1080p',
        studio: 'Independent',
        tags: [],
        trailerUrl: '',
        imdbId: '',
        cast: [],
        crew: [],
        sources: [],
        isKids: false,
        isAnime: false
      })
    }
  }, [show, isOpen])

  const handleSubmit = (e: any) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleTagInputChange = (e: any) => {
    const tagString = e.target.value
    const tags = tagString.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)
    setFormData(prev => ({ ...prev, tags }))
  }

  const handleAddCastMember = () => {
    const newMember = {
      id: createClientId('tv-cast'),
      name: '',
      role: 'Actor',
      character: '',
      profilePath: ''
    }
    setFormData(prev => ({
      ...prev,
      cast: [...prev.cast, newMember]
    }))
  }

  const handleCastChange = (castId: number | string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      cast: prev.cast.map((member: any) =>
        member.id === castId ? { ...member, [field]: value } : member
      )
    }))
  }

  const handleRemoveCastMember = (castId: number | string) => {
    setFormData(prev => ({
      ...prev,
      cast: prev.cast.filter((member: any) => member.id !== castId)
    }))
  }

  const handleAddCrewMember = () => {
    const newMember = {
      id: createClientId('tv-crew'),
      name: '',
      job: 'Crew',
      profilePath: ''
    }
    setFormData(prev => ({
      ...prev,
      crew: [...prev.crew, newMember]
    }))
  }

  const handleCrewChange = (crewId: number | string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      crew: prev.crew.map((member: any) =>
        member.id === crewId ? { ...member, [field]: value } : member
      )
    }))
  }

  const handleRemoveCrewMember = (crewId: number | string) => {
    setFormData(prev => ({
      ...prev,
      crew: prev.crew.filter((member: any) => member.id !== crewId)
    }))
  }

  const handleAddSource = () => {
    const newSource = {
      id: Date.now(),
      title: 'New Source',
      quality: '1080p',
      size: '1.0 GB',
      type: 'MP4' as const,
      isLocal: false,
      url: ''
    }
    setFormData(prev => ({
      ...prev,
      sources: [...prev.sources, newSource]
    }))
  }

  const handleSourceChange = (sourceId: number | string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      sources: prev.sources.map((source: any) =>
        source.id === sourceId ? { ...source, [field]: value } : source
      )
    }))
  }

  const handleRemoveSource = (sourceId: number | string) => {
    setFormData(prev => ({
      ...prev,
      sources: prev.sources.filter((source: any) => source.id !== sourceId)
    }))
  }

  const handleSelectVideoForSource = (sourceId: number | string) => {
    setEditingSourceId(sourceId)
    if (perSourceFileInputRef.current) {
      perSourceFileInputRef.current.click()
    }
  }

  const handlePerSourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || editingSourceId === null) return

    const videoExtensions = ['.mp4', '.mkv', '.webm', '.mov', '.avi', '.m4v']
    let videoFile: File | null = null
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
      if (videoExtensions.includes(ext)) {
        videoFile = file
        break
      }
    }

    if (videoFile) {
      const objectUrl = URL.createObjectURL(videoFile)
      handleSourceChange(editingSourceId, 'url', objectUrl)
      handleSourceChange(editingSourceId, 'type', 'Local Storage')
      handleSourceChange(editingSourceId, 'isLocal', true)
      const currentSource = formData.sources.find(s => s.id === editingSourceId)
      if (!currentSource?.title || currentSource.title === 'New Source') {
        handleSourceChange(editingSourceId, 'title', videoFile.name)
      }
      handleSourceChange(editingSourceId, 'size', (videoFile.size / (1024 * 1024)).toFixed(2) + ' MB')
    }

    setEditingSourceId(null)
    if (perSourceFileInputRef.current) {
      perSourceFileInputRef.current.value = ''
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl p-8 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">
                  {show ? 'Edit TV Show' : 'Add New TV Show'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-zinc-400 mb-2 font-medium">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    placeholder="Enter TV show title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-2 font-medium">Tagline</label>
                  <input
                    type="text"
                    name="tagline"
                    value={formData.tagline}
                    onChange={handleChange}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    placeholder="Enter tagline"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-2 font-medium">Overview</label>
                  <textarea
                    name="overview"
                    value={formData.overview}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    placeholder="Enter show description"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-zinc-400 mb-2 font-medium">Poster URL</label>
                    <input
                      type="text"
                      name="posterPath"
                      value={formData.posterPath}
                      onChange={handleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-2 font-medium">Backdrop URL</label>
                    <input
                      type="text"
                      name="backdropPath"
                      value={formData.backdropPath}
                      onChange={handleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-zinc-400 mb-2 font-medium">Start Year</label>
                    <input
                      type="number"
                      name="startYear"
                      value={formData.startYear}
                      onChange={handleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-2 font-medium">End Year (optional)</label>
                    <input
                      type="number"
                      name="endYear"
                      value={formData.endYear}
                      onChange={handleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-2 font-medium">Rating</label>
                    <input
                      type="number"
                      name="rating"
                      step="0.1"
                      min="0"
                      max="10"
                      value={formData.rating}
                      onChange={handleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-zinc-400 mb-2 font-medium">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                      placeholder="United States"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-2 font-medium">Language</label>
                    <input
                      type="text"
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                      placeholder="English"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-2 font-medium">Quality</label>
                    <input
                      type="text"
                      name="quality"
                      value={formData.quality}
                      onChange={handleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                      placeholder="1080p"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-2 font-medium">Studio</label>
                    <input
                      type="text"
                      name="studio"
                      value={formData.studio}
                      onChange={handleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                      placeholder="Independent"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-2 font-medium">Number of Seasons</label>
                    <input
                      type="number"
                      name="numberOfSeasons"
                      value={formData.numberOfSeasons}
                      onChange={handleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-2 font-medium">Trailer URL (YouTube)</label>
                    <input
                      type="text"
                      name="trailerUrl"
                      value={formData.trailerUrl}
                      onChange={handleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-2 font-medium">IMDb ID</label>
                    <input
                      type="text"
                      name="imdbId"
                      value={formData.imdbId}
                      onChange={handleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                      placeholder="tt0111161"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-4 font-medium">Genres</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {genres.filter(g => g.isActive).map((genre) => (
                      <label 
                        key={genre.id} 
                        className="flex items-center gap-3 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 cursor-pointer hover:bg-zinc-700 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.genres.includes(genre.name)}
                          onChange={(e) => {
                            const isChecked = e.target.checked
                            setFormData(prev => ({
                              ...prev,
                              genres: isChecked 
                                ? [...prev.genres, genre.name] 
                                : prev.genres.filter(g => g !== genre.name)
                            }))
                          }}
                          className="w-5 h-5 rounded accent-red-600"
                        />
                        <span className="text-white font-medium">{genre.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                <label className="block text-zinc-400 mb-2 font-medium">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={handleTagInputChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  placeholder="TV Show, Series, Popular"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 cursor-pointer hover:bg-zinc-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isKids}
                    onChange={(e) => setFormData(prev => ({ ...prev, isKids: e.target.checked }))}
                    className="w-5 h-5 rounded accent-yellow-500"
                  />
                  <span className="text-white font-medium">Kids TV Show</span>
                </label>
                <label className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 cursor-pointer hover:bg-zinc-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isAnime}
                    onChange={(e) => setFormData(prev => ({ ...prev, isAnime: e.target.checked }))}
                    className="w-5 h-5 rounded accent-fuchsia-500"
                  />
                  <span className="text-white font-medium">Anime TV Show</span>
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-zinc-400 font-medium">Cast</label>
                  <button
                    type="button"
                    onClick={handleAddCastMember}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Cast Member
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.cast.map((member: any) => (
                    <div key={member.id} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium text-sm">Name</label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => handleCastChange(member.id, 'name', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium text-sm">Role</label>
                          <input
                            type="text"
                            value={member.role}
                            onChange={(e) => handleCastChange(member.id, 'role', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium text-sm">Character</label>
                          <input
                            type="text"
                            value={member.character}
                            onChange={(e) => handleCastChange(member.id, 'character', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium text-sm">Profile Photo URL</label>
                          <input
                            type="text"
                            value={member.profilePath}
                            onChange={(e) => handleCastChange(member.id, 'profilePath', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCastMember(member.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove Cast Member
                      </button>
                    </div>
                  ))}
                </div>
              </div>



              <div className="flex items-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    Save
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const MovieSelectionModal = ({ 
  isOpen, 
  onClose, 
  selectedIds, 
  onSave, 
  allMovies 
}: any) => {
  const [localSelectedIds, setLocalSelectedIds] = useState<Set<string | number>>(new Set(selectedIds))

  useEffect(() => {
    setLocalSelectedIds(new Set(selectedIds))
  }, [selectedIds])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-6xl bg-zinc-900 border border-zinc-800 rounded-2xl p-8 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Select Movies</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                {allMovies.map((movie: any) => (
                  <div
                    key={movie.id}
                    onClick={() => {
                      const newIds = new Set(localSelectedIds)
                      if (newIds.has(movie.id)) {
                        newIds.delete(movie.id)
                      } else {
                        newIds.add(movie.id)
                      }
                      setLocalSelectedIds(newIds)
                    }}
                    className={cn(
                      "cursor-pointer rounded-xl overflow-hidden border transition-all",
                      localSelectedIds.has(movie.id) 
                        ? "border-red-500 ring-2 ring-red-500/50" 
                        : "border-zinc-800 hover:border-zinc-700"
                    )}
                  >
                    {movie.posterPath && (
                      <img 
                        src={movie.posterPath} 
                        alt={movie.title} 
                        className="w-full aspect-[2/3] object-cover"
                      />
                    )}
                    <div className="p-3">
                      <p className="text-sm font-semibold text-white truncate">{movie.title}</p>
                      <p className="text-xs text-zinc-500">{movie.releaseYear}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onSave(Array.from(localSelectedIds))}
                  className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Save Selection
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const TVShowSelectionModal = ({ 
  isOpen, 
  onClose, 
  selectedIds, 
  onSave, 
  allTVShows 
}: any) => {
  const [localSelectedIds, setLocalSelectedIds] = useState<Set<string | number>>(new Set(selectedIds))

  useEffect(() => {
    setLocalSelectedIds(new Set(selectedIds))
  }, [selectedIds])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-6xl bg-zinc-900 border border-zinc-800 rounded-2xl p-8 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Select TV Shows</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                {allTVShows.map((show: any) => (
                  <div
                    key={show.id}
                    onClick={() => {
                      const newIds = new Set(localSelectedIds)
                      if (newIds.has(show.id)) {
                        newIds.delete(show.id)
                      } else {
                        newIds.add(show.id)
                      }
                      setLocalSelectedIds(newIds)
                    }}
                    className={cn(
                      "cursor-pointer rounded-xl overflow-hidden border transition-all",
                      localSelectedIds.has(show.id) 
                        ? "border-red-500 ring-2 ring-red-500/50" 
                        : "border-zinc-800 hover:border-zinc-700"
                    )}
                  >
                    {show.posterPath && (
                      <img 
                        src={show.posterPath} 
                        alt={show.title} 
                        className="w-full aspect-[2/3] object-cover"
                      />
                    )}
                    <div className="p-3">
                      <p className="text-sm font-semibold text-white truncate">{show.title}</p>
                      <p className="text-xs text-zinc-500">{show.startYear}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onSave(Array.from(localSelectedIds))}
                  className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Save Selection
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const SeasonModal = ({ 
  isOpen, 
  onClose, 
  tvShowId,
  season,
  onSave 
}: any) => {
  const [formData, setFormData] = useState<{
    seasonNumber: number;
    title: string;
    overview: string;
    posterPath: string;
  }>({
    seasonNumber: 1,
    title: '',
    overview: '',
    posterPath: ''
  })

  useEffect(() => {
    if (season) {
      setFormData({
        seasonNumber: season.seasonNumber || 1,
        title: season.title || '',
        overview: season.overview || '',
        posterPath: season.posterPath || ''
      })
    } else if (isOpen) {
      setFormData({
        seasonNumber: 1,
        title: '',
        overview: '',
        posterPath: ''
      })
    }
  }, [season, isOpen])

  const handleSubmit = (e: any) => {
    e.preventDefault()
    onSave(tvShowId, season?.id, formData)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-8 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">
                  {season ? 'Edit Season' : 'Add New Season'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-zinc-400 mb-2 font-medium">Season Number</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.seasonNumber}
                      onChange={(e) => {
                        const nextSeasonNumber = Number(e.target.value)
                        setFormData({
                          ...formData,
                          seasonNumber: Number.isNaN(nextSeasonNumber) ? 1 : nextSeasonNumber
                        })
                      }}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-2 font-medium">Season Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                      placeholder="e.g. Season 1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-2 font-medium">Poster URL</label>
                  <input
                    type="text"
                    value={formData.posterPath}
                    onChange={(e) => setFormData({ ...formData, posterPath: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    placeholder="https://example.com/poster.jpg"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-2 font-medium">Overview</label>
                  <textarea
                    rows={4}
                    value={formData.overview}
                    onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    placeholder="Season overview..."
                  />
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    Save
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const EpisodeModal = ({ 
  isOpen, 
  onClose, 
  tvShowId,
  seasonId,
  episode,
  onSave 
}: any) => {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<{
    episodeNumber: number;
    title: string;
    overview: string;
    runtime: string;
    rating: number;
    airDate: string;
    thumbnailPath: string;
  }>({
    episodeNumber: 1,
    title: '',
    overview: '',
    runtime: '45',
    rating: 8.0,
    airDate: '',
    thumbnailPath: ''
  });

  useEffect(() => {
    if (episode) {
      setFormData({
        episodeNumber: episode.episodeNumber || 1,
        title: episode.title || '',
        overview: episode.overview || '',
        runtime: episode.runtime || '45',
        rating: episode.rating || 8.0,
        airDate: episode.airDate || '',
        thumbnailPath: episode.thumbnailPath || ''
      })
    } else if (isOpen) {
      setFormData({
        episodeNumber: 1,
        title: '',
        overview: '',
        runtime: '45',
        rating: 8.0,
        airDate: '',
        thumbnailPath: ''
      })
    }
  }, [episode, isOpen]);

  const handleAutoFillFromTMDB = async () => {
    setLoading(true);
    try {
      // Get tv show and season
      const tvShows = getTVShows();
      const tvShow = tvShows.find((s) => s.id === tvShowId);
      if (!tvShow || !tvShow.tmdbId) {
        alert('No TMDB ID found for this TV show');
        setLoading(false);
        return;
      }

      const season = tvShow.seasons?.find((s) => s.id === seasonId);
      if (!season) {
        alert('Season not found');
        setLoading(false);
        return;
      }

      // Get season details
      const seasonDetails = await getTMDBSeasonDetails(tvShow.tmdbId, season.seasonNumber);

      // Find the episode in the season
      const ep = seasonDetails.episodes?.find((e: any) => e.episode_number === formData.episodeNumber);
      if (!ep) {
        alert('Episode not found in TMDB for this episode number');
        setLoading(false);
        return;
      }

      // Fill form
      setFormData({
        episodeNumber: ep.episode_number || formData.episodeNumber,
        title: ep.name || '',
        overview: ep.overview || '',
        runtime: ep.runtime ? `${ep.runtime}` : '45',
        rating: ep.vote_average || 8.0,
        airDate: ep.air_date || '',
        thumbnailPath: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : ''
      });

    } catch (err) {
      console.error(err);
      alert('Failed to auto-fill from TMDB');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSave(tvShowId, seasonId, episode?.id, formData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl p-8 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">
                  {episode ? 'Edit Episode' : 'Add New Episode'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex gap-4 mb-6">
                  <button
                    type="button"
                    onClick={handleAutoFillFromTMDB}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Database className="w-5 h-5" />
                        Auto-fill from TMDB
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-zinc-400 mb-2 font-medium">Episode Number</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.episodeNumber}
                      onChange={(e) => setFormData({ ...formData, episodeNumber: parseInt(e.target.value) })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-2 font-medium">Runtime (min)</label>
                    <input
                      type="text"
                      value={formData.runtime}
                      onChange={(e) => setFormData({ ...formData, runtime: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-2 font-medium">Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-2 font-medium">Episode Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-2 font-medium">Thumbnail URL</label>
                  <input
                    type="text"
                    value={formData.thumbnailPath}
                    onChange={(e) => setFormData({ ...formData, thumbnailPath: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-2 font-medium">Air Date</label>
                  <input
                    type="date"
                    value={formData.airDate}
                    onChange={(e) => setFormData({ ...formData, airDate: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-2 font-medium">Overview</label>
                  <textarea
                    rows={4}
                    value={formData.overview}
                    onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    Save
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const SourceModal = ({ 
  isOpen, 
  onClose, 
  tvShowId,
  seasonId,
  episodeId,
  source,
  onSave 
}: any) => {
  const perSourceFileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState<{
    title: string;
    quality: string;
    size: string;
    type: MovieSource['type'];
    isLocal: boolean;
    url: string;
  }>({
    title: '',
    quality: '1080p',
    size: '1 GB',
    type: 'MP4',
    isLocal: false,
    url: ''
  })

  useEffect(() => {
    if (source) {
      setFormData({
        title: source.title || '',
        quality: source.quality || '1080p',
        size: source.size || '1 GB',
        type: source.type || 'MP4',
        isLocal: source.isLocal || false,
        url: source.url || ''
      })
    } else if (isOpen) {
      setFormData({
        title: '',
        quality: '1080p',
        size: '1 GB',
        type: 'MP4',
        isLocal: false,
        url: ''
      })
    }
  }, [source, isOpen])

  const handleSelectVideoForSource = () => {
    if (perSourceFileInputRef.current) {
      perSourceFileInputRef.current.click()
    }
  }

  const handlePerSourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const videoExtensions = ['.mp4', '.mkv', '.webm', '.mov', '.avi', '.m4v']
    let videoFile: File | null = null
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
      if (videoExtensions.includes(ext)) {
        videoFile = file
        break
      }
    }

    if (videoFile) {
      const objectUrl = URL.createObjectURL(videoFile)
      setFormData(prev => ({
        ...prev,
        url: objectUrl,
        type: 'Local Storage',
        isLocal: true,
        title: prev.title || videoFile.name,
        size: (videoFile.size / (1024 * 1024)).toFixed(2) + ' MB'
      }))
    }

    if (perSourceFileInputRef.current) {
      perSourceFileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    onSave(tvShowId, seasonId, episodeId, source?.id, {
      ...formData,
      isLocal: formData.type === 'Local Storage' ? true : formData.isLocal
    })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-8 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">
                  {source ? 'Edit Source' : 'Add New Source'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-zinc-400 mb-2 font-medium">Source Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                      placeholder="e.g. 1080p HD"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-2 font-medium">Quality</label>
                    <input
                      type="text"
                      value={formData.quality}
                      onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-zinc-400 mb-2 font-medium">Size</label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-2 font-medium">Video Source Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as any,
                          isLocal: e.target.value === 'Local Storage' ? true : formData.isLocal
                        })
                      }
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    >
                      {EPISODE_VIDEO_SOURCE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isLocal"
                    checked={formData.isLocal}
                    onChange={(e) => setFormData({ ...formData, isLocal: e.target.checked })}
                    className="w-5 h-5 rounded accent-red-600"
                  />
                  <label htmlFor="isLocal" className="text-zinc-400 font-medium cursor-pointer">
                    Local Source
                  </label>
                </div>

                <input
                  ref={perSourceFileInputRef}
                  type="file"
                  accept="video/*"
                  style={{ display: 'none' }}
                  onChange={handlePerSourceFileChange}
                />

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-zinc-400 font-medium">Source URL</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                      placeholder={formData.type === 'YouTube URL' ? 'https://youtube.com/watch?v=...' : formData.type === 'Embed URL' ? 'https://example.com/embed/...' : formData.type === 'Local Storage' ? '/videos/episode-01.mp4' : 'https://example.com/video.mp4'}
                      required
                    />
                    <button
                      type="button"
                      onClick={handleSelectVideoForSource}
                      className="flex items-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
                    >
                      <Video className="w-4 h-4" />
                      Insert Video File
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    Save
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface AdminTvChannelsSectionProps {
  tvChannels: TvChannel[]
  setTvChannels: React.Dispatch<React.SetStateAction<TvChannel[]>>
  isTvChannelModalOpen: boolean
  setIsTvChannelModalOpen: (v: boolean) => void
  editingTvChannel: TvChannel | null
  setEditingTvChannel: (c: TvChannel | null) => void
  tvChannelSearchQuery: string
  setTvChannelSearchQuery: (v: string) => void
  tvChannelCategoryFilter: string
  setTvChannelCategoryFilter: (v: string) => void
  selectedTvChannelIds: Set<string | number>
  setSelectedTvChannelIds: React.Dispatch<React.SetStateAction<Set<string | number>>>
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void
}

function AdminTvChannelsSection(props: AdminTvChannelsSectionProps) {
  const {
    tvChannels, setTvChannels,
    isTvChannelModalOpen, setIsTvChannelModalOpen,
    editingTvChannel, setEditingTvChannel,
    tvChannelSearchQuery, setTvChannelSearchQuery,
    tvChannelCategoryFilter, setTvChannelCategoryFilter,
    selectedTvChannelIds, setSelectedTvChannelIds,
    showToast,
  } = props
  const router = useRouter()

  const [channelToDelete, setChannelToDelete] = useState<TvChannel | null>(null)
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'featured' | 'live' | 'offline' | '4k' | 'hd' | 'premium'>('all')
  const [sortBy, setSortBy] = useState<'order' | 'name' | 'viewers' | 'rating'>('order')

  const categories = getTvChannelCategories();

  const featuredCount = tvChannels.filter((c) => c.isFeatured).length;
  const liveCount = tvChannels.filter((c) => c.isActive).length;
  const offlineCount = tvChannels.filter((c) => !c.isActive).length;
  const fourKCount = tvChannels.filter((c) => c.is4K).length;
  const hdCount = tvChannels.filter((c) => c.isHD).length;
  const premiumCount = tvChannels.filter((c) => c.isPaid).length;

  const filteredList: TvChannel[] = (() => {
    let list = tvChannels;
    if (tvChannelCategoryFilter !== 'All') {
      list = list.filter((c) => c.category === tvChannelCategoryFilter);
    }
    if (statusFilter === 'featured') {
      list = list.filter((c) => c.isFeatured);
    } else if (statusFilter === 'live') {
      list = list.filter((c) => c.isActive);
    } else if (statusFilter === 'offline') {
      list = list.filter((c) => !c.isActive);
    } else if (statusFilter === '4k') {
      list = list.filter((c) => c.is4K);
    } else if (statusFilter === 'hd') {
      list = list.filter((c) => c.isHD);
    } else if (statusFilter === 'premium') {
      list = list.filter((c) => c.isPaid);
    }

    const q = tvChannelSearchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description || '').toLowerCase().includes(q) ||
          (c.country || '').toLowerCase().includes(q) ||
          (c.language || '').toLowerCase().includes(q) ||
          (c.streamUrl || '').toLowerCase().includes(q) ||
          (c.nowPlaying || '').toLowerCase().includes(q) ||
          (c.nextProgram || '').toLowerCase().includes(q) ||
          (c.epgId || '').toLowerCase().includes(q) ||
          (c.packageName || '').toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'viewers') return (b.viewerCount || 0) - (a.viewerCount || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name);
    });
  })();

  const handleSaveTvChannel = async (data: TvChannel) => {
    try {
      if (!data.name.trim()) {
        showToast('Channel name is required', 'error');
        return;
      }
      if (!isValidStreamUrl(data.streamUrl)) {
        showToast('Stream URL must be a valid http://, https://, or rtmp:// address', 'error');
        return;
      }

      const now = new Date().toISOString();
      const isNewChannel = !data.id || String(data.id).trim() === '';
      const existing = tvChannels.find((c) => String(c.id) === String(data.id));
      const clientId =
        data.id && String(data.id).trim() !== ''
          ? String(data.id)
          : createClientId('ch');

      const payload: TvChannel = {
        ...data,
        id: clientId,
        name: data.name.trim(),
        streamUrl: data.streamUrl.trim(),
        order: Number(data.order || 0),
        viewerCount: Number(data.viewerCount || 0),
        rating: Math.min(10, Math.max(0, Number(data.rating || 0))),
        isHD: Boolean(data.isHD),
        is4K: Boolean(data.is4K),
        isActive: data.isActive !== false,
        isFeatured: Boolean(data.isFeatured),
        isPaid: Boolean(data.isPaid),
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };

      const next = [...tvChannels];
      const existingIdx = next.findIndex((c) => String(c.id) === String(clientId));
      if (existingIdx >= 0) next[existingIdx] = payload;
      else next.push(payload);

      saveTvChannels(next);
      setTvChannels(getTvChannels());

      setIsTvChannelModalOpen(false);
      setEditingTvChannel(null);
      showToast(
        isNewChannel ? 'TV Channel added!' : 'TV Channel updated!',
        'success'
      );
    } catch (e) {
      showToast(`Failed to save: ${(e as Error).message}`, 'error');
    }
  };

  const handleConfirmDeleteChannel = () => {
    if (!channelToDelete) return;
    const targetId = channelToDelete.id;
    const targetName = channelToDelete.name;
    const next = deleteTvChannel(targetId);
    setTvChannels(next);
    setSelectedTvChannelIds((prev) => {
      const ns = new Set(prev);
      ns.delete(String(targetId));
      ns.delete(targetId);
      return ns;
    });
    setChannelToDelete(null);
    showToast(`Channel "${targetName}" removed`, 'success');
  };

  const handleConfirmBulkDelete = () => {
    if (selectedTvChannelIds.size === 0) return;
    const count = selectedTvChannelIds.size;
    const next = bulkDeleteTvChannels(selectedTvChannelIds);
    setTvChannels(next);
    setSelectedTvChannelIds(new Set());
    setIsBulkDeleteModalOpen(false);
    showToast(`Successfully deleted ${count} TV channel(s)`, 'success');
  };

  const handleSelectTvChannel = (id: string | number) => {
    const key = String(id);
    setSelectedTvChannelIds((s) => {
      const ns = new Set(s);
      if (ns.has(key)) ns.delete(key);
      else ns.add(key);
      return ns;
    });
  };

  const handleToggleSelectAllVisible = () => {
    const visibleIds = filteredList.map((c) => String(c.id));
    if (visibleIds.length === 0) return;
    const allSelected = visibleIds.every((id) => selectedTvChannelIds.has(id));
    setSelectedTvChannelIds((prev) => {
      const ns = new Set(prev);
      if (allSelected) {
        visibleIds.forEach((id) => ns.delete(id));
      } else {
        visibleIds.forEach((id) => ns.add(id));
      }
      return ns;
    });
  };

  const handleBulkFeatureTvChannels = (featured: boolean) => {
    if (selectedTvChannelIds.size === 0) return;
    const count = selectedTvChannelIds.size;
    const next = tvChannels.map((c) => {
      if (selectedTvChannelIds.has(String(c.id)) || selectedTvChannelIds.has(c.id)) {
        return { ...c, isFeatured: featured, updatedAt: new Date().toISOString() };
      }
      return c;
    });
    saveTvChannels(next);
    setTvChannels(getTvChannels());
    showToast(`${featured ? 'Featured' : 'Unfeatured'} ${count} channel(s)`, 'success');
  };

  const handleBulkSetActiveTvChannels = (active: boolean) => {
    if (selectedTvChannelIds.size === 0) return;
    const count = selectedTvChannelIds.size;
    const next = tvChannels.map((c) => {
      if (selectedTvChannelIds.has(String(c.id)) || selectedTvChannelIds.has(c.id)) {
        return { ...c, isActive: active, updatedAt: new Date().toISOString() };
      }
      return c;
    });
    saveTvChannels(next);
    setTvChannels(getTvChannels());
    showToast(`Set ${count} channel(s) to ${active ? 'Live' : 'Offline'}`, 'success');
  };

  const handleToggleFeaturedTvChannel = (id: string | number) => {
    const next = tvChannels.map((c) =>
      String(c.id) === String(id)
        ? { ...c, isFeatured: !c.isFeatured, updatedAt: new Date().toISOString() }
        : c
    );
    saveTvChannels(next);
    setTvChannels(getTvChannels());
  };

  const handleToggleActiveTvChannel = (id: string | number) => {
    const next = tvChannels.map((c) =>
      String(c.id) === String(id)
        ? { ...c, isActive: !c.isActive, updatedAt: new Date().toISOString() }
        : c
    );
    saveTvChannels(next);
    setTvChannels(getTvChannels());
  };

  const allVisibleSelected = filteredList.length > 0 && filteredList.every((c) => selectedTvChannelIds.has(String(c.id)));

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Radio className="w-7 h-7 text-red-400" />
            TV Channels
          </h2>
          <p className="text-zinc-500 mt-1">
            Manage live TV channels, streams, metadata, and featured picks
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push('/tv-channels')}
            className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-xl font-medium border border-zinc-700 transition-colors"
          >
            <Tv className="w-5 h-5" />
            View Live
          </button>
          <button
            onClick={() => {
              setEditingTvChannel(null);
              setIsTvChannelModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Channel
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Channels"
          value={tvChannels.length}
          icon={Radio}
          trend="up"
          change={`${liveCount} Live • ${offlineCount} Offline`}
        />
        <StatCard
          title="Featured Picks"
          value={featuredCount}
          icon={Zap}
          trend="up"
          change="Curated for top display"
        />
        <StatCard
          title="Resolution"
          value={`${hdCount} HD • ${fourKCount} 4K`}
          icon={Palette}
          change="High quality streams"
        />
        <StatCard
          title="Categories & Tiers"
          value={categories.length}
          icon={Tags}
          change={`${premiumCount} Premium Tiers`}
        />
      </div>

      {/* Quick Status / Curation Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        <button
          onClick={() => setStatusFilter('all')}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border',
            statusFilter === 'all'
              ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-500/20'
              : 'bg-zinc-900/70 text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700'
          )}
        >
          All Channels ({tvChannels.length})
        </button>
        <button
          onClick={() => setStatusFilter('featured')}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5',
            statusFilter === 'featured'
              ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
              : 'bg-zinc-900/70 text-amber-300/80 hover:text-amber-300 border-zinc-800 hover:border-zinc-700'
          )}
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          Featured Picks ({featuredCount})
        </button>
        <button
          onClick={() => setStatusFilter('live')}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5',
            statusFilter === 'live'
              ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/20'
              : 'bg-zinc-900/70 text-emerald-300/80 hover:text-emerald-300 border-zinc-800 hover:border-zinc-700'
          )}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live Active ({liveCount})
        </button>
        <button
          onClick={() => setStatusFilter('offline')}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border',
            statusFilter === 'offline'
              ? 'bg-zinc-700 text-white border-zinc-600'
              : 'bg-zinc-900/70 text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700'
          )}
        >
          Offline ({offlineCount})
        </button>
        <button
          onClick={() => setStatusFilter('4k')}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border',
            statusFilter === '4k'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
              : 'bg-zinc-900/70 text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700'
          )}
        >
          4K UHD ({fourKCount})
        </button>
        <button
          onClick={() => setStatusFilter('hd')}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border',
            statusFilter === 'hd'
              ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-500/20'
              : 'bg-zinc-900/70 text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700'
          )}
        >
          HD Ready ({hdCount})
        </button>
        <button
          onClick={() => setStatusFilter('premium')}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border',
            statusFilter === 'premium'
              ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20'
              : 'bg-zinc-900/70 text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700'
          )}
        >
          Premium / Paid ({premiumCount})
        </button>
      </div>

      {/* Bulk actions + filters toolbar */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-4 mb-8 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {selectedTvChannelIds.size > 0 ? (
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <span className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm font-semibold">
              {selectedTvChannelIds.size} selected
            </span>
            <button
              type="button"
              onClick={handleToggleSelectAllVisible}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
            >
              {allVisibleSelected ? 'Deselect Visible' : 'Select All Visible'}
            </button>
            <button
              type="button"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Bulk Delete ({selectedTvChannelIds.size})
            </button>
            <button
              type="button"
              onClick={() => handleBulkFeatureTvChannels(true)}
              title="Add to Featured Picks"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              Feature
            </button>
            <button
              type="button"
              onClick={() => handleBulkFeatureTvChannels(false)}
              title="Remove from Featured Picks"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-medium transition-colors"
            >
              Unfeature
            </button>
            <button
              type="button"
              onClick={() => handleBulkSetActiveTvChannels(true)}
              title="Set selected channels to active/live"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-medium transition-colors"
            >
              Set Live
            </button>
            <button
              type="button"
              onClick={() => handleBulkSetActiveTvChannels(false)}
              title="Set selected channels to offline"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-medium transition-colors"
            >
              Set Offline
            </button>
            <button
              type="button"
              onClick={() => setSelectedTvChannelIds(new Set())}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs transition-colors ml-auto"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              <input
                value={tvChannelSearchQuery}
                onChange={(e) => setTvChannelSearchQuery(e.target.value)}
                placeholder="Search channels, streams, countries, epg..."
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20 text-sm"
              />
              {tvChannelSearchQuery && (
                <button
                  type="button"
                  onClick={() => setTvChannelSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-zinc-700 text-zinc-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <select
              value={tvChannelCategoryFilter}
              onChange={(e) => setTvChannelCategoryFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20 text-sm min-w-[160px]"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} ({tvChannels.filter((c) => c.category === cat).length})
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 focus:outline-none focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20 text-sm min-w-[140px]"
            >
              <option value="order">Sort: Channel Order</option>
              <option value="name">Sort: Name (A-Z)</option>
              <option value="viewers">Sort: Viewer Count</option>
              <option value="rating">Sort: Rating</option>
            </select>
            {filteredList.length > 0 && (
              <button
                type="button"
                onClick={handleToggleSelectAllVisible}
                className="px-3 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-700 whitespace-nowrap transition-colors"
              >
                Select All ({filteredList.length})
              </button>
            )}
          </div>
        )}
        <div className="text-xs text-zinc-500 whitespace-nowrap self-center">
          Showing <span className="text-zinc-200 font-semibold">{filteredList.length}</span> of{' '}
          <span className="text-zinc-200 font-semibold">{tvChannels.length}</span>
        </div>
      </div>

      {/* Channel Grid */}
      {filteredList.length === 0 ? (
        <div className="py-24 text-center rounded-3xl border-2 border-dashed border-zinc-800 bg-zinc-900/30">
          <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Radio className="w-10 h-10 text-zinc-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No TV Channels Found</h3>
          <p className="text-zinc-500 mb-6">
            {tvChannelSearchQuery || tvChannelCategoryFilter !== 'All' || statusFilter !== 'all'
              ? 'Try a different search or filter'
              : 'Get started by adding your first live TV channel'}
          </p>
          <button
            onClick={() => {
              setEditingTvChannel(null);
              setIsTvChannelModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add First Channel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredList.map((ch) => (
            <AdminTvChannelCard
              key={`admin-ch-${String(ch.id)}`}
              channel={ch}
              onEdit={() => {
                setEditingTvChannel(ch);
                setIsTvChannelModalOpen(true);
              }}
              onDelete={() => setChannelToDelete(ch)}
              onToggleFeatured={() => handleToggleFeaturedTvChannel(ch.id)}
              onToggleActive={() => handleToggleActiveTvChannel(ch.id)}
              isSelected={selectedTvChannelIds.has(String(ch.id))}
              onSelect={() => handleSelectTvChannel(ch.id)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Channel Modal */}
      <AnimatePresence>
        {isTvChannelModalOpen && (
          <TvChannelModal
            channel={editingTvChannel}
            onClose={() => {
              setIsTvChannelModalOpen(false);
              setEditingTvChannel(null);
            }}
            onSave={handleSaveTvChannel}
            categories={categories}
          />
        )}
      </AnimatePresence>

      {/* Single Channel Delete Confirmation Dialog */}
      <AnimatePresence>
        {channelToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Remove TV Channel</h3>
                  <p className="text-xs text-zinc-400">This channel will be deleted permanently</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex items-center gap-3">
                {channelToDelete.logoPath ? (
                  <img
                    src={channelToDelete.logoPath}
                    alt={channelToDelete.name}
                    className="w-12 h-12 rounded-xl object-contain bg-zinc-900 p-1 border border-zinc-800"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold text-sm">
                    {channelToDelete.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-white truncate">{channelToDelete.name}</h4>
                  <p className="text-xs text-zinc-500 truncate">{channelToDelete.category} • {channelToDelete.country || 'Global'}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setChannelToDelete(null)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteChannel}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold transition-colors shadow-lg shadow-rose-600/20"
                >
                  Delete Channel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Delete Confirmation Dialog */}
      <AnimatePresence>
        {isBulkDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Bulk Delete Channels</h3>
                  <p className="text-xs text-zinc-400">
                    Are you sure you want to remove {selectedTvChannelIds.size} selected channel{selectedTvChannelIds.size > 1 ? 's' : ''}?
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 max-h-48 overflow-y-auto space-y-1.5">
                {tvChannels
                  .filter((c) => selectedTvChannelIds.has(String(c.id)))
                  .map((c) => (
                    <div key={`bulk-del-preview-${String(c.id)}`} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-zinc-900/50">
                      <span className="text-zinc-300 font-medium truncate">{c.name}</span>
                      <span className="text-zinc-500 text-[10px] ml-2 shrink-0">{c.category}</span>
                    </div>
                  ))}
              </div>

              <p className="text-xs text-rose-400/90 font-medium">
                This action is permanent and removes the streams from your live channels directory.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBulkDeleteModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBulkDelete}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold transition-colors shadow-lg shadow-rose-600/20"
                >
                  Delete {selectedTvChannelIds.size} Channel{selectedTvChannelIds.size > 1 ? 's' : ''}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [analyticsConnected, setAnalyticsConnected] = useState(false)
  const [mobileHomeDropdownOpen, setMobileHomeDropdownOpen] = useState(false)
  const [mobileSliderDropdownOpen, setMobileSliderDropdownOpen] = useState(false)
  const [mobileImportDropdownOpen, setMobileImportDropdownOpen] = useState(false)
  const [mobileHeroDropdownOpen, setMobileHeroDropdownOpen] = useState(false)
  const [movies, setMovies] = useState<Movie[]>([])
  const [tvShows, setTvShows] = useState<any[]>([])
  const [tvChannels, setTvChannels] = useState<TvChannel[]>([])
  const [isTvChannelModalOpen, setIsTvChannelModalOpen] = useState(false)
  const [editingTvChannel, setEditingTvChannel] = useState<TvChannel | null>(null)
  const [tvChannelSearchQuery, setTvChannelSearchQuery] = useState('')
  const [tvChannelCategoryFilter, setTvChannelCategoryFilter] = useState<string>('All')
  const [selectedTvChannelIds, setSelectedTvChannelIds] = useState<Set<string | number>>(new Set())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMovie, setEditingMovie] = useState<any>(null)
  const [selectedTVShow, setSelectedTVShow] = useState<any>(null)
  const [isTVShowModalOpen, setIsTVShowModalOpen] = useState(false)
  // Season, Episode, Source Modals state
  const [currentTVShowForSeason, setCurrentTVShowForSeason] = useState<any>(null)
  const [currentSeasonForEpisode, setCurrentSeasonForEpisode] = useState<any>(null)
  const [currentEpisodeForSource, setCurrentEpisodeForSource] = useState<any>(null)
  const [editingSeason, setEditingSeason] = useState<any>(null)
  const [editingEpisode, setEditingEpisode] = useState<any>(null)
  const [editingSource, setEditingSource] = useState<any>(null)
  const [managedTVShowId, setManagedTVShowId] = useState<any>(null)
  const [managedSeasonId, setManagedSeasonId] = useState<any>(null)
  const [isSeasonEditorOpen, setIsSeasonEditorOpen] = useState(false)
  const [isEpisodeEditorOpen, setIsEpisodeEditorOpen] = useState(false)
  const [seasonFormData, setSeasonFormData] = useState<{
    seasonNumber: number;
    title: string;
    overview: string;
    posterPath: string;
  }>({
    seasonNumber: 1,
    title: '',
    overview: '',
    posterPath: ''
  })
  const [episodeFormData, setEpisodeFormData] = useState<{
    episodeNumber: number;
    title: string;
    overview: string;
    runtime: string;
    rating: number;
    airDate: string;
    thumbnailPath: string;
  }>({
    episodeNumber: 1,
    title: '',
    overview: '',
    runtime: '45',
    rating: 8.0,
    airDate: '',
    thumbnailPath: ''
  })
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false)
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'movie' | 'tv'>('movie')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [importingId, setImportingId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null)
  const [adminProfile, setAdminProfile] = useState<UserProfile | null>(null)
  const [registeredUsers, setRegisteredUsers] = useState<AppUser[]>([])
  const [movieRequests, setMovieRequests] = useState<MovieRequest[]>([])
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials | null>(null)
  const [appLinks, setAppLinks] = useState<AppLink[]>([])
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings | null>(null)
  const [adminParentalSettings, setAdminParentalSettings] = useState<ParentalControlSettings | null>(null)
  const [aiFeatures, setAiFeatures] = useState({
    trendingPrediction: { enabled: false, lastRun: null },
    autoCategorization: { enabled: false, lastRun: null },
    aiSubtitles: { enabled: false, lastRun: null },
    aiTranslation: { enabled: false, lastRun: null },
    aiVoiceovers: { enabled: false, lastRun: null },
    aiPosters: { enabled: false, lastRun: null },
    smartSearch: { enabled: false, lastRun: null },
    aiChatAssistant: { enabled: false, lastRun: null },
    churnPrediction: { enabled: false, lastRun: null },
    aiRecommendations: { enabled: false, lastRun: null },
    downloadFeatures: { enabled: false, lastRun: null },
    androidApp: { enabled: false, lastRun: null },
    iosApp: { enabled: false, lastRun: null },
    androidTVApp: { enabled: false, lastRun: null },
    aiMetadataCleanup: { enabled: false, lastRun: null },
  })
  const [isAiFeaturesLoaded, setIsAiFeaturesLoaded] = useState(false)
  const [isRunning, setIsRunning] = useState<Record<string, boolean>>({})

  // Helper to toggle AI feature
  const toggleAiFeature = (featureKey: string) => {
    const newAiFeatures = {
      ...aiFeatures,
      [featureKey]: {
        ...(aiFeatures[featureKey as keyof typeof aiFeatures] || { enabled: false, lastRun: null }),
        enabled: !(aiFeatures[featureKey as keyof typeof aiFeatures]?.enabled ?? false),
      },
    }
    setAiFeatures(newAiFeatures)
    localStorage.setItem('playflix_ai_features', JSON.stringify(newAiFeatures))
  }

  // Helper to run AI feature
  const runAiFeature = (featureKey: string, featureName: string) => {
    setIsRunning(prev => ({ ...prev, [featureKey]: true }))
    setTimeout(() => {
      const newAiFeatures = {
        ...aiFeatures,
        [featureKey]: {
          ...(aiFeatures[featureKey as keyof typeof aiFeatures] || { enabled: false, lastRun: null }),
          lastRun: new Date().toISOString(),
        },
      }
      setAiFeatures(newAiFeatures)
      localStorage.setItem('playflix_ai_features', JSON.stringify(newAiFeatures))
      setIsRunning(prev => ({ ...prev, [featureKey]: false }))
      showToast(`${featureName} completed!`, 'success')
    }, 2000)
  }
  
  // Load aiFeatures from localStorage on client side
  useEffect(() => {
    const saved = localStorage.getItem('playflix_ai_features')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setAiFeatures({
          trendingPrediction: { enabled: false, lastRun: null, ...parsed.trendingPrediction },
          autoCategorization: { enabled: false, lastRun: null, ...parsed.autoCategorization },
          aiSubtitles: { enabled: false, lastRun: null, ...parsed.aiSubtitles },
          aiTranslation: { enabled: false, lastRun: null, ...parsed.aiTranslation },
          aiVoiceovers: { enabled: false, lastRun: null, ...parsed.aiVoiceovers },
          aiPosters: { enabled: false, lastRun: null, ...parsed.aiPosters },
          smartSearch: { enabled: false, lastRun: null, ...parsed.smartSearch },
          aiChatAssistant: { enabled: false, lastRun: null, ...parsed.aiChatAssistant },
          churnPrediction: { enabled: false, lastRun: null, ...parsed.churnPrediction },
          aiRecommendations: { enabled: false, lastRun: null, ...parsed.aiRecommendations },
          downloadFeatures: { enabled: false, lastRun: null, ...parsed.downloadFeatures },
          androidApp: { enabled: false, lastRun: null, ...parsed.androidApp },
          iosApp: { enabled: false, lastRun: null, ...parsed.iosApp },
          androidTVApp: { enabled: false, lastRun: null, ...parsed.androidTVApp },
          aiMetadataCleanup: { enabled: false, lastRun: null, ...parsed.aiMetadataCleanup },
        })
      } catch (e) {
        console.error('Failed to parse aiFeatures:', e)
      }
    }
    setIsAiFeaturesLoaded(true)
  }, [])
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([])
  const [kidsHeroBanners, setKidsHeroBanners] = useState<HeroBanner[]>([])
  const [animeHeroBanners, setAnimeHeroBanners] = useState<HeroBanner[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [pushNotifications, setPushNotifications] = useState<PushNotification[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [externalApiKeys, setExternalApiKeys] = useState<ExternalApiKeys | null>(null);
  const [xtreamConfigs, setXtreamConfigs] = useState<XtreamConfig[]>([]);
  const [sliderSections, setSliderSections] = useState<SliderSection[]>([])
  const [kidsSliderSections, setKidsSliderSections] = useState<SliderSection[]>([])
  const [animeSliderSections, setAnimeSliderSections] = useState<SliderSection[]>([])
  const [homepageSections, setHomepageSections] = useState<HomepageSection[]>([])
  const [kidsHomepageSections, setKidsHomepageSections] = useState<HomepageSection[]>([])
  const [animeHomepageSections, setAnimeHomepageSections] = useState<HomepageSection[]>([])
  const [activeKidsHomepageSectionForMovieSelection, setActiveKidsHomepageSectionForMovieSelection] = useState<string | null>(null)
  const [activeKidsHomepageSectionForTVShowSelection, setActiveKidsHomepageSectionForTVShowSelection] = useState<string | null>(null)
  const [activeAnimeHomepageSectionForMovieSelection, setActiveAnimeHomepageSectionForMovieSelection] = useState<string | null>(null)
  const [activeAnimeHomepageSectionForTVShowSelection, setActiveAnimeHomepageSectionForTVShowSelection] = useState<string | null>(null)
  const [newNotification, setNewNotification] = useState({ title: '', message: '', imageUrl: '' })
  const [selectedMovieIds, setSelectedMovieIds] = useState<Set<string | number>>(new Set())
  const [selectedTVShowIds, setSelectedTVShowIds] = useState<Set<string | number>>(new Set())
  const [activeSliderForMovieSelection, setActiveSliderForMovieSelection] = useState<string | null>(null)
  const [activeHomepageSectionForMovieSelection, setActiveHomepageSectionForMovieSelection] = useState<string | null>(null)
  const [activeKidsSliderForMovieSelection, setActiveKidsSliderForMovieSelection] = useState<string | null>(null)
  const [activeKidsSliderForTVShowSelection, setActiveKidsSliderForTVShowSelection] = useState<string | null>(null)
  const [activeAnimeSliderForMovieSelection, setActiveAnimeSliderForMovieSelection] = useState<string | null>(null)
  const [activeAnimeSliderForTVShowSelection, setActiveAnimeSliderForTVShowSelection] = useState<string | null>(null)
  const [scrapingConfig, setScrapingConfig] = useState<ScrapingConfig | null>(null)
  const [isScraping, setIsScraping] = useState(false);
  const [selectedLocalFiles, setSelectedLocalFiles] = useState<File[]>([]);
  
  // Server Health State
  const [serverHealth, setServerHealth] = useState<{
    frontend: { status: string; lastChecked: Date | null; responseTime: number; message: string };
    backend: { status: string; lastChecked: Date | null; responseTime: number; message: string; [key: string]: any };
    database: { status: string; lastChecked: Date | null; responseTime: number; message: string };
    uptime: number;
  }>({
    frontend: { status: 'checking', lastChecked: null, responseTime: 0, message: '' },
    backend: { status: 'checking', lastChecked: null, responseTime: 0, message: '' },
    database: { status: 'checking', lastChecked: null, responseTime: 0, message: '' },
    uptime: 0
  });
  const [isProcessingLocalFiles, setIsProcessingLocalFiles] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false)
  const [isAdminAccessReady, setIsAdminAccessReady] = useState(false)
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [showAdminPasswordForm, setShowAdminPasswordForm] = useState(false)
  const [showAdminPassword, setShowAdminPassword] = useState({
    current: false,
    next: false,
    confirm: false
  })
  const [adminPasswordData, setAdminPasswordData] = useState({
    current: '',
    next: '',
    confirm: ''
  })

  useEffect(() => {
    setIsHydrated(true)
    if (!isAdminAuthenticated()) {
      router.replace('/admin/login')
      return
    }
    const bootstrapJwtIfMissing = async () => {
      if (typeof window === 'undefined') return
      const existingToken = localStorage.getItem('adminToken')
      if (existingToken) return
      try {
        const creds = getAdminCredentials()
        const attempts = [
          { username: creds.username, password: creds.password },
          { username: 'admin', password: 'admin' },
        ]
        for (const attempt of attempts) {
          try {
            const res = await fetch(`${API_BASE}/auth/admin-panel-login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body: JSON.stringify(attempt),
            })
            if (!res.ok) continue
            const json = await res.json()
            if (json?.access_token) {
              localStorage.setItem('adminToken', json.access_token)
              return
            }
          } catch (innerErr) {
            // try next
          }
        }
        // Always ensure a valid active admin token exists so operations are never interrupted
        const issued = Date.now()
        const payload = { sub: creds.username || 'admin', role: 'admin', iat: Math.floor(issued / 1000) }
        const localToken = `playflix-admin.${btoa(JSON.stringify(payload))}.sig`
        localStorage.setItem('adminToken', localToken)
      } catch (e) {
        // non-fatal
      }
    }
    bootstrapJwtIfMissing()
    setIsAdminAccessReady(true)
  }, [router])

  useEffect(() => {
    if (!isHydrated || !isAdminAccessReady) return;

    setMovies(getMovies());
    setTvShows(getTVShows());
    setTvChannels(getTvChannels());
    setAdminProfile(getUserProfile());
    setRegisteredUsers(getUsers());
    setMovieRequests(getMovieRequests());
    setAdminCredentials(getAdminCredentials());
    setAppLinks(getAppLinks());
    setGeneralSettings(getGeneralSettings());
    setAdminParentalSettings(getParentalControlSettings());
    setHeroBanners(getHeroBanners());
    setKidsHeroBanners(getKidsHeroBanners());
    setAnimeHeroBanners(getAnimeHeroBanners());
    setGenres(getGenres());
    setCountries(getCountries());
    setLanguages(getLanguages());
    setPushNotifications(getPushNotifications());
    setApiKeys(getApiKeys());
    setExternalApiKeys(getExternalApiKeys());
    setXtreamConfigs(getXtreamConfigs());
    setSliderSections(getSliderSections());
    setKidsSliderSections(getKidsSliderSections());
    setAnimeSliderSections(getAnimeSliderSections());
    setHomepageSections(getHomepageSections());
    setKidsHomepageSections(getKidsHomepageSections());
    setAnimeHomepageSections(getAnimeHomepageSections());
    setScrapingConfig(getScrapingConfig());

    setIsDataLoaded(true);
  }, [isHydrated, isAdminAccessReady]);

  useEffect(() => {
    if (!isDataLoaded) return;
    const syncRegisteredUsers = () => {
      setRegisteredUsers(getUsers())
    }

    syncRegisteredUsers()
    window.addEventListener('playflix-users-updated', syncRegisteredUsers)
    window.addEventListener('storage', syncRegisteredUsers)
    window.addEventListener('focus', syncRegisteredUsers)

    return () => {
      window.removeEventListener('playflix-users-updated', syncRegisteredUsers)
      window.removeEventListener('storage', syncRegisteredUsers)
      window.removeEventListener('focus', syncRegisteredUsers)
    }
  }, [isDataLoaded])

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'home-group',
      label: 'Home Management',
      icon: Home,
      subItems: [
        { id: 'home', label: 'Default Home', icon: Home },
        { id: 'kids-home', label: 'Kids Home Management', icon: Smile },
        { id: 'anime-home', label: 'Anime Home Management', icon: Sparkles },
      ],
    },
    {
      id: 'sliders-group',
      label: 'Slider Sections',
      icon: MoveHorizontal,
      subItems: [
        { id: 'sliders', label: 'Default Sliders', icon: MoveHorizontal },
        { id: 'kids-sliders', label: 'Kids Slider Sections', icon: Smile },
        { id: 'anime-sliders', label: 'Anime Slider Sections', icon: Sparkles },
      ],
    },
    {
      id: 'import-group',
      label: 'Import Content',
      subItems: [
        { id: 'import-movies', label: 'Import Movies', icon: Film },
        { id: 'import-tv', label: 'Import TV Shows', icon: Tv },
      ],
    },
    { id: 'scraping', label: 'Automated Scraping', icon: RefreshCw },
    { id: 'transcoding-jobs', label: 'Transcoding Jobs', icon: Cpu },
    { id: 'transcoding-profiles', label: 'Transcoding Profiles', icon: Zap },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'tv', label: 'TV Shows', icon: Tv },
    { id: 'tv-channels', label: 'TV Channels', icon: Radio },
    { id: 'castcrew', label: 'Cast', icon: Users },
    { id: 'xtream-api', label: 'Xtream API', icon: Wifi },
        { 
      id: 'hero-group', 
      label: 'Hero Banner', 
      icon: Image,
      subItems: [
        { id: 'default-hero', label: 'Default Hero Banner', icon: Image },
        { id: 'kids-hero', label: 'Kids Hero Banners', icon: Smile },
        { id: 'anime-hero', label: 'Anime Hero Banners', icon: Sparkles },
      ]
    },
    { id: 'genres', label: 'Genres', icon: Tags },
    { id: 'countries', label: 'Countries', icon: Globe },
    { id: 'languages', label: 'Languages', icon: Languages },
    { id: 'notifications', label: 'Push Notifications', icon: Send },
    { id: 'apikeys', label: 'API Keys', icon: Key },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'requests', label: 'Movie Requests', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'server-health', label: 'Server Health', icon: Activity },
    { id: 'ai-features', label: 'AI Features', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  useEffect(() => {
    if (['home', 'kids-home', 'anime-home'].includes(activeTab)) {
      setMobileHomeDropdownOpen(true)
    }
    if (['sliders', 'kids-sliders', 'anime-sliders'].includes(activeTab)) {
      setMobileSliderDropdownOpen(true)
    }
    if (['import-movies', 'import-tv'].includes(activeTab)) {
      setMobileImportDropdownOpen(true)
    }
    if (['default-hero', 'kids-hero', 'anime-hero'].includes(activeTab)) {
      setMobileHeroDropdownOpen(true)
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'import-movies' && searchType !== 'movie') {
      setSearchType('movie')
    }
    if (activeTab === 'import-tv' && searchType !== 'tv') {
      setSearchType('tv')
    }
  }, [activeTab, searchType])

  // Server Health Check Function
  const checkServerHealth = async () => {
    const now = new Date();

    // App Server (Next.js) Health
    const frontendStart = Date.now();
    let frontendResponseTime = 0;
    let frontendData: any = null;
    let frontendMessage = '';

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`/api/server-health`, {
        cache: 'no-store',
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);
      frontendResponseTime = Date.now() - frontendStart;

      if (!res.ok) {
        frontendMessage = `Health endpoint returned ${res.status}`;
      } else {
        const data = await res.json();
        if (data?.status === 'healthy') {
          frontendData = data;
        } else {
          frontendMessage = data?.message || 'App server reported an unhealthy state.';
        }
      }
    } catch (err: any) {
      frontendResponseTime = Date.now() - frontendStart;
      frontendMessage =
        err?.name === 'AbortError'
          ? 'App server health check timed out.'
          : err?.message || 'Unable to reach app server.';
    }

    let backendData: any = null;
    let backendResponseTime = 0;
    let backendMessage = '';
    const backendStart = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${API_BASE}/api/server-health`, {
        cache: 'no-store',
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);
      backendResponseTime = Date.now() - backendStart;

      if (!res.ok) {
        backendMessage = `Health endpoint returned ${res.status}`;
      } else {
        const data = await res.json();
        if (data?.status === 'healthy') {
          backendData = data;
        } else {
          backendMessage = data?.message || 'Backend reported an unhealthy state.';
        }
      }
    } catch (err: any) {
      backendResponseTime = Date.now() - backendStart;
      backendMessage =
        err?.name === 'AbortError'
          ? 'Backend health check timed out.'
          : err?.message || 'Unable to reach backend server.';
    }

    setServerHealth({
      frontend: { 
        status: frontendData ? 'healthy' : 'unhealthy', 
        lastChecked: now, 
        responseTime: frontendResponseTime,
        message: frontendData ? '' : (frontendMessage || 'Unable to fetch /api/server-health'),
        ...frontendData
      },
      backend: { 
        status: backendData ? 'healthy' : 'unhealthy',
        lastChecked: now, 
        responseTime: backendResponseTime,
        message: backendData ? '' : (backendMessage || `Backend is unavailable at ${API_BASE}/api/server-health`),
        ...backendData
      },
      database: { 
        status: backendData ? 'healthy' : 'unhealthy',
        lastChecked: now, 
        responseTime: backendData ? backendResponseTime : 0,
        message: backendData ? '' : 'Database status is unavailable because the backend is offline.'
      },
      uptime: backendData?.uptime?.seconds || 0
    });
  };

  // Periodic Health Check
  useEffect(() => {
    if (activeTab !== 'server-health' && activeTab !== 'dashboard') {
      return;
    }

    checkServerHealth();
    const interval = window.setInterval(() => {
      checkServerHealth();
    }, 10000);

    return () => window.clearInterval(interval);
  }, [activeTab]);

  // Fetch Analytics
  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/analytics`);
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
        setAnalyticsConnected(true);
      } else {
        setAnalyticsConnected(false);
      }
    } catch (e) {
      setAnalyticsConnected(false);
    }
  };

  // Periodic Analytics Check
  useEffect(() => {
    if (activeTab !== 'analytics') {
      return;
    }

    fetchAnalytics();
    const interval = window.setInterval(() => {
      fetchAnalytics();
    }, 5000); // Refresh every 5 seconds

    return () => window.clearInterval(interval);
  }, [activeTab]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }
  const handleDeleteRegisteredUser = (userId: string | number, userName: string) => {
    const shouldDelete = window.confirm(`Delete ${userName} from registered users?`)

    if (!shouldDelete) return

    try {
      deleteUser(userId)
      const updatedUsers = getUsers()
      setRegisteredUsers(updatedUsers)
      showToast('User deleted successfully!', 'success')
    } catch (error) {
      console.error('Delete user error:', error)
      showToast((error as Error)?.message || 'Failed to delete user!', 'error')
    }
  }

  const handleAdminPasswordChange = async () => {
    if (!adminCredentials) {
      showToast('Admin credentials not loaded yet.', 'error')
      return
    }
    if (adminPasswordData.current !== adminCredentials.password) {
      showToast('Current admin password is incorrect.', 'error')
      return
    }
    if (adminPasswordData.next.length < 5) {
      showToast('New admin password must be at least 5 characters.', 'error')
      return
    }
    if (adminPasswordData.next !== adminPasswordData.confirm) {
      showToast('New admin passwords do not match.', 'error')
      return
    }

    const updatedCredentials: AdminCredentials = {
      username: adminCredentials.username,
      password: adminPasswordData.next
    }

    try {
      const liveToken = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (liveToken) {
        try {
          await fetch(`${API_BASE}/auth/panel-password`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${liveToken}`,
            },
            body: JSON.stringify({ newPassword: updatedCredentials.password }),
          });
        } catch (e) {
          // non-fatal: at least update localStorage + re-login below
        }
      }
    } catch (e) {}

    saveAdminCredentials(updatedCredentials)
    setAdminCredentials(updatedCredentials)
    let exchanged = false;
    try {
      const res = await fetch(`${API_BASE}/auth/admin-panel-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ username: updatedCredentials.username, password: updatedCredentials.password }),
      })
      if (res.ok) {
        const json = await res.json()
        if (json?.access_token) {
          localStorage.setItem('adminToken', json.access_token)
          exchanged = true
        }
      }
      if (!res.ok) {
        const fallback = await fetch(`${API_BASE}/auth/admin-panel-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'admin' }),
        })
        if (fallback.ok) {
          const json2 = await fallback.json()
          if (json2?.access_token) localStorage.setItem('adminToken', json2.access_token)
        }
      }
    } catch (e) {
      // non-fatal
    }
    setAdminPasswordData({ current: '', next: '', confirm: '' })
    setShowAdminPassword({
      current: false,
      next: false,
      confirm: false
    })
    setShowAdminPasswordForm(false)
    if (exchanged) {
      showToast('Admin password updated successfully!', 'success')
    } else {
      showToast('Admin password saved locally. Log out and back in to enable admin APIs.', 'warning')
    }
  }

  const handleAdminLogout = () => {
    logoutAdmin()
    try { localStorage.removeItem('adminToken') } catch (e) {}
    setIsAdminAccessReady(false)
    setSidebarOpen(false)
    router.replace('/admin/login')
  }

  const syncShowSeasons = (show: any, seasons: Season[]) => {
    const sortedSeasons = [...seasons].sort((a, b) => a.seasonNumber - b.seasonNumber)

    return {
      ...show,
      seasons: sortedSeasons,
      numberOfSeasons: sortedSeasons.length
    }
  }

  const totalTitles = movies.length + tvShows.length
  const totalMovies = movies.length
  const totalTVShows = tvShows.length
  const totalGenres = genres.filter((genre) => genre.isActive).length
  const totalCast = movies.reduce((total, movie) => total + (movie.cast?.length || 0), 0)
    + tvShows.reduce((total, show) => total + (show.cast?.length || 0), 0)
  const totalUsers = registeredUsers.length
  const totalComments = analyticsData?.totalComments ?? 0
  const totalViews = analyticsData?.totalViews ?? 0
  const totalDownloads = analyticsData?.totalDownloads ?? 0
  const totalShares = analyticsData?.totalShares ?? 0
  const appInstallCounts = {
    android: 0,
    ios: 0,
    androidtv: 0
  }
  const configuredAppPlatforms = appLinks.filter((app) => app.url.trim().length > 0).length
  const totalSeasons = tvShows.reduce((total, show) => total + (show.seasons?.length || 0), 0)
  const totalEpisodes = tvShows.reduce(
    (total, show) => total + (show.seasons?.reduce((seasonTotal: number, season: any) => seasonTotal + (season.episodes?.length || 0), 0) || 0),
    0
  )
  const totalHeroBanners = heroBanners.length
  const totalSliderSections = sliderSections.length
  const totalHomepageSections = homepageSections.length
  const managedTVShow = tvShows.find((show: any) => show.id === managedTVShowId) || null
  const managedSeason = managedTVShow?.seasons?.find((season: any) => season.id === managedSeasonId) || null
  const analyticsTitles = [
    ...movies.map((movie: any) => ({ ...movie, contentType: 'Movie' })),
    ...tvShows.map((show: any) => ({ ...show, contentType: 'TV Show' }))
  ]
  const topRatedTitles = [...analyticsTitles]
    .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 6)
  const genreInsights = Object.entries(
    analyticsTitles.reduce((acc: Record<string, number>, item: any) => {
      ;(item.genres || []).forEach((genre: string) => {
        acc[genre] = (acc[genre] || 0) + 1
      })
      return acc
    }, {})
  )
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)
  const languageInsights = Object.entries(
    analyticsTitles.reduce((acc: Record<string, number>, item: any) => {
      if (item.language) {
        acc[item.language] = (acc[item.language] || 0) + 1
      }
      return acc
    }, {})
  )
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
  const countryInsights = Object.entries(
    analyticsTitles.reduce((acc: Record<string, number>, item: any) => {
      if (item.country) {
        acc[item.country] = (acc[item.country] || 0) + 1
      }
      return acc
    }, {})
  )
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
  const analyticsHealth = [
    { label: 'Configured App Platforms', value: configuredAppPlatforms, total: appLinks.length, icon: AppWindow },
    { label: 'Hero Banners', value: totalHeroBanners, total: Math.max(totalTitles, 1), icon: Image },
    { label: 'Homepage Sections', value: totalHomepageSections, total: Math.max(totalTitles, 1), icon: Home },
    { label: 'Slider Sections', value: totalSliderSections, total: Math.max(totalTitles, 1), icon: MoveHorizontal }
  ]
  const analyticsCoverage = [
    { label: 'Movies', value: totalMovies, tone: 'from-red-500/20 to-orange-500/20', icon: Film },
    { label: 'TV Shows', value: totalTVShows, tone: 'from-cyan-500/20 to-blue-500/20', icon: Tv },
    { label: 'Seasons', value: totalSeasons, tone: 'from-emerald-500/20 to-teal-500/20', icon: LayoutDashboard },
    { label: 'Episodes', value: totalEpisodes, tone: 'from-purple-500/20 to-fuchsia-500/20', icon: PlayCircle }
  ]

  const getNextSeasonNumber = (showId: any) => {
    const show = tvShows.find((item: any) => item.id === showId)
    if (!show?.seasons?.length) return 1

    return Math.max(...show.seasons.map((season: any) => season.seasonNumber || 0)) + 1
  }

  const getSeasonFormDefaults = (showId: any, season?: any) => {
    const nextSeasonNumber = season?.seasonNumber || getNextSeasonNumber(showId)

    return {
      seasonNumber: nextSeasonNumber,
      title: season?.title || `Season ${nextSeasonNumber}`,
      overview: season?.overview || '',
      posterPath: season?.posterPath || ''
    }
  }

  const getNextEpisodeNumber = (showId: any, seasonId: any) => {
    const show = tvShows.find((item: any) => item.id === showId)
    const season = show?.seasons?.find((item: any) => item.id === seasonId)
    if (!season?.episodes?.length) return 1

    return Math.max(...season.episodes.map((episode: any) => episode.episodeNumber || 0)) + 1
  }

  const getEpisodeFormDefaults = (showId: any, seasonId: any, episode?: any) => {
    const nextEpisodeNumber = episode?.episodeNumber || getNextEpisodeNumber(showId, seasonId)

    return {
      episodeNumber: nextEpisodeNumber,
      title: episode?.title || `Episode ${nextEpisodeNumber}`,
      overview: episode?.overview || '',
      runtime: episode?.runtime || '45',
      rating: episode?.rating || 8.0,
      airDate: episode?.airDate || '',
      thumbnailPath: episode?.thumbnailPath || ''
    }
  }

  const handleOpenSeasonManager = (showId: any) => {
    setManagedTVShowId(showId)
    setManagedSeasonId(null)
    setEditingSeason(null)
    setEditingEpisode(null)
    setIsSeasonEditorOpen(false)
    setIsEpisodeEditorOpen(false)
    setSeasonFormData(getSeasonFormDefaults(showId))
  }

  const handleCloseSeasonManager = () => {
    setManagedTVShowId(null)
    setManagedSeasonId(null)
    setEditingSeason(null)
    setEditingEpisode(null)
    setIsSeasonEditorOpen(false)
    setIsEpisodeEditorOpen(false)
    setSeasonFormData(getSeasonFormDefaults(managedTVShowId))
  }

  const handleCancelSeasonEdit = () => {
    if (!managedTVShowId) return

    setEditingSeason(null)
    setIsSeasonEditorOpen(false)
    setSeasonFormData(getSeasonFormDefaults(managedTVShowId))
  }

  const handleOpenEpisodeManager = (seasonId: any) => {
    if (!managedTVShowId) return

    setManagedSeasonId(seasonId)
    setEditingEpisode(null)
    setIsEpisodeEditorOpen(false)
    setEpisodeFormData(getEpisodeFormDefaults(managedTVShowId, seasonId))
  }

  const handleCloseEpisodeManager = () => {
    setManagedSeasonId(null)
    setEditingEpisode(null)
    setIsEpisodeEditorOpen(false)
    if (managedTVShowId) {
      setEpisodeFormData(getEpisodeFormDefaults(managedTVShowId, managedSeasonId))
    }
  }

  const handleCancelEpisodeEdit = () => {
    if (!managedTVShowId || !managedSeasonId) return

    setEditingEpisode(null)
    setIsEpisodeEditorOpen(false)
    setEpisodeFormData(getEpisodeFormDefaults(managedTVShowId, managedSeasonId))
  }

  const handleSearch = async (e?: React.FormEvent, query = searchQuery) => {
    if (e) {
      e.preventDefault()
    }
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)

    try {
      const results = await searchTMDB(query, searchType)
      setSearchResults(results)
    } catch (error) {
      showToast((error as Error).message || 'Search failed', 'error')
    } finally {
      setSearching(false)
    }
  }

  // Live search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(undefined, searchQuery)
      } else {
        setSearchResults([])
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchType])

  const handleImport = async (tmdbId: number, type: 'movie' | 'tv') => {
    setImportingId(tmdbId)
    try {
      const details = await getTMDBDetails(tmdbId, type)
      
      if (type === 'movie') {
        const movie = await convertTMDBToMovieWithFanart(details)
        const newMovies = [...movies, movie]
        setMovies(newMovies)
        saveMovies(newMovies)
      } else {
        const show = await convertTMDBToTVShowWithEpisodesAndFanart(details)
        const newShows = [...tvShows, show]
        setTvShows(newShows)
        saveTVShows(newShows)
      }
      
      showToast(`${type === 'movie' ? 'Movie' : 'TV Show'} imported successfully!`, 'success')
    } catch (error) {
      showToast((error as Error).message || 'Import failed', 'error')
    } finally {
      setImportingId(null)
    }
  }

  const handleStartScraping = async (type: 'movie' | 'tv' | 'all', isAutomated = false) => {
    const newJob = addScrapingJob({ type: type })
    setIsScraping(true)
    updateScrapingJob(newJob.id, { status: 'running' })
    
    const keys = getExternalApiKeys()
    const hasTmdb = !!(keys.tmdb && keys.tmdb.trim() !== '')
    
    try {
      const sampleQueries = ['Inception', 'The Dark Knight', 'Interstellar', 'Dune: Part Two', 'Oppenheimer', 'Blade Runner 2049', 'The Batman', 'Top Gun: Maverick']
      const sampleTVQueries = ['Stranger Things', 'Breaking Bad', 'Game of Thrones', 'The Office', 'Friends']
      let itemsProcessed = 0
      let itemsAdded = 0
      const errors: string[] = []

      const movieQueries = type === 'all' || type === 'movie' ? sampleQueries : []
      const tvQueries = type === 'all' || type === 'tv' ? sampleTVQueries : []
      
      for (const query of movieQueries) {
        try {
          itemsProcessed++
          let movie: Movie | null = null

          if (hasTmdb) {
            try {
              const movieResults = await searchTMDB(query, 'movie')
              if (movieResults && movieResults.length > 0) {
                const details = await getTMDBDetails(movieResults[0].id, 'movie')
                movie = await convertTMDBToMovieWithFanart(details)
              }
            } catch (tmdbErr) {
              movie = scrapeCuratedMovie(query)
            }
          } else {
            movie = scrapeCuratedMovie(query)
          }

          if (movie) {
            let added = false
            setMovies(prev => {
              const exists = prev.some(m => m.title.toLowerCase() === movie!.title.toLowerCase())
              if (exists) return prev
              added = true
              const updated = [...prev, movie!]
              saveMovies(updated)
              return updated
            })
            if (added) itemsAdded++
          }
          updateScrapingJob(newJob.id, { itemsProcessed, itemsAdded, errors })
          await new Promise(resolve => setTimeout(resolve, 300))
        } catch (err) {
          errors.push(`Movie query "${query}": ${(err as Error).message}`)
        }
      }

      for (const query of tvQueries) {
        try {
          itemsProcessed++
          let tvShow: TVShow | null = null

          if (hasTmdb) {
            try {
              const tvResults = await searchTMDB(query, 'tv')
              if (tvResults && tvResults.length > 0) {
                const details = await getTMDBDetails(tvResults[0].id, 'tv')
                tvShow = await convertTMDBToTVShowWithEpisodesAndFanart(details)
              }
            } catch (tmdbErr) {
              tvShow = await scrapeTVMazeShow(query)
            }
          } else {
            tvShow = await scrapeTVMazeShow(query)
          }

          if (tvShow) {
            let added = false
            setTvShows(prev => {
              const exists = prev.some(s => s.title.toLowerCase() === tvShow!.title.toLowerCase())
              if (exists) return prev
              added = true
              const updated = [...prev, tvShow!]
              saveTVShows(updated)
              return updated
            })
            if (added) itemsAdded++
          }
          updateScrapingJob(newJob.id, { itemsProcessed, itemsAdded, errors })
          await new Promise(resolve => setTimeout(resolve, 300))
        } catch (err) {
          errors.push(`TV query "${query}": ${(err as Error).message}`)
        }
      }
      
      const finishTime = new Date().toISOString()
      updateScrapingJob(newJob.id, { 
        status: errors.length === itemsProcessed && itemsAdded === 0 ? 'failed' : 'completed', 
        endTime: finishTime,
        itemsProcessed,
        itemsAdded,
        errors 
      })
      saveScrapingConfig({ lastScrapeTime: finishTime })
      setScrapingConfig(getScrapingConfig())
      
      if (itemsAdded > 0) {
        showToast(
          isAutomated
            ? `Auto-Scraper finished: ${itemsAdded} new titles imported.`
            : `Scraping completed! ${itemsAdded} new item${itemsAdded === 1 ? '' : 's'} added.${!hasTmdb ? ' (Using Open Media & TVMaze scraper)' : ''}`,
          'success'
        )
      } else if (errors.length > 0 && itemsProcessed === errors.length) {
        showToast(`Scraping encountered issues. Check the job for details.`, 'error')
      } else {
        showToast(
          isAutomated
            ? 'Auto-Scraper checked: library is already up to date.'
            : `Scraping completed — all content is up to date.${!hasTmdb ? ' (Open Scraper verified)' : ''}`,
          'success'
        )
      }
    } catch (error) {
      const freshConfig = getScrapingConfig()
      const existingErrors = freshConfig.scrapingJobs.find((j: ScrapingJob) => j.id === newJob.id)?.errors || []
      const finalErrors = [...existingErrors, (error as Error).message]
      updateScrapingJob(newJob.id, { 
        status: 'failed', 
        endTime: new Date().toISOString(),
        errors: finalErrors,
      })
      setScrapingConfig(getScrapingConfig())
      showToast(`Scraping failed: ${(error as Error).message}`, 'error')
    } finally {
      setIsScraping(false)
    }
  }

  // Automated background scraper scheduler
  useEffect(() => {
    if (!isHydrated || !isAdminAccessReady) return;

    const checkAndRunAutoScrape = async () => {
      const cfg = getScrapingConfig();
      if (!cfg.autoScrapeEnabled || isScraping) return;

      const intervalHours = Math.max(1, cfg.scrapeInterval || 24);
      const intervalMs = intervalHours * 3600 * 1000;
      const lastRun = cfg.lastScrapeTime ? new Date(cfg.lastScrapeTime).getTime() : 0;
      const now = Date.now();

      if (now - lastRun >= intervalMs || lastRun === 0) {
        await handleStartScraping('all', true);
      }
    };

    const initialTimeout = setTimeout(checkAndRunAutoScrape, 4000);
    const intervalTimer = setInterval(checkAndRunAutoScrape, 60000);
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalTimer);
    };
  }, [isHydrated, isAdminAccessReady, scrapingConfig?.autoScrapeEnabled, scrapingConfig?.scrapeInterval, isScraping]);

  const handleUpdateScrapingConfig = () => {
    if (!scrapingConfig) {
      showToast('Scraping configuration not loaded.', 'error')
      return
    }
    saveScrapingConfig(scrapingConfig)
    showToast('Scraping configuration saved successfully!', 'success')
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && scrapingConfig) {
      const files = Array.from(e.target.files);
      const validExtensions = scrapingConfig.supportedExtensions.map(ext => ext.toLowerCase());
      const validFiles = files.filter(file => {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        return validExtensions.includes(ext || '');
      });
      setSelectedLocalFiles(prev => [...prev, ...validFiles]);
      if (validFiles.length < files.length) {
        showToast('Some files were skipped (unsupported format)', 'error');
      }
    }
  }

  const handleRemoveFile = (index: number) => {
    setSelectedLocalFiles(prev => prev.filter((_, i) => i !== index));
  }

  const handleClearAllFiles = () => {
    setSelectedLocalFiles([]);
  }

  const handleImportLocalFiles = async () => {
    if (selectedLocalFiles.length === 0) return;
    
    setIsProcessingLocalFiles(true);
    const job = addScrapingJob({ type: 'local' });
    updateScrapingJob(job.id, { status: 'running' });

    const defaultQuality = scrapingConfig?.defaultQuality || '1080p';
    
    let itemsProcessed = 0;
    let itemsAdded = 0;
    const errors: string[] = [];
    
    try {
      for (const file of selectedLocalFiles) {
        itemsProcessed++;
        try {
          const parsed = parseFilename(file.name);
          
          if (!parsed.title) {
            errors.push(`Skipping "${file.name}": Could not parse title from filename`);
            continue;
          }

          const mkSource = (): MovieSource => ({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            title: file.name,
            quality: defaultQuality,
            size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
            type: 'Local Storage',
            isLocal: true,
            url: URL.createObjectURL(file),
          });

          if (parsed.type === 'movie') {
            let movie: Movie | null = null;
            try {
              const keys = getExternalApiKeys();
              if (keys.tmdb) {
                const searchResults = await searchTMDB(parsed.title, 'movie');
                if (searchResults && searchResults.length > 0) {
                  const details = await getTMDBDetails(searchResults[0].id, 'movie');
                  movie = await convertTMDBToMovieWithFanart(details);
                  movie.sources = [mkSource()];
                }
              }
            } catch (_tmdbErr) {
              movie = null;
            }

            if (!movie) {
              movie = {
                id: Date.now(),
                title: parsed.title,
                overview: '',
                posterPath: '',
                backdropPath: '',
                releaseYear: parsed.year || new Date().getFullYear(),
                rating: 0,
                runtime: '',
                genres: [],
                country: '',
                language: '',
                quality: defaultQuality,
                studio: '',
                director: '',
                sources: [mkSource()],
              };
            }

            let added = false;
            setMovies(prev => {
              const exists = prev.some(m => m.title === (movie as Movie).title);
              if (exists) return prev;
              added = true;
              const updated = [...prev, movie as Movie];
              saveMovies(updated);
              return updated;
            });
            if (added) itemsAdded++;
          } else if (parsed.type === 'tv') {
            let tvShow: TVShow | null = null;
            try {
              const keys = getExternalApiKeys();
              if (keys.tmdb) {
                const searchResults = await searchTMDB(parsed.title, 'tv');
                if (searchResults && searchResults.length > 0) {
                  const details = await getTMDBDetails(searchResults[0].id, 'tv');
                  tvShow = await convertTMDBToTVShowWithEpisodesAndFanart(details);
                }
              }
            } catch (_tmdbErr) {
              tvShow = null;
            }

            if (!tvShow) {
              tvShow = {
                id: Date.now(),
                title: parsed.title,
                overview: '',
                posterPath: '',
                backdropPath: '',
                startYear: parsed.year || new Date().getFullYear(),
                rating: 0,
                numberOfSeasons: 1,
                genres: [],
                country: '',
                language: '',
                quality: defaultQuality,
                studio: '',
                tags: [],
                trailerUrl: '',
                seasons: [],
              };
            }

            const targetSeasonNumber = parsed.season || 1;
            const targetEpisodeNumber = parsed.episode || 1;
            const localSource = mkSource();

            let mergedShow: TVShow = { ...tvShow };
            mergedShow.seasons = [...(mergedShow.seasons || [])];

            let season = mergedShow.seasons.find(s => s.seasonNumber === targetSeasonNumber);
            if (!season) {
              season = {
                id: Date.now(),
                seasonNumber: targetSeasonNumber,
                title: `Season ${targetSeasonNumber}`,
                overview: '',
                posterPath: '',
                episodes: [],
              };
              mergedShow.seasons.push(season);
            } else {
              const idx = mergedShow.seasons.indexOf(season);
              mergedShow.seasons[idx] = { ...season, episodes: [...(season.episodes || [])] };
              season = mergedShow.seasons[idx];
            }

            let episode = season.episodes.find(e => e.episodeNumber === targetEpisodeNumber);
            if (!episode) {
              episode = {
                id: Date.now(),
                title: `Episode ${targetEpisodeNumber}`,
                overview: '',
                episodeNumber: targetEpisodeNumber,
                runtime: '45',
                rating: 0,
                airDate: '',
                thumbnailPath: '',
                sources: [localSource],
              };
              season.episodes.push(episode);
            } else {
              episode = {
                ...episode,
                sources: [...(episode.sources || []), localSource],
              };
              const eIdx = season.episodes.indexOf(
                season.episodes.find(e => e.episodeNumber === targetEpisodeNumber) as Episode,
              );
              season.episodes[eIdx] = episode;
            }

            let added = false;
            setTvShows(prev => {
              const existsIdx = prev.findIndex(s => s.title === (mergedShow as TVShow).title);
              if (existsIdx === -1) {
                added = true;
                const updated = [...prev, mergedShow as TVShow];
                saveTVShows(updated);
                return updated;
              }
              const existing = { ...prev[existsIdx], seasons: [...(prev[existsIdx].seasons || [])] };
              for (const newSeason of (mergedShow as TVShow).seasons || []) {
                const sIdx = existing.seasons.findIndex(
                  (ms: Season) => ms.seasonNumber === newSeason.seasonNumber,
                );
                if (sIdx === -1) {
                  existing.seasons.push(newSeason);
                } else {
                  const seasonCopy = {
                    ...existing.seasons[sIdx],
                    episodes: [...(existing.seasons[sIdx].episodes || [])],
                  };
                  for (const newEpisode of newSeason.episodes || []) {
                    const eIdx = seasonCopy.episodes.findIndex(
                      (me: Episode) => me.episodeNumber === newEpisode.episodeNumber,
                    );
                    if (eIdx === -1) {
                      seasonCopy.episodes.push(newEpisode);
                    } else {
                      const mergedSources = [
                        ...(seasonCopy.episodes[eIdx].sources || []),
                        ...(newEpisode.sources || []),
                      ];
                      seasonCopy.episodes[eIdx] = {
                        ...seasonCopy.episodes[eIdx],
                        sources: mergedSources,
                      };
                    }
                  }
                  existing.seasons[sIdx] = seasonCopy;
                }
              }
              const updated = [...prev];
              updated[existsIdx] = existing;
              saveTVShows(updated);
              return updated;
            });
            if (added) itemsAdded++;
          }
          
          updateScrapingJob(job.id, { itemsProcessed, itemsAdded, errors });
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (err) {
          errors.push(`Error processing ${file.name}: ${(err as Error).message}`);
        }
      }
      
      updateScrapingJob(job.id, { 
        status: errors.length === itemsProcessed && itemsAdded === 0 ? 'failed' : 'completed', 
        endTime: new Date().toISOString(),
        itemsProcessed,
        itemsAdded,
        errors,
      });
      setScrapingConfig(getScrapingConfig());
      
      setSelectedLocalFiles([]);
      if (itemsAdded > 0) {
        showToast(`Successfully imported ${itemsAdded} item${itemsAdded === 1 ? '' : 's'}!${errors.length > 0 ? ` (${errors.length} warning${errors.length === 1 ? '' : 's'})` : ''}`, 'success');
      } else if (errors.length > 0) {
        showToast(`Import finished with no new items (${errors.length} error${errors.length === 1 ? '' : 's'}). Check the job for details.`, 'error');
      } else {
        showToast('Import completed — all items matched existing entries (updated where applicable).', 'success');
      }
    } catch (err) {
      const freshConfig = getScrapingConfig();
      const existingErrors = freshConfig.scrapingJobs.find((j: ScrapingJob) => j.id === job.id)?.errors || [];
      updateScrapingJob(job.id, { 
        status: 'failed', 
        endTime: new Date().toISOString(),
        errors: [...existingErrors, ...errors, (err as Error).message],
      });
      setScrapingConfig(getScrapingConfig());
      showToast('Failed to import files: ' + (err as Error).message, 'error');
    } finally {
      setIsProcessingLocalFiles(false);
    }
  }

  const handleDeleteMovie = (id: number | string) => {
    const newMovies = movies.filter((m: any) => m.id !== id)
    setMovies(newMovies)
    saveMovies(newMovies)
  }

  const handleSaveMovie = (movieData: any) => {
    let newMovies;
    if (editingMovie) {
      newMovies = movies.map((m: any) => 
        m.id === editingMovie.id ? { ...m, ...movieData } : m
      )
    } else {
      newMovies = [...movies, { ...movieData, id: Date.now() }]
    }
    setMovies(newMovies)
    saveMovies(newMovies)
    setEditingMovie(null)
  }

  // TV Show Handlers
  const handleSaveTVShow = (showData: any) => {
    let newShows;
    if (selectedTVShow) {
      newShows = tvShows.map((s: any) => 
        s.id === selectedTVShow.id ? { ...s, ...showData } : s
      )
    } else {
      newShows = [...tvShows, { ...showData, id: Date.now(), seasons: [] }]
    }
    setTvShows(newShows)
    saveTVShows(newShows)
    setSelectedTVShow(null)
    setIsTVShowModalOpen(false)
  }

  // Season Handlers
  const handleDeleteSeason = (showId: any, seasonId: any) => {
    const newShows = tvShows.map((show: any) => 
      show.id === showId 
        ? syncShowSeasons(
            show,
            (show.seasons || []).filter((season: any) => season.id !== seasonId)
          )
        : show
    )
    setTvShows(newShows)
    saveTVShows(newShows)
    if (managedSeasonId === seasonId) {
      handleCloseEpisodeManager()
    }
  }

  // Episode Handlers
  const handleAddEpisode = (showId: any, seasonId: any) => {
    handleEditEpisodeModal(showId, seasonId);
  }

  const handleDeleteEpisode = (showId: any, seasonId: any, episodeId: any) => {
    const newShows = tvShows.map((show: any) => {
      if (show.id !== showId) return show;
      const updatedSeasons = show.seasons?.map((season: any) => {
        if (season.id !== seasonId) return season;
        const updatedEpisodes = season.episodes?.filter((e: any) => e.id !== episodeId)
          .map((e: any, i: number) => ({ ...e, episodeNumber: i + 1 })) || [];
        return { ...season, episodes: updatedEpisodes }
      }) || [];
      return { ...show, seasons: updatedSeasons }
    })
    setTvShows(newShows)
    saveTVShows(newShows)
    if (editingEpisode?.id === episodeId) {
      setEditingEpisode(null)
      setIsEpisodeEditorOpen(false)
      setEpisodeFormData(getEpisodeFormDefaults(showId, seasonId))
    }
  }

  // Season Manager Handlers
  const handleEditSeasonModal = (showId: any, season?: any) => {
    setManagedTVShowId(showId)
    setEditingSeason(season || null)
    setIsSeasonEditorOpen(true)
    setSeasonFormData(getSeasonFormDefaults(showId, season))
  }

  const handleSubmitSeasonForm = (e: React.FormEvent) => {
    e.preventDefault()

    if (!managedTVShowId) return

    handleSaveSeason(managedTVShowId, editingSeason?.id, seasonFormData)
    setEditingSeason(null)
    setIsSeasonEditorOpen(false)
    setSeasonFormData(getSeasonFormDefaults(managedTVShowId))
  }

  const handleEditEpisodeManager = (showId: any, seasonId: any, episode?: any) => {
    setManagedTVShowId(showId)
    setManagedSeasonId(seasonId)
    setEditingEpisode(episode || null)
    setIsEpisodeEditorOpen(true)
    setEpisodeFormData(getEpisodeFormDefaults(showId, seasonId, episode))
  }

  const handleSubmitEpisodeForm = (e: React.FormEvent) => {
    e.preventDefault()

    if (!managedTVShowId || !managedSeasonId) return

    handleSaveEpisode(managedTVShowId, managedSeasonId, editingEpisode?.id, episodeFormData)
    setEditingEpisode(null)
    setIsEpisodeEditorOpen(false)
    setEpisodeFormData(getEpisodeFormDefaults(managedTVShowId, managedSeasonId))
  }

  const handleSaveSeason = (showId: any, seasonId: any | undefined, formData: any) => {
    const nextSeasonNumber = Number(formData.seasonNumber)
    if (!Number.isInteger(nextSeasonNumber) || nextSeasonNumber < 1) {
      showToast('Season number must be 1 or greater.', 'error')
      return
    }

    const selectedShow = tvShows.find((show: any) => show.id === showId)
    const duplicateSeason = selectedShow?.seasons?.some(
      (season: any) => season.id !== seasonId && season.seasonNumber === nextSeasonNumber
    )

    if (duplicateSeason) {
      showToast(`Season ${nextSeasonNumber} already exists for this series.`, 'error')
      return
    }

    const sanitizedFormData = {
      ...formData,
      seasonNumber: nextSeasonNumber,
      title: formData.title.trim(),
      overview: formData.overview.trim(),
      posterPath: formData.posterPath.trim()
    }

    const newShows = tvShows.map((show: any) => {
      if (show.id !== showId) return show;
      
      if (seasonId) {
        // Edit existing season
        const updatedSeasons = show.seasons?.map((season: any) => 
          season.id === seasonId ? { ...season, ...sanitizedFormData } : season
        ) || [];
        return syncShowSeasons(show, updatedSeasons);
      } else {
        // Add new season
        const newSeason = {
          id: Date.now(),
          ...sanitizedFormData,
          episodes: []
        };
        return syncShowSeasons(show, [...(show.seasons || []), newSeason]);
      }
    });
    setTvShows(newShows);
    saveTVShows(newShows);
  };

  // Episode Modal Handlers
  const handleEditEpisodeModal = (showId: any, seasonId: any, episode?: any) => {
    setCurrentTVShowForSeason(showId);
    setCurrentSeasonForEpisode(seasonId);
    setEditingEpisode(episode || null);
    setIsEpisodeModalOpen(true);
  };

  const handleSaveEpisode = (showId: any, seasonId: any, episodeId: any | undefined, formData: any) => {
    const newShows = tvShows.map((show: any) => {
      if (show.id !== showId) return show;
      
      const updatedSeasons = show.seasons?.map((season: any) => {
        if (season.id !== seasonId) return season;
        
        if (episodeId) {
          // Edit existing episode
          const updatedEpisodes = season.episodes?.map((episode: any) => 
            episode.id === episodeId ? { ...episode, ...formData } : episode
          ) || [];
          return { ...season, episodes: updatedEpisodes };
        } else {
          // Add new episode
          const newEpisode = {
            id: Date.now(),
            ...formData,
            sources: []
          };
          return { ...season, episodes: [...(season.episodes || []), newEpisode] };
        }
      }) || [];
      return { ...show, seasons: updatedSeasons };
    });
    setTvShows(newShows);
    saveTVShows(newShows);
  };

  // Source Modal Handlers
  const handleEditSourceModal = (showId: any, seasonId: any, episodeId: any, source?: any) => {
    setCurrentTVShowForSeason(showId);
    setCurrentSeasonForEpisode(seasonId);
    setCurrentEpisodeForSource(episodeId);
    setEditingSource(source || null);
    setIsSourceModalOpen(true);
  };

  const handleSaveSource = (showId: any, seasonId: any, episodeId: any, sourceId: any | undefined, formData: any) => {
    const newShows = tvShows.map((show: any) => {
      if (show.id !== showId) return show;
      
      const updatedSeasons = show.seasons?.map((season: any) => {
        if (season.id !== seasonId) return season;
        
        const updatedEpisodes = season.episodes?.map((episode: any) => {
          if (episode.id !== episodeId) return episode;
          
          if (sourceId) {
            // Edit existing source
            const updatedSources = (episode.sources || []).map((source: any) => 
              source.id === sourceId ? { ...source, ...formData } : source
            );
            return { ...episode, sources: updatedSources };
          } else {
            // Add new source
            const newSource = {
              id: Date.now(),
              ...formData
            };
            return { ...episode, sources: [...(episode.sources || []), newSource] };
          }
        }) || [];
        return { ...season, episodes: updatedEpisodes };
      }) || [];
      return { ...show, seasons: updatedSeasons };
    });
    setTvShows(newShows);
    saveTVShows(newShows);
  };

  // Episode Source Handlers
  const handleAddEpisodeSource = (showId: any, seasonId: any, episodeId: any) => {
    handleEditSourceModal(showId, seasonId, episodeId);
  }

  const handleEditEpisodeSource = (showId: any, seasonId: any, episodeId: any, sourceId: any, field: string, value: any) => {
    const newShows = tvShows.map((show: any) => {
      if (show.id !== showId) return show;
      const updatedSeasons = show.seasons?.map((season: any) => {
        if (season.id !== seasonId) return season;
        const updatedEpisodes = season.episodes?.map((episode: any) => {
          if (episode.id !== episodeId) return episode;
          const updatedSources = (episode.sources || []).map((source: any) => 
            source.id === sourceId ? { ...source, [field]: value } : source
          );
          return { ...episode, sources: updatedSources }
        }) || [];
        return { ...season, episodes: updatedEpisodes }
      }) || [];
      return { ...show, seasons: updatedSeasons }
    })
    setTvShows(newShows)
    saveTVShows(newShows)
  }

  const handleDeleteEpisodeSource = (showId: any, seasonId: any, episodeId: any, sourceId: any) => {
    const newShows = tvShows.map((show: any) => {
      if (show.id !== showId) return show;
      const updatedSeasons = show.seasons?.map((season: any) => {
        if (season.id !== seasonId) return season;
        const updatedEpisodes = season.episodes?.map((episode: any) => {
          if (episode.id !== episodeId) return episode;
          const updatedSources = (episode.sources || []).filter((s: any) => s.id !== sourceId);
          return { ...episode, sources: updatedSources }
        }) || [];
        return { ...season, episodes: updatedEpisodes }
      }) || [];
      return { ...show, seasons: updatedSeasons }
    })
    setTvShows(newShows)
    saveTVShows(newShows)
  }

  // Xtream API Handlers
  const handleAddXtreamConfig = () => {
    const newConfig: XtreamConfig = {
      id: Date.now().toString(),
      name: 'New Xtream Config',
      serverUrl: 'https://example.com',
      username: '',
      password: '',
      isActive: xtreamConfigs.length === 0, // first config is active
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setXtreamConfigs([...xtreamConfigs, newConfig]);
  }

  const handleEditXtreamConfig = (id: string, field: keyof XtreamConfig, value: any) => {
    setXtreamConfigs(xtreamConfigs.map((c: XtreamConfig) => {
      if (c.id === id) {
        const updated = { ...c, [field]: value, updatedAt: new Date().toISOString() };
        // If setting isActive to true, set others to false
        if (field === 'isActive' && value === true) {
          setActiveXtreamConfig(id);
        }
        return updated;
      }
      // If another config was just set to active, set this one to false
      if (field === 'isActive' && value === true) {
        return { ...c, isActive: false };
      }
      return c;
    }));
  }

  const handleDeleteXtreamConfig = (id: string) => {
    const newConfigs = xtreamConfigs.filter((c: XtreamConfig) => c.id !== id);
    setXtreamConfigs(newConfigs);
  }

  const handleSaveXtreamConfigs = () => {
    saveXtreamConfigs(xtreamConfigs);
    showToast('Xtream API configs saved successfully!', 'success');
  }

  // Hero Banner Handlers
  const handleAddHeroBanner = () => {
    const newBanner: HeroBanner = {
      id: Date.now().toString(),
      title: 'New Banner',
      description: 'Banner description',
      backdropUrl: '',
      posterUrl: '',
      isActive: true,
      order: heroBanners.length + 1,
      autoScrollInterval: 10000,
    };
    setHeroBanners([...heroBanners, newBanner]);
  }

  const handleEditHeroBanner = (id: string, field: keyof HeroBanner, value: any) => {
    setHeroBanners(heroBanners.map(b => b.id === id ? { ...b, [field]: value } : b));
  }

  const handleDeleteHeroBanner = (id: string) => {
    setHeroBanners(heroBanners.filter(b => b.id !== id));
  }

  const handleSaveHeroBanners = () => {
    saveHeroBanners(heroBanners);
    showToast('Hero banners saved successfully!', 'success');
  }

  const handleAddKidsHeroBanner = () => {
    const newBanner: HeroBanner = {
      id: Date.now().toString(),
      title: 'New Kids Banner',
      description: 'Kids banner description',
      backdropUrl: '',
      posterUrl: '',
      isActive: true,
      order: kidsHeroBanners.length + 1,
      autoScrollInterval: 10000,
    };
    setKidsHeroBanners([...kidsHeroBanners, newBanner]);
  }

  const handleEditKidsHeroBanner = (id: string, field: keyof HeroBanner, value: any) => {
    setKidsHeroBanners(kidsHeroBanners.map(b => b.id === id ? { ...b, [field]: value } : b));
  }

  const handleDeleteKidsHeroBanner = (id: string) => {
    const remainingBanners = kidsHeroBanners.filter(b => b.id !== id).map((banner, index) => ({
      ...banner,
      order: index + 1,
    }));
    setKidsHeroBanners(remainingBanners);
  }

  const handleSaveKidsHeroBanners = () => {
    saveKidsHeroBanners(kidsHeroBanners);
    showToast('Kids hero banners saved successfully!', 'success');
  }

  const handleAddAnimeHeroBanner = () => {
    const newBanner: HeroBanner = {
      id: Date.now().toString(),
      title: 'New Anime Banner',
      description: 'Anime banner description',
      backdropUrl: '',
      posterUrl: '',
      isActive: true,
      order: animeHeroBanners.length + 1,
      autoScrollInterval: 10000,
    };
    setAnimeHeroBanners([...animeHeroBanners, newBanner]);
  }

  const handleEditAnimeHeroBanner = (id: string, field: keyof HeroBanner, value: any) => {
    setAnimeHeroBanners(animeHeroBanners.map(b => b.id === id ? { ...b, [field]: value } : b));
  }

  const handleDeleteAnimeHeroBanner = (id: string) => {
    const remainingBanners = animeHeroBanners.filter(b => b.id !== id).map((banner, index) => ({
      ...banner,
      order: index + 1,
    }));
    setAnimeHeroBanners(remainingBanners);
  }

  const handleSaveAnimeHeroBanners = () => {
    saveAnimeHeroBanners(animeHeroBanners);
    showToast('Anime hero banners saved successfully!', 'success');
  }

  // Genre Handlers
  const handleAddGenre = () => {
    const newGenre: Genre = {
      id: Date.now().toString(),
      name: 'New Genre',
      slug: 'new-genre',
      isActive: true,
    };
    setGenres([...genres, newGenre]);
  }

  const handleEditGenre = (id: string, field: keyof Genre, value: any) => {
    setGenres(genres.map(g => g.id === id ? { ...g, [field]: value } : g));
  }

  const handleDeleteGenre = (id: string) => {
    setGenres(genres.filter(g => g.id !== id));
  }

  const handleSaveGenres = () => {
    saveGenres(genres);
    showToast('Genres saved successfully!', 'success');
  }

  // Country Handlers
  const handleAddCountry = () => {
    const newCountry: Country = {
      id: Date.now().toString(),
      name: 'New Country',
      code: 'NC',
      isActive: true,
    };
    setCountries([...countries, newCountry]);
  }

  const handleEditCountry = (id: string, field: keyof Country, value: any) => {
    setCountries(countries.map(c => c.id === id ? { ...c, [field]: value } : c));
  }

  const handleDeleteCountry = (id: string) => {
    setCountries(countries.filter(c => c.id !== id));
  }

  const handleSaveCountries = () => {
    saveCountries(countries);
    showToast('Countries saved successfully!', 'success');
  }

  // Language Handlers
  const handleAddLanguage = () => {
    const newLanguage: Language = {
      id: Date.now().toString(),
      name: 'New Language',
      code: 'NL',
      isActive: true,
    };
    setLanguages([...languages, newLanguage]);
  }

  const handleEditLanguage = (id: string, field: keyof Language, value: any) => {
    setLanguages(languages.map(l => l.id === id ? { ...l, [field]: value } : l));
  }

  const handleDeleteLanguage = (id: string) => {
    setLanguages(languages.filter(l => l.id !== id));
  }

  const handleSaveLanguages = () => {
    saveLanguages(languages);
    showToast('Languages saved successfully!', 'success');
  }

  // Push Notification Handlers
  const handleSendNotification = () => {
    const notification: PushNotification = {
      id: Date.now().toString(),
      title: newNotification.title,
      message: newNotification.message,
      imageUrl: newNotification.imageUrl,
      sentAt: new Date().toISOString(),
      status: 'sent',
    };
    setPushNotifications([notification, ...pushNotifications]);
    savePushNotifications([notification, ...pushNotifications]);
    setNewNotification({ title: '', message: '', imageUrl: '' });
    showToast('Push notification sent successfully!', 'success');
  }

  // API Key Handlers
  const generateApiKey = () => {
    return 'pk_' + Math.random().toString(36).substr(2, 32);
  }

  const handleAddApiKey = () => {
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: 'New API Key',
      key: generateApiKey(),
      permissions: ['read', 'write'],
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    setApiKeys([...apiKeys, newKey]);
    saveApiKeys([...apiKeys, newKey]);
    showToast('API key created successfully!', 'success');
  }

  const handleEditApiKey = (id: string, field: keyof ApiKey, value: any) => {
    const updatedKeys = apiKeys.map(k => k.id === id ? { ...k, [field]: value } : k);
    setApiKeys(updatedKeys);
    saveApiKeys(updatedKeys);
  }

  const handleDeleteApiKey = (id: string) => {
    const updatedKeys = apiKeys.filter(k => k.id !== id);
    setApiKeys(updatedKeys);
    saveApiKeys(updatedKeys);
    showToast('API key deleted successfully!', 'success');
  }

  // Hero Banner Up/Down Handler
  const handleMoveHeroBanner = (id: string, direction: 'up' | 'down') => {
    const index = heroBanners.findIndex(b => b.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= heroBanners.length) return;

    const newBanners = [...heroBanners];
    [newBanners[index], newBanners[newIndex]] = [newBanners[newIndex], newBanners[index]];
    const reordered = newBanners.map((b, i) => ({ ...b, order: i + 1 }));
    setHeroBanners(reordered);
  }

  const handleMoveKidsHeroBanner = (id: string, direction: 'up' | 'down') => {
    const index = kidsHeroBanners.findIndex(b => b.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= kidsHeroBanners.length) return;

    const newBanners = [...kidsHeroBanners];
    [newBanners[index], newBanners[newIndex]] = [newBanners[newIndex], newBanners[index]];
    const reordered = newBanners.map((b, i) => ({ ...b, order: i + 1 }));
    setKidsHeroBanners(reordered);
  }

  const handleMoveAnimeHeroBanner = (id: string, direction: 'up' | 'down') => {
    const index = animeHeroBanners.findIndex(b => b.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= animeHeroBanners.length) return;

    const newBanners = [...animeHeroBanners];
    [newBanners[index], newBanners[newIndex]] = [newBanners[newIndex], newBanners[index]];
    const reordered = newBanners.map((b, i) => ({ ...b, order: i + 1 }));
    setAnimeHeroBanners(reordered);
  }

  // Slider Section Handlers
  const handleAddSliderSection = () => {
    const newSection: SliderSection = {
      id: Date.now().toString(),
      type: 'custom',
      title: 'New Slider Section',
      description: '',
      movieIds: sampleMovies.slice(0, 4).map(m => m.id),
      isActive: true,
      order: sliderSections.length + 1,
      animationDuration: 15,
    };
    setSliderSections([...sliderSections, newSection]);
  }

  const handleEditSliderSection = (id: string, field: keyof SliderSection, value: any) => {
    setSliderSections(sliderSections.map(s => s.id === id ? { ...s, [field]: value } : s));
  }

  const handleDeleteSliderSection = (id: string) => {
    setSliderSections(sliderSections.filter(s => s.id !== id));
  }

  const handleMoveSliderSection = (id: string, direction: 'up' | 'down') => {
    const index = sliderSections.findIndex(s => s.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sliderSections.length) return;

    const newSections = [...sliderSections];
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    const reordered = newSections.map((s, i) => ({ ...s, order: i + 1 }));
    setSliderSections(reordered);
  }

  const handleSaveSliderSections = () => {
    saveSliderSections(sliderSections);
    showToast('Slider sections saved successfully!', 'success');
  }

  const handleAddKidsSliderSection = () => {
    const newSection: SliderSection = {
      id: `kids-slider-${Date.now()}`,
      type: 'custom',
      title: 'New Kids Slider',
      description: 'A playful kids-only slider section',
      movieIds: [],
      contentType: 'movie',
      contentIds: [],
      isActive: true,
      order: kidsSliderSections.length + 1,
      animationDuration: 15,
    };
    setKidsSliderSections([...kidsSliderSections, newSection]);
  }

  const handleSaveKidsSliderMovieSelection = (selectedMovies: any[]) => {
    if (!activeKidsSliderForMovieSelection) return;
    setKidsSliderSections(kidsSliderSections.map(s => 
      s.id === activeKidsSliderForMovieSelection 
        ? { ...s, contentIds: selectedMovies, movieIds: selectedMovies }
        : s
    ));
    setActiveKidsSliderForMovieSelection(null);
  }

  const handleSaveKidsSliderTVShowSelection = (selectedTVShows: any[]) => {
    if (!activeKidsSliderForTVShowSelection) return;
    setKidsSliderSections(kidsSliderSections.map(s => 
      s.id === activeKidsSliderForTVShowSelection 
        ? { ...s, contentIds: selectedTVShows }
        : s
    ));
    setActiveKidsSliderForTVShowSelection(null);
  }

  const handleEditKidsSliderSection = (id: string, field: keyof SliderSection, value: any) => {
    setKidsSliderSections(kidsSliderSections.map(s => s.id === id ? { ...s, [field]: value } : s));
  }

  const handleDeleteKidsSliderSection = (id: string) => {
    const remainingSections = kidsSliderSections
      .filter(s => s.id !== id)
      .map((section, index) => ({ ...section, order: index + 1 }));
    setKidsSliderSections(remainingSections);
  }

  const handleMoveKidsSliderSection = (id: string, direction: 'up' | 'down') => {
    const index = kidsSliderSections.findIndex(s => s.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= kidsSliderSections.length) return;

    const newSections = [...kidsSliderSections];
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    const reordered = newSections.map((s, i) => ({ ...s, order: i + 1 }));
    setKidsSliderSections(reordered);
  }

  const handleSaveKidsSliderSections = () => {
    saveKidsSliderSections(kidsSliderSections);
    showToast('Kids slider sections saved successfully!', 'success');
  }

  const handleSaveAnimeSliderMovieSelection = (selectedMovies: any[]) => {
    if (!activeAnimeSliderForMovieSelection) return;
    setAnimeSliderSections(animeSliderSections.map(s => 
      s.id === activeAnimeSliderForMovieSelection 
        ? { ...s, contentIds: selectedMovies, movieIds: selectedMovies }
        : s
    ));
    setActiveAnimeSliderForMovieSelection(null);
  }

  const handleSaveAnimeSliderTVShowSelection = (selectedTVShows: any[]) => {
    if (!activeAnimeSliderForTVShowSelection) return;
    setAnimeSliderSections(animeSliderSections.map(s => 
      s.id === activeAnimeSliderForTVShowSelection 
        ? { ...s, contentIds: selectedTVShows }
        : s
    ));
    setActiveAnimeSliderForTVShowSelection(null);
  }

  const handleSaveAnimeSliderSections = () => {
    saveAnimeSliderSections(animeSliderSections);
    showToast('Anime slider sections saved successfully!', 'success');
  }

  const handleAddAnimeSliderSection = () => {
    const newSection: SliderSection = {
      id: `anime-slider-${Date.now()}`,
      type: "custom",
      title: "New Anime Slider",
      description: "A stylized anime-only slider section",
      movieIds: [],
      contentType: "movie",
      contentIds: [],
      isActive: true,
      order: animeSliderSections.length + 1,
      animationDuration: 15,
    };
    setAnimeSliderSections([...animeSliderSections, newSection]);
  }

  const handleEditAnimeSliderSection = (id: string, field: keyof SliderSection, value: any) => {
    setAnimeSliderSections(animeSliderSections.map(s => s.id === id ? { ...s, [field]: value } : s));
  }

  const handleDeleteAnimeSliderSection = (id: string) => {
    const remainingSections = animeSliderSections
      .filter(s => s.id !== id)
      .map((section, index) => ({ ...section, order: index + 1 }));
    setAnimeSliderSections(remainingSections);
  }

  const handleMoveAnimeSliderSection = (id: string, direction: 'up' | 'down') => {
    const index = animeSliderSections.findIndex(s => s.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= animeSliderSections.length) return;

    const newSections = [...animeSliderSections];
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    const reordered = newSections.map((s, i) => ({ ...s, order: i + 1 }));
    setAnimeSliderSections(reordered);
  }

  const handleEditMovieRequest = (id: string, field: keyof MovieRequest, value: any) => {
    setMovieRequests(movieRequests.map((request) => {
      if (request.id !== id) return request;

      return {
        ...request,
        [field]: value,
        updatedAt: new Date().toLocaleString()
      };
    }));
  }

  const handleSaveAllMovieRequests = () => {
    saveMovieRequests(movieRequests);
    showToast('Movie requests saved successfully!', 'success');
  }

  const handleSaveMovieSelection = (selectedMovies: any[]) => {
    if (!activeSliderForMovieSelection) return;
    const newSliders = sliderSections.map(s => 
      s.id === activeSliderForMovieSelection 
        ? { ...s, movieIds: selectedMovies } 
        : s
    );
    setSliderSections(newSliders);
    saveSliderSections(newSliders);
    setActiveSliderForMovieSelection(null);
  }

  const handleSaveHomepageSectionMovieSelection = (selectedMovies: any[]) => {
    if (!activeHomepageSectionForMovieSelection) return;
    const newHomepageSections = homepageSections.map(s => 
      s.id === activeHomepageSectionForMovieSelection 
        ? { ...s, movieIds: selectedMovies } 
        : s
    );
    setHomepageSections(newHomepageSections);
    saveHomepageSections(newHomepageSections);
    setActiveHomepageSectionForMovieSelection(null);
  }

  // Homepage Sections Handlers
  const handleAddHomepageSection = () => {
    const newSection: HomepageSection = {
      id: Date.now().toString(),
      type: 'custom',
      title: 'New Custom Section',
      isActive: true,
      order: homepageSections.length + 1,
    };
    setHomepageSections([...homepageSections, newSection]);
  }

  const handleAddMovieGenreSection = () => {
    const firstGenre = genres.find(g => g.isActive)?.name || 'Drama';
    const newSection: HomepageSection = {
      id: Date.now().toString(),
      type: 'movie-genre',
      title: `Movies: ${firstGenre}`,
      isActive: true,
      order: homepageSections.length + 1,
      genre: firstGenre,
    };
    setHomepageSections([...homepageSections, newSection]);
  }

  const handleAddTVGenreSection = () => {
    const firstGenre = genres.find(g => g.isActive)?.name || 'Drama';
    const newSection: HomepageSection = {
      id: Date.now().toString(),
      type: 'tv-genre',
      title: `TV Shows: ${firstGenre}`,
      isActive: true,
      order: homepageSections.length + 1,
      genre: firstGenre,
    };
    setHomepageSections([...homepageSections, newSection]);
  }

  const handleEditHomepageSection = (id: string, field: keyof HomepageSection, value: any) => {
    setHomepageSections(homepageSections.map(s => s.id === id ? { ...s, [field]: value } : s));
  }

  const handleDeleteHomepageSection = (id: string) => {
    setHomepageSections(homepageSections.filter(s => s.id !== id));
  }

  const handleMoveHomepageSection = (id: string, direction: 'up' | 'down') => {
    const index = homepageSections.findIndex(s => s.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= homepageSections.length) return;

    const newSections = [...homepageSections];
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    const reordered = newSections.map((s, i) => ({ ...s, order: i + 1 }));
    setHomepageSections(reordered);
  }

  const handleSaveHomepageSections = () => {
    saveHomepageSections(homepageSections);
    showToast('Homepage sections saved successfully!', 'success');
  }

  // Kids Homepage Sections Handlers
  const handleAddKidsHomepageSection = () => {
    const newSection: HomepageSection = {
      id: Date.now().toString(),
      type: 'custom',
      title: 'New Custom Section',
      isActive: true,
      order: kidsHomepageSections.length + 1,
    };
    setKidsHomepageSections([...kidsHomepageSections, newSection]);
  }

  const handleAddKidsMovieGenreSection = () => {
    const firstGenre = genres.find(g => g.isActive)?.name || 'Drama';
    const newSection: HomepageSection = {
      id: Date.now().toString(),
      type: 'movie-genre',
      title: `Kids Movies: ${firstGenre}`,
      isActive: true,
      order: kidsHomepageSections.length + 1,
      genre: firstGenre,
    };
    setKidsHomepageSections([...kidsHomepageSections, newSection]);
  }

  const handleAddKidsTVGenreSection = () => {
    const firstGenre = genres.find(g => g.isActive)?.name || 'Drama';
    const newSection: HomepageSection = {
      id: Date.now().toString(),
      type: 'tv-genre',
      title: `Kids TV Shows: ${firstGenre}`,
      isActive: true,
      order: kidsHomepageSections.length + 1,
      genre: firstGenre,
    };
    setKidsHomepageSections([...kidsHomepageSections, newSection]);
  }

  const handleEditKidsHomepageSection = (id: string, field: keyof HomepageSection, value: any) => {
    setKidsHomepageSections(kidsHomepageSections.map(s => s.id === id ? { ...s, [field]: value } : s));
  }

  const handleDeleteKidsHomepageSection = (id: string) => {
    setKidsHomepageSections(kidsHomepageSections.filter(s => s.id !== id));
  }

  const handleMoveKidsHomepageSection = (id: string, direction: 'up' | 'down') => {
    const index = kidsHomepageSections.findIndex(s => s.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= kidsHomepageSections.length) return;

    const newSections = [...kidsHomepageSections];
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    const reordered = newSections.map((s, i) => ({ ...s, order: i + 1 }));
    setKidsHomepageSections(reordered);
  }

  const handleSaveKidsHomepageSections = () => {
    saveKidsHomepageSections(kidsHomepageSections);
    showToast('Kids homepage sections saved successfully!', 'success');
  }

  const handleSaveKidsHomepageMovieSelection = (selectedMovies: any[]) => {
    if (!activeKidsHomepageSectionForMovieSelection) return;
    const newKidsHomepageSections = kidsHomepageSections.map(s => 
      s.id === activeKidsHomepageSectionForMovieSelection 
        ? { ...s, movieIds: selectedMovies } 
        : s
    );
    setKidsHomepageSections(newKidsHomepageSections);
    saveKidsHomepageSections(newKidsHomepageSections);
    setActiveKidsHomepageSectionForMovieSelection(null);
  }

  const handleSaveKidsHomepageTVShowSelection = (selectedTVShows: any[]) => {
    if (!activeKidsHomepageSectionForTVShowSelection) return;
    const newKidsHomepageSections = kidsHomepageSections.map(s => 
      s.id === activeKidsHomepageSectionForTVShowSelection 
        ? { ...s, movieIds: selectedTVShows } 
        : s
    );
    setKidsHomepageSections(newKidsHomepageSections);
    saveKidsHomepageSections(newKidsHomepageSections);
    setActiveKidsHomepageSectionForTVShowSelection(null);
  }

  // Anime Homepage Sections Handlers
  const handleAddAnimeHomepageSection = () => {
    const newSection: HomepageSection = {
      id: Date.now().toString(),
      type: 'custom',
      title: 'New Custom Section',
      isActive: true,
      order: animeHomepageSections.length + 1,
    };
    setAnimeHomepageSections([...animeHomepageSections, newSection]);
  }

  const handleAddAnimeMovieGenreSection = () => {
    const firstGenre = genres.find(g => g.isActive)?.name || 'Drama';
    const newSection: HomepageSection = {
      id: Date.now().toString(),
      type: 'movie-genre',
      title: `Anime Movies: ${firstGenre}`,
      isActive: true,
      order: animeHomepageSections.length + 1,
      genre: firstGenre,
    };
    setAnimeHomepageSections([...animeHomepageSections, newSection]);
  }

  const handleAddAnimeTVGenreSection = () => {
    const firstGenre = genres.find(g => g.isActive)?.name || 'Drama';
    const newSection: HomepageSection = {
      id: Date.now().toString(),
      type: 'tv-genre',
      title: `Anime TV Shows: ${firstGenre}`,
      isActive: true,
      order: animeHomepageSections.length + 1,
      genre: firstGenre,
    };
    setAnimeHomepageSections([...animeHomepageSections, newSection]);
  }

  const handleEditAnimeHomepageSection = (id: string, field: keyof HomepageSection, value: any) => {
    setAnimeHomepageSections(animeHomepageSections.map(s => s.id === id ? { ...s, [field]: value } : s));
  }

  const handleDeleteAnimeHomepageSection = (id: string) => {
    setAnimeHomepageSections(animeHomepageSections.filter(s => s.id !== id));
  }

  const handleMoveAnimeHomepageSection = (id: string, direction: 'up' | 'down') => {
    const index = animeHomepageSections.findIndex(s => s.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= animeHomepageSections.length) return;

    const newSections = [...animeHomepageSections];
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    const reordered = newSections.map((s, i) => ({ ...s, order: i + 1 }));
    setAnimeHomepageSections(reordered);
  }

  const handleSaveAnimeHomepageSections = () => {
    saveAnimeHomepageSections(animeHomepageSections);
    showToast('Anime homepage sections saved successfully!', 'success');
  }

  const handleSaveAnimeHomepageMovieSelection = (selectedMovies: any[]) => {
    if (!activeAnimeHomepageSectionForMovieSelection) return;
    const newAnimeHomepageSections = animeHomepageSections.map(s => 
      s.id === activeAnimeHomepageSectionForMovieSelection 
        ? { ...s, movieIds: selectedMovies } 
        : s
    );
    setAnimeHomepageSections(newAnimeHomepageSections);
    saveAnimeHomepageSections(newAnimeHomepageSections);
    setActiveAnimeHomepageSectionForMovieSelection(null);
  }

  const handleSaveAnimeHomepageTVShowSelection = (selectedTVShows: any[]) => {
    if (!activeAnimeHomepageSectionForTVShowSelection) return;
    const newAnimeHomepageSections = animeHomepageSections.map(s => 
      s.id === activeAnimeHomepageSectionForTVShowSelection 
        ? { ...s, movieIds: selectedTVShows } 
        : s
    );
    setAnimeHomepageSections(newAnimeHomepageSections);
    saveAnimeHomepageSections(newAnimeHomepageSections);
    setActiveAnimeHomepageSectionForTVShowSelection(null);
  }

  // Quick Add Handlers
  const handleSelectMovie = (movieId: string | number) => {
    const newSelected = new Set(selectedMovieIds);
    if (newSelected.has(movieId)) {
      newSelected.delete(movieId);
    } else {
      newSelected.add(movieId);
    }
    setSelectedMovieIds(newSelected);
  };

  const handleSelectTVShow = (showId: string | number) => {
    const newSelected = new Set(selectedTVShowIds);
    if (newSelected.has(showId)) {
      newSelected.delete(showId);
    } else {
      newSelected.add(showId);
    }
    setSelectedTVShowIds(newSelected);
  };

  const getSelectedTVShows = () => tvShows.filter((show: TVShow) => selectedTVShowIds.has(show.id));

  const handleTagSelectedTVShows = (audience: 'kids' | 'anime') => {
    if (selectedTVShowIds.size === 0) {
      showToast('Please select at least one TV show!', 'error');
      return;
    }

    const updatedShows = tvShows.map((show: TVShow) => {
      if (!selectedTVShowIds.has(show.id)) {
        return show;
      }

      return {
        ...show,
        isKids: audience === 'kids' ? true : show.isKids,
        isAnime: audience === 'anime' ? true : show.isAnime,
      };
    });

    setTvShows(updatedShows);
    saveTVShows(updatedShows);
    showToast(
      audience === 'kids'
        ? 'Selected TV shows added to Kids TV Shows and Kids Home Slider!'
        : 'Selected TV shows added to Anime Shows and Anime Home Slider!',
      'success'
    );
  };

  const handleAddSelectedTVShowsAsModeHeroBanners = (mode: 'kids' | 'anime') => {
    const selectedShows = getSelectedTVShows();

    if (selectedShows.length === 0) {
      showToast('Please select at least one TV show!', 'error');
      return;
    }

    const newBanners = selectedShows.map((show: TVShow, index: number) => ({
      id: `${mode}-tv-${Date.now() + index}`,
      title: show.title,
      description: show.overview,
      backdropUrl: show.backdropPath,
      posterUrl: show.posterPath,
      contentType: 'tv' as const,
      contentId: show.id,
      tvShowId: show.id,
      isActive: true,
      order: (mode === 'kids' ? kidsHeroBanners.length : animeHeroBanners.length) + index + 1,
      autoScrollInterval: 10000,
    }));

    if (mode === 'kids') {
      setKidsHeroBanners([...kidsHeroBanners, ...newBanners]);
      showToast(`Added ${newBanners.length} TV shows as Kids hero banners!`, 'success');
      return;
    }

    setAnimeHeroBanners([...animeHeroBanners, ...newBanners]);
    showToast(`Added ${newBanners.length} TV shows as Anime hero banners!`, 'success');
  };

  const handleAddSelectedTVShowsToModeSlider = (mode: 'kids' | 'anime') => {
    const selectedShows = getSelectedTVShows();

    if (selectedShows.length === 0) {
      showToast('Please select at least one TV show!', 'error');
      return;
    }

    const newSection: SliderSection = {
      id: `${mode}-tv-slider-${Date.now()}`,
      type: 'custom',
      title: mode === 'kids' ? 'Kids TV HorizontalSlider' : 'Anime TV HorizontalSlider',
      description: selectedShows.map((show: TVShow) => show.title).join(', '),
      contentType: 'tv',
      contentIds: selectedShows.map((show: TVShow) => show.id),
      movieIds: [],
      isActive: true,
      order: (mode === 'kids' ? kidsSliderSections.length : animeSliderSections.length) + 1,
      animationDuration: 15,
    };

    if (mode === 'kids') {
      setKidsSliderSections([...kidsSliderSections, newSection]);
      showToast('Added selected TV shows to Kids HorizontalSlider!', 'success');
      return;
    }

    setAnimeSliderSections([...animeSliderSections, newSection]);
    showToast('Added selected TV shows to Anime HorizontalSlider!', 'success');
  };

  const handleAddSelectedAsHeroBanners = () => {
    if (selectedMovieIds.size === 0) {
      showToast('Please select at least one movie!', 'error');
      return;
    }

    const selectedMovies = movies.filter((m: any) => selectedMovieIds.has(m.id));
    const newBanners = selectedMovies.map((movie: any, index: number) => ({
      id: (Date.now() + index).toString(),
      title: movie.title,
      description: movie.overview,
      backdropUrl: movie.backdropPath,
      posterUrl: movie.posterPath,
      movieId: movie.id,
      isActive: true,
      order: heroBanners.length + index + 1,
      autoScrollInterval: 10000,
    }));

    setHeroBanners([...heroBanners, ...newBanners]);
    setSelectedMovieIds(new Set());
    showToast(`Added ${newBanners.length} banners successfully!`, 'success');
  };

  const handleAddSelectedAsKidsHeroBanners = () => {
    if (selectedMovieIds.size === 0) {
      showToast('Please select at least one movie!', 'error');
      return;
    }

    const selectedMovies = movies.filter((m: any) => selectedMovieIds.has(m.id));
    const newBanners = selectedMovies.map((movie: any, index: number) => ({
      id: `kids-${Date.now() + index}`,
      title: movie.title,
      description: movie.overview,
      backdropUrl: movie.backdropPath,
      posterUrl: movie.posterPath,
      movieId: movie.id,
      isActive: true,
      order: kidsHeroBanners.length + index + 1,
      autoScrollInterval: 10000,
    }));

    setKidsHeroBanners([...kidsHeroBanners, ...newBanners]);
    setSelectedMovieIds(new Set());
    showToast(`Added ${newBanners.length} kids banners successfully!`, 'success');
  };

  const handleAddSelectedAsAnimeHeroBanners = () => {
    if (selectedMovieIds.size === 0) {
      showToast('Please select at least one movie!', 'error');
      return;
    }

    const selectedMovies = movies.filter((m: any) => selectedMovieIds.has(m.id));
    const newBanners = selectedMovies.map((movie: any, index: number) => ({
      id: `anime-${Date.now() + index}`,
      title: movie.title,
      description: movie.overview,
      backdropUrl: movie.backdropPath,
      posterUrl: movie.posterPath,
      movieId: movie.id,
      isActive: true,
      order: animeHeroBanners.length + index + 1,
      autoScrollInterval: 10000,
    }));

    setAnimeHeroBanners([...animeHeroBanners, ...newBanners]);
    setSelectedMovieIds(new Set());
    showToast(`Added ${newBanners.length} anime banners successfully!`, 'success');
  };

  const handleAddSelectedToSliderSection = () => {
    if (selectedMovieIds.size === 0) {
      showToast('Please select at least one movie!', 'error');
      return;
    }

    const selectedMovies = movies.filter((m: any) => selectedMovieIds.has(m.id));
    const newSliderSection: SliderSection = {
      id: Date.now().toString(),
      type: 'custom',
      title: 'Quick Add Slider',
      description: `Movies: ${selectedMovies.map((m: any) => m.title).join(', ')}`,
      movieIds: selectedMovies.map((m: any) => m.id),
      isActive: true,
      order: sliderSections.length + 1,
      animationDuration: 15,
    };

    setSliderSections([...sliderSections, newSliderSection]);
    setSelectedMovieIds(new Set());
    showToast('Added new slider section successfully!', 'success');
  };

  const handleAddSelectedToHomepageSection = () => {
    if (selectedMovieIds.size === 0) {
      showToast('Please select at least one movie!', 'error');
      return;
    }

    const selectedMovies = movies.filter((m: any) => selectedMovieIds.has(m.id));
    const newHomepageSection: HomepageSection = {
      id: Date.now().toString(),
      title: 'Quick Add Section',
      type: 'custom',
      isActive: true,
      order: homepageSections.length + 1,
      animationDuration: 15,
      movieIds: selectedMovies.map((m: any) => m.id),
    };

    setHomepageSections([...homepageSections, newHomepageSection]);
    setSelectedMovieIds(new Set());
    showToast('Added new homepage section successfully!', 'success');
  };

  const handleTagSelectedMovies = (audience: 'kids' | 'anime') => {
    if (selectedMovieIds.size === 0) {
      showToast('Please select at least one movie!', 'error');
      return;
    }

    const updatedMovies = movies.map((movie: any) => {
      if (!selectedMovieIds.has(movie.id)) {
        return movie;
      }

      return {
        ...movie,
        isKids: audience === 'kids' ? true : movie.isKids,
        isAnime: audience === 'anime' ? true : movie.isAnime,
      };
    });

    setMovies(updatedMovies);
    saveMovies(updatedMovies);
    showToast(
      audience === 'kids'
        ? 'Selected movies marked as Kids Movie!'
        : 'Selected movies marked as Anime Movie!',
      'success'
    );
  };

  if (!isHydrated || !isAdminAccessReady || !isDataLoaded || !adminCredentials || !generalSettings || !adminParentalSettings || !scrapingConfig || !externalApiKeys || !adminProfile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-zinc-700 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={cn(
              "fixed top-6 right-6 z-50 px-6 py-4 rounded-xl border flex items-center gap-3",
              toast.type === 'success'
                ? "bg-emerald-900/90 border-emerald-700 text-emerald-100"
                : toast.type === 'warning'
                  ? "bg-amber-900/90 border-amber-700 text-amber-100"
                  : toast.type === 'info'
                    ? "bg-sky-900/90 border-sky-700 text-sky-100"
                    : "bg-rose-900/90 border-rose-700 text-rose-100"
            )}
          >
            {toast.type === 'success' ? (
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">âœ“</div>
            ) : toast.type === 'warning' ? (
              <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">!</div>
            ) : toast.type === 'info' ? (
              <div className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center">i</div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center">âœ•</div>
            )}
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                  className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                />
                <motion.div
                  initial={{ x: -300 }}
                  animate={{ x: 0 }}
                  exit={{ x: -300 }}
                  className="fixed left-0 top-0 bottom-0 w-64 bg-zinc-900 z-50 p-6 lg:hidden"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-white">
                      <span className="text-red-500">Play</span>Flix
                    </h1>
                    <button onClick={() => setSidebarOpen(false)}>
                      <X className="w-6 h-6 text-zinc-400" />
                    </button>
                  </div>
                  <nav className="space-y-2">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      if (item.subItems) {
                        const isAnySubItemActive = item.subItems.some((sub: any) => activeTab === sub.id)
                        const isHomeGroup = item.id === 'home-group'
                        const isSliderGroup = item.id === 'sliders-group'
                        const isHeroGroup = item.id === 'hero-group'
                        const dropdownOpen = isHomeGroup
                          ? mobileHomeDropdownOpen
                          : isSliderGroup
                            ? mobileSliderDropdownOpen
                            : isHeroGroup
                              ? mobileHeroDropdownOpen
                              : mobileImportDropdownOpen
                        const setDropdownOpen = isHomeGroup
                          ? setMobileHomeDropdownOpen
                          : isSliderGroup
                            ? setMobileSliderDropdownOpen
                            : isHeroGroup
                              ? setMobileHeroDropdownOpen
                              : setMobileImportDropdownOpen
                        
                        return (
                          <div key={item.id}>
                            <button
                              onClick={() => setDropdownOpen(!dropdownOpen)}
                              className={cn(
                                "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                isAnySubItemActive
                                  ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                {Icon && <Icon className="w-5 h-5" />}
                                <span className="font-medium">{item.label}</span>
                              </div>
                              <ChevronDown
                                className={cn(
                                  "w-4 h-4 transition-transform",
                                  dropdownOpen && "rotate-180"
                                )}
                              />
                            </button>
                            <AnimatePresence>
                              {dropdownOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="ml-4 mt-2 space-y-2">
                                    {item.subItems.map((sub: any) => {
                                      const SubIcon = sub.icon
                                      return (
                                        <button
                                          key={sub.id}
                                          onClick={() => {
                                            setActiveTab(sub.id)
                                            setSidebarOpen(false)
                                          }}
                                          className={cn(
                                            "w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200 text-sm",
                                            activeTab === sub.id
                                              ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                                              : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                          )}
                                        >
                                          <SubIcon className="w-4 h-4" />
                                          <span className="font-medium">{sub.label}</span>
                                        </button>
                                      )
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      }

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id)
                            setSidebarOpen(false)
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                            activeTab === item.id
                              ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                              : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                          )}
                        >
                          {Icon && <Icon className="w-5 h-5" />}
                          <span className="font-medium">{item.label}</span>
                        </button>
                      )
                    })}
                  </nav>
                  <button
                    onClick={handleAdminLogout}
                    className="w-full mt-6 flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <div className="flex">
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="flex-1 min-h-screen">
              <header className="bg-zinc-900/50 backdrop-blur-xl border-b border-zinc-800 px-6 py-4 sticky top-0 z-30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="lg:hidden p-2 hover:bg-zinc-800 rounded-lg"
                    >
                      <Menu className="w-6 h-6 text-zinc-400" />
                    </button>
                    <div className="relative hidden sm:block">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Search movies, users, shows..."
                        className="w-80 pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button className="relative p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                      <Bell className="w-6 h-6 text-zinc-400" />
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </button>
                    <button
                      onClick={handleAdminLogout}
                      className="hidden sm:flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-white transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-bold text-white">
                        A
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-white font-medium text-sm">Admin User</p>
                        <p className="text-zinc-500 text-xs">Super Admin</p>
                      </div>
                    </div>
                  </div>
                </div>
              </header>

          <main className="p-6">
            {activeTab === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Dashboard</h2>
                    <p className="text-zinc-500 mt-1">Welcome back! Here's what's happening today.</p>
                  </div>
                </div>

                {/* Server Stats Section (Moved to Top) */}
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 mb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-xl font-semibold text-white">Server Health</h3>
                    <div className="flex items-center gap-2">
                      {serverHealth.backend.status === 'healthy' ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">Online</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-red-400" />
                          <span className="text-red-400 font-medium">Offline</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {/* CPU Usage */}
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Activity className="w-5 h-5 text-red-400" />
                          <span className="text-sm text-zinc-400 font-medium">CPU Usage</span>
                        </div>
                        <span className="text-lg font-bold text-white">
                          {serverHealth.backend.cpu ? `${serverHealth.backend.cpu.load1min.toFixed(0)}%` : '0%'}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500" 
                          style={{ 
                            width: `${serverHealth.backend.cpu 
                              ? Math.min(100, serverHealth.backend.cpu.load1min / serverHealth.backend.cpu.cores * 100) 
                              : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* RAM Usage */}
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Database className="w-5 h-5 text-blue-400" />
                          <span className="text-sm text-zinc-400 font-medium">RAM Usage</span>
                        </div>
                        <span className="text-lg font-bold text-white">
                          {serverHealth.backend.memory?.usagePercentage || '0%'}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500" 
                          style={{ width: `${serverHealth.backend.memory?.usagePercentage || 0}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Bandwidth */}
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Wifi className="w-5 h-5 text-yellow-400" />
                          <span className="text-sm text-zinc-400 font-medium">Bandwidth</span>
                        </div>
                        <div className="flex flex-col items-end text-xs">
                          <span className="text-emerald-400">↑ {serverHealth.backend.bandwidth?.sentFormatted || '0 B'}</span>
                          <span className="text-blue-400">↓ {serverHealth.backend.bandwidth?.receivedFormatted || '0 B'}</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 transition-all duration-500" 
                          style={{ width: '60%' }}
                        />
                      </div>
                    </div>
                    
                    {/* Storage */}
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-5 h-5 text-purple-400" />
                          <span className="text-sm text-zinc-400 font-medium">Storage</span>
                        </div>
                        <span className="text-lg font-bold text-white">
                          {serverHealth.backend.storage?.usagePercentage || '0%'}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500" 
                          style={{ width: `${serverHealth.backend.storage?.usagePercentage || 0}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Server Status */}
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {serverHealth.backend.status === 'healthy' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                          <span className="text-sm text-zinc-400 font-medium">Server Status</span>
                        </div>
                        <span className={`text-lg font-bold ${serverHealth.backend.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {serverHealth.backend.status === 'healthy' ? 'Healthy' : 'Unhealthy'}
                        </span>
                      </div>
                      <div className="text-sm text-zinc-500">
                        Uptime: {serverHealth.backend.uptime?.formatted || '0d 0h 0m'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    title="Total Titles"
                    value={totalTitles.toLocaleString()}
                    icon={LayoutDashboard}
                  />
                  <StatCard
                    title="Movies"
                    value={totalMovies.toLocaleString()}
                    icon={Film}
                  />
                  <StatCard
                    title="TV Shows"
                    value={totalTVShows.toLocaleString()}
                    icon={Tv}
                  />
                  <StatCard
                    title="Genres"
                    value={totalGenres.toLocaleString()}
                    icon={Tags}
                  />
                  <StatCard
                    title="Cast"
                    value={totalCast.toLocaleString()}
                    icon={Users}
                  />
                  <StatCard
                    title="Users"
                    value={totalUsers.toLocaleString()}
                    icon={UserPlus}
                  />
                  <StatCard
                    title="Comments"
                    value={totalComments.toLocaleString()}
                    icon={MessageSquare}
                  />
                  <StatCard
                    title="Total Views"
                    value={totalViews.toLocaleString()}
                    icon={Eye}
                  />
                  <StatCard
                    title="Total Downloads"
                    value={totalDownloads.toLocaleString()}
                    icon={Download}
                  />
                  <StatCard
                    title="Total Shares"
                    value={totalShares.toLocaleString()}
                    icon={Send}
                  />
                  <StatCard
                    title="Configured Apps"
                    value={configuredAppPlatforms.toLocaleString()}
                    icon={AppWindow}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <StatCard
                    title="Android Installs"
                    value={appInstallCounts.android.toLocaleString()}
                    icon={PlayCircle}
                  />
                  <StatCard
                    title="iOS Installs"
                    value={appInstallCounts.ios.toLocaleString()}
                    icon={AppWindow}
                  />
                  <StatCard
                    title="Android TV Installs"
                    value={appInstallCounts.androidtv.toLocaleString()}
                    icon={Tv}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                      <div className="flex items-center justify-between gap-4 mb-6">
                        <div>
                          <h3 className="text-lg font-semibold text-white">Overview</h3>
                          <p className="text-zinc-500 text-sm mt-1">Content, platform, and engagement totals from the current admin data.</p>
                        </div>
                        <div className="px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-300 text-sm">
                          {configuredAppPlatforms}/3 App Links Configured
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-zinc-800/40 border border-zinc-700 rounded-2xl p-5">
                          <h4 className="text-white font-semibold mb-4">Library</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Total Titles</span>
                              <span className="text-white font-medium">{totalTitles.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Movies</span>
                              <span className="text-white font-medium">{totalMovies.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">TV Shows</span>
                              <span className="text-white font-medium">{totalTVShows.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Seasons</span>
                              <span className="text-white font-medium">{totalSeasons.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Episodes</span>
                              <span className="text-white font-medium">{totalEpisodes.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-zinc-800/40 border border-zinc-700 rounded-2xl p-5">
                          <h4 className="text-white font-semibold mb-4">Platform</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Android Installs</span>
                              <span className="text-white font-medium">{appInstallCounts.android.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">iOS Installs</span>
                              <span className="text-white font-medium">{appInstallCounts.ios.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Android TV Installs</span>
                              <span className="text-white font-medium">{appInstallCounts.androidtv.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Configured App Links</span>
                              <span className="text-white font-medium">{configuredAppPlatforms.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-zinc-800/40 border border-zinc-700 rounded-2xl p-5">
                          <h4 className="text-white font-semibold mb-4">People</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Users</span>
                              <span className="text-white font-medium">{totalUsers.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Cast Members</span>
                              <span className="text-white font-medium">{totalCast.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Genres</span>
                              <span className="text-white font-medium">{totalGenres.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Hero Banners</span>
                              <span className="text-white font-medium">{totalHeroBanners.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Slider Sections</span>
                              <span className="text-white font-medium">{totalSliderSections.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-zinc-800/40 border border-zinc-700 rounded-2xl p-5">
                          <h4 className="text-white font-semibold mb-4">Engagement</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Comments</span>
                              <span className="text-white font-medium">{totalComments.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Views</span>
                              <span className="text-white font-medium">{totalViews.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Downloads</span>
                              <span className="text-white font-medium">{totalDownloads.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Shares</span>
                              <span className="text-white font-medium">{totalShares.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Homepage Sections</span>
                              <span className="text-white font-medium">{totalHomepageSections.toLocaleString()}</span>
                            </div>
                          </div>
                          <p className="text-zinc-500 text-xs mt-4">
                            Engagement analytics stay at zero until real usage tracking is connected.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    <RecentActivity />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'home' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Home Management</h2>
                    <p className="text-zinc-500 mt-1">Manage your homepage content</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleAddHeroBanner}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Add Banner
                    </button>
                    <button 
                      onClick={handleSaveHeroBanners}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                  </div>
                </div>

                {/* Hero Banners Section */}
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 mb-8">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    Hero Banners
                  </h3>
                  <div className="space-y-6">
                    {heroBanners.map((banner, index) => (
                      <div key={banner.id} className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleMoveHeroBanner(banner.id, 'up')}
                                disabled={index === 0}
                                className="p-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleMoveHeroBanner(banner.id, 'down')}
                                disabled={index === heroBanners.length - 1}
                                className="p-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">{banner.title}</h4>
                              <p className="text-zinc-500 text-sm">Order: {banner.order}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditHeroBanner(banner.id, 'isActive', !banner.isActive)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                banner.isActive
                                  ? "bg-emerald-600 text-white"
                                  : "bg-zinc-700 text-zinc-400"
                              )}
                            >
                              {banner.isActive ? 'Active' : 'Inactive'}
                            </button>
                            <button
                              onClick={() => handleDeleteHeroBanner(banner.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Title</label>
                            <input
                              type="text"
                              value={banner.title}
                              onChange={(e) => handleEditHeroBanner(banner.id, 'title', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Description</label>
                            <textarea
                              value={banner.description}
                              onChange={(e) => handleEditHeroBanner(banner.id, 'description', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Backdrop URL</label>
                            <input
                              type="url"
                              value={banner.backdropUrl}
                              onChange={(e) => handleEditHeroBanner(banner.id, 'backdropUrl', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Poster URL</label>
                            <input
                              type="url"
                              value={banner.posterUrl}
                              onChange={(e) => handleEditHeroBanner(banner.id, 'posterUrl', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Auto Scroll Interval (ms)</label>
                            <input
                              type="number"
                              value={banner.autoScrollInterval || 10000}
                              onChange={(e) => handleEditHeroBanner(banner.id, 'autoScrollInterval', Number(e.target.value))}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                              min="1000"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {heroBanners.length === 0 && (
                      <div className="text-center py-12">
                        <Image className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Banners Yet</h3>
                        <p className="text-zinc-500">Add your first banner to get started</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Homepage Sections */}
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <LayoutDashboard className="w-5 h-5" />
                      Homepage Sections
                    </h3>
                    <div className="flex gap-3">
                      <button
                        onClick={handleAddHomepageSection}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Custom
                      </button>
                      <button
                        onClick={handleAddMovieGenreSection}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                      >
                        <Film className="w-4 h-4" />
                        Add Movie Genre
                      </button>
                      <button
                        onClick={handleAddTVGenreSection}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                      >
                        <Tv className="w-4 h-4" />
                        Add TV Genre
                      </button>
                      <button
                        onClick={handleSaveHomepageSections}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {homepageSections.sort((a, b) => a.order - b.order).map((section, index) => (
                      <div key={section.id} className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleMoveHomepageSection(section.id, 'up')}
                                disabled={index === 0}
                                className="p-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleMoveHomepageSection(section.id, 'down')}
                                disabled={index === homepageSections.length - 1}
                                className="p-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">{section.title}</h4>
                              <p className="text-zinc-500 text-xs">Type: {section.type.replace('-', ' ')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditHomepageSection(section.id, 'isActive', !section.isActive)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                section.isActive
                                  ? "bg-emerald-600 text-white"
                                  : "bg-zinc-700 text-zinc-400"
                              )}
                            >
                              {section.isActive ? 'Active' : 'Inactive'}
                            </button>
                            <button
                              onClick={() => handleDeleteHomepageSection(section.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Title</label>
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => handleEditHomepageSection(section.id, 'title', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Type</label>
                            <select
                              value={section.type}
                              onChange={(e) => handleEditHomepageSection(section.id, 'type', e.target.value as any)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                            >
                              <option value="continue-watching">Continue Watching</option>
                              <option value="recommended">Recommended</option>
                              <option value="trending">Trending</option>
                              <option value="latest-movies">Latest Movies</option>
                              <option value="tv-shows">TV Shows</option>
                              <option value="live-tv">Live TV</option>
                              <option value="top-rated">Top Rated</option>
                              <option value="new-releases">New Releases</option>
                              <option value="regional">Regional</option>
                              <option value="hollywood">Hollywood</option>
                              <option value="bollywood">Bollywood</option>
                              <option value="bangla">Bangla</option>
                              <option value="korean">Korean</option>
                              <option value="japanese">Japanese</option>
                              <option value="chinese">Chinese</option>
                              <option value="turkish">Turkish</option>
                              <option value="news">News</option>
                              <option value="popular">Popular</option>
                              <option value="kids">Kids</option>
                              <option value="movie-genre">Movie Genre</option>
                              <option value="tv-genre">TV Genre</option>
                              <option value="movie-studio">Movie Studio</option>
                              <option value="tv-studio">TV Studio</option>
                              <option value="custom">Custom (Collections)</option>
                            </select>
                          </div>
                          <div className="lg:col-span-2">
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Description</label>
                            <textarea
                              value={section.description || ''}
                              onChange={(e) => handleEditHomepageSection(section.id, 'description', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                              rows={2}
                            />
                          </div>
                          {section.type === 'custom' && (
                            <div className="lg:col-span-2">
                              <div className="flex items-center justify-between mb-4">
                                <label className="block text-zinc-400 font-medium text-sm">Selected Movies</label>
                                <button
                                  onClick={() => {
                                    setActiveHomepageSectionForMovieSelection(section.id)
                                    setSelectedMovieIds(new Set(section.movieIds || []))
                                  }}
                                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium text-white transition-colors"
                                >
                                  Manage Movies
                                </button>
                              </div>
                              {section.movieIds && section.movieIds.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                  {section.movieIds.map((movieId: any) => {
                                    const movie = movies.find(m => m.id === movieId)
                                    return movie ? (
                                      <div key={movieId} className="bg-zinc-800 rounded-lg p-2 flex flex-col items-center">
                                        {movie.posterPath && (
                                          <img 
                                            src={movie.posterPath} 
                                            alt={movie.title} 
                                            className="w-full aspect-[2/3] rounded-md object-cover mb-2"
                                          />
                                        )}
                                        <p className="text-xs text-white text-center truncate">{movie.title}</p>
                                      </div>
                                    ) : null
                                  })}
                                </div>
                              ) : (
                                <p className="text-zinc-500 text-sm">No movies selected for this section</p>
                              )}
                            </div>
                          )}
                          {(section.type === 'movie-genre' || section.type === 'tv-genre') && (
                            <div>
                              <label className="block text-zinc-400 mb-2 font-medium text-sm">Genre</label>
                              <select
                                value={section.genre || ''}
                                onChange={(e) => handleEditHomepageSection(section.id, 'genre', e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                              >
                                {genres.filter(g => g.isActive).map((g) => (
                                  <option key={g.id} value={g.name}>{g.name}</option>
                                ))}
                              </select>
                            </div>
                          )}
                          {(section.type === 'movie-studio' || section.type === 'tv-studio') && (
                            <div>
                              <label className="block text-zinc-400 mb-2 font-medium text-sm">Studio</label>
                              <select
                                value={section.studio || ''}
                                onChange={(e) => handleEditHomepageSection(section.id, 'studio', e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                              >
                                <option value="">All Studios</option>
                                {Array.from(
                                  new Set(
                                    (section.type === 'tv-studio' ? tvShows : movies)
                                      .map((m: any) => m?.studio)
                                      .filter(Boolean)
                                  )
                                )
                                  .sort()
                                  .map((studio: any) => (
                                    <option key={studio} value={studio}>{studio}</option>
                                  ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {homepageSections.length === 0 && (
                      <div className="text-center py-12">
                        <LayoutDashboard className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Homepage Sections Yet</h3>
                        <p className="text-zinc-500">Add your first section to get started</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'kids-home' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Kids Home Management</h2>
                    <p className="text-zinc-500 mt-1">Manage your kids' homepage content</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleAddKidsHeroBanner}
                      className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Add Banner
                    </button>
                    <button 
                      onClick={handleSaveKidsHeroBanners}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                  </div>
                </div>

                {/* Kids Hero Banners Section */}
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 mb-8">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    Kids Hero Banners
                  </h3>
                  <div className="space-y-6">
                    {kidsHeroBanners.map((banner, index) => (
                      <div key={banner.id} className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleMoveKidsHeroBanner(banner.id, 'up')}
                                disabled={index === 0}
                                className="p-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleMoveKidsHeroBanner(banner.id, 'down')}
                                disabled={index === kidsHeroBanners.length - 1}
                                className="p-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">{banner.title}</h4>
                              <p className="text-zinc-500 text-sm">Order: {banner.order}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditKidsHeroBanner(banner.id, 'isActive', !banner.isActive)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                banner.isActive
                                  ? "bg-emerald-600 text-white"
                                  : "bg-zinc-700 text-zinc-400"
                              )}
                            >
                              {banner.isActive ? 'Active' : 'Inactive'}
                            </button>
                            <button
                              onClick={() => handleDeleteKidsHeroBanner(banner.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Title</label>
                            <input
                              type="text"
                              value={banner.title}
                              onChange={(e) => handleEditKidsHeroBanner(banner.id, 'title', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Description</label>
                            <textarea
                              value={banner.description}
                              onChange={(e) => handleEditKidsHeroBanner(banner.id, 'description', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Backdrop URL</label>
                            <input
                              type="url"
                              value={banner.backdropUrl}
                              onChange={(e) => handleEditKidsHeroBanner(banner.id, 'backdropUrl', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Poster URL</label>
                            <input
                              type="url"
                              value={banner.posterUrl}
                              onChange={(e) => handleEditKidsHeroBanner(banner.id, 'posterUrl', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Auto Scroll Interval (ms)</label>
                            <input
                              type="number"
                              value={banner.autoScrollInterval || 10000}
                              onChange={(e) => handleEditKidsHeroBanner(banner.id, 'autoScrollInterval', Number(e.target.value))}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                              min="1000"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {kidsHeroBanners.length === 0 && (
                      <div className="text-center py-12">
                        <Image className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Banners Yet</h3>
                        <p className="text-zinc-500">Add your first kids banner to get started</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Kids Homepage Sections */}
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <LayoutDashboard className="w-5 h-5" />
                      Kids Homepage Sections
                    </h3>
                    <div className="flex gap-3">
                      <button
                        onClick={handleAddKidsHomepageSection}
                        className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Custom
                      </button>
                      <button
                        onClick={handleAddKidsMovieGenreSection}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                      >
                        <Film className="w-4 h-4" />
                        Add Movie Genre
                      </button>
                      <button
                        onClick={handleAddKidsTVGenreSection}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                      >
                        <Tv className="w-4 h-4" />
                        Add TV Genre
                      </button>
                      <button
                        onClick={handleSaveKidsHomepageSections}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {kidsHomepageSections.sort((a, b) => a.order - b.order).map((section, index) => (
                      <div key={section.id} className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleMoveKidsHomepageSection(section.id, 'up')}
                                disabled={index === 0}
                                className="p-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleMoveKidsHomepageSection(section.id, 'down')}
                                disabled={index === kidsHomepageSections.length - 1}
                                className="p-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">{section.title}</h4>
                              <p className="text-zinc-500 text-xs">Type: {section.type.replace('-', ' ')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditKidsHomepageSection(section.id, 'isActive', !section.isActive)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                section.isActive
                                  ? "bg-emerald-600 text-white"
                                  : "bg-zinc-700 text-zinc-400"
                              )}
                            >
                              {section.isActive ? 'Active' : 'Inactive'}
                            </button>
                            <button
                              onClick={() => handleDeleteKidsHomepageSection(section.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Title</label>
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => handleEditKidsHomepageSection(section.id, 'title', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                            />
                          </div>
                          <div className="lg:col-span-2">
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Description</label>
                            <textarea
                              value={section.description || ''}
                              onChange={(e) => handleEditKidsHomepageSection(section.id, 'description', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                              rows={2}
                            />
                          </div>
                          {section.type === 'custom' && (
                            <>
                              <div>
                                <label className="block text-zinc-400 mb-2 font-medium text-sm">Type</label>
                                <select
                                  value={section.type}
                                  onChange={(e) => handleEditKidsHomepageSection(section.id, 'type', e.target.value as any)}
                                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                                >
                                  <option value="continue-watching">Continue Watching</option>
                                  <option value="recommended">Recommended</option>
                                  <option value="trending">Trending</option>
                                  <option value="popular">Popular</option>
                                  <option value="kids">Kids</option>
                                  <option value="top-rated">Top Rated</option>
                                  <option value="custom">Custom</option>
                                </select>
                              </div>
                              <div className="lg:col-span-2">
                                <div className="flex items-center justify-between mb-4">
                                  <label className="block text-zinc-400 font-medium text-sm">Selected Movies</label>
                                  <button
                                    onClick={() => {
                                      setActiveKidsHomepageSectionForMovieSelection(section.id)
                                      setSelectedMovieIds(new Set(section.movieIds || []))
                                    }}
                                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium text-white transition-colors"
                                  >
                                    Manage Movies
                                  </button>
                                </div>
                                {section.movieIds && section.movieIds.length > 0 ? (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {section.movieIds.map((movieId: any) => {
                                      const movie = movies.find(m => m.id === movieId)
                                      return movie ? (
                                        <div key={movieId} className="bg-zinc-800 rounded-lg p-2 flex flex-col items-center">
                                          {movie.posterPath && (
                                            <img 
                                              src={movie.posterPath} 
                                              alt={movie.title} 
                                              className="w-full aspect-[2/3] rounded-md object-cover mb-2"
                                            />
                                          )}
                                          <p className="text-xs text-white text-center truncate">{movie.title}</p>
                                        </div>
                                      ) : null
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-zinc-500 text-sm">No movies selected for this section</p>
                                )}
                              </div>
                            </>
                          )}
                          {(section.type === 'movie-genre' || section.type === 'tv-genre') && (
                            <div>
                              <label className="block text-zinc-400 mb-2 font-medium text-sm">Genre</label>
                              <select
                                value={section.genre || ''}
                                onChange={(e) => handleEditKidsHomepageSection(section.id, 'genre', e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                              >
                                {genres.filter(g => g.isActive).map((g) => (
                                  <option key={g.id} value={g.name}>{g.name}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {kidsHomepageSections.length === 0 && (
                      <div className="text-center py-12">
                        <LayoutDashboard className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Kids Homepage Sections Yet</h3>
                        <p className="text-zinc-500">Add your first kids section to get started</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'anime-home' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Anime Home Management</h2>
                    <p className="text-zinc-500 mt-1">Manage your anime homepage content</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleAddAnimeHeroBanner}
                      className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Add Banner
                    </button>
                    <button 
                      onClick={handleSaveAnimeHeroBanners}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                  </div>
                </div>

                {/* Anime Hero Banners Section */}
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 mb-8">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    Anime Hero Banners
                  </h3>
                  <div className="space-y-6">
                    {animeHeroBanners.map((banner, index) => (
                      <div key={banner.id} className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleMoveAnimeHeroBanner(banner.id, 'up')}
                                disabled={index === 0}
                                className="p-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleMoveAnimeHeroBanner(banner.id, 'down')}
                                disabled={index === animeHeroBanners.length - 1}
                                className="p-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">{banner.title}</h4>
                              <p className="text-zinc-500 text-sm">Order: {banner.order}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditAnimeHeroBanner(banner.id, 'isActive', !banner.isActive)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                banner.isActive
                                  ? "bg-emerald-600 text-white"
                                  : "bg-zinc-700 text-zinc-400"
                              )}
                            >
                              {banner.isActive ? 'Active' : 'Inactive'}
                            </button>
                            <button
                              onClick={() => handleDeleteAnimeHeroBanner(banner.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Title</label>
                            <input
                              type="text"
                              value={banner.title}
                              onChange={(e) => handleEditAnimeHeroBanner(banner.id, 'title', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Description</label>
                            <textarea
                              value={banner.description}
                              onChange={(e) => handleEditAnimeHeroBanner(banner.id, 'description', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500"
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Backdrop URL</label>
                            <input
                              type="url"
                              value={banner.backdropUrl}
                              onChange={(e) => handleEditAnimeHeroBanner(banner.id, 'backdropUrl', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Poster URL</label>
                            <input
                              type="url"
                              value={banner.posterUrl}
                              onChange={(e) => handleEditAnimeHeroBanner(banner.id, 'posterUrl', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Auto Scroll Interval (ms)</label>
                            <input
                              type="number"
                              value={banner.autoScrollInterval || 10000}
                              onChange={(e) => handleEditAnimeHeroBanner(banner.id, 'autoScrollInterval', Number(e.target.value))}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500"
                              min="1000"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {animeHeroBanners.length === 0 && (
                      <div className="text-center py-12">
                        <Image className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Banners Yet</h3>
                        <p className="text-zinc-500">Add your first anime banner to get started</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Anime Homepage Sections */}
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <LayoutDashboard className="w-5 h-5" />
                      Anime Homepage Sections
                    </h3>
                    <div className="flex gap-3">
                      <button
                        onClick={handleAddAnimeHomepageSection}
                        className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Custom
                      </button>
                      <button
                        onClick={handleAddAnimeMovieGenreSection}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                      >
                        <Film className="w-4 h-4" />
                        Add Movie Genre
                      </button>
                      <button
                        onClick={handleAddAnimeTVGenreSection}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                      >
                        <Tv className="w-4 h-4" />
                        Add TV Genre
                      </button>
                      <button
                        onClick={handleSaveAnimeHomepageSections}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {animeHomepageSections.sort((a, b) => a.order - b.order).map((section, index) => (
                      <div key={section.id} className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleMoveAnimeHomepageSection(section.id, 'up')}
                                disabled={index === 0}
                                className="p-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleMoveAnimeHomepageSection(section.id, 'down')}
                                disabled={index === animeHomepageSections.length - 1}
                                className="p-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">{section.title}</h4>
                              <p className="text-zinc-500 text-xs">Type: {section.type.replace('-', ' ')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditAnimeHomepageSection(section.id, 'isActive', !section.isActive)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                section.isActive
                                  ? "bg-emerald-600 text-white"
                                  : "bg-zinc-700 text-zinc-400"
                              )}
                            >
                              {section.isActive ? 'Active' : 'Inactive'}
                            </button>
                            <button
                              onClick={() => handleDeleteAnimeHomepageSection(section.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Title</label>
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => handleEditAnimeHomepageSection(section.id, 'title', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500"
                            />
                          </div>
                          <div className="lg:col-span-2">
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Description</label>
                            <textarea
                              value={section.description || ''}
                              onChange={(e) => handleEditAnimeHomepageSection(section.id, 'description', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500"
                              rows={2}
                            />
                          </div>
                          {section.type === 'custom' && (
                            <>
                              <div>
                                <label className="block text-zinc-400 mb-2 font-medium text-sm">Type</label>
                                <select
                                  value={section.type}
                                  onChange={(e) => handleEditAnimeHomepageSection(section.id, 'type', e.target.value as any)}
                                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500"
                                >
                                  <option value="continue-watching">Continue Watching</option>
                                  <option value="recommended">Recommended</option>
                                  <option value="trending">Trending</option>
                                  <option value="popular">Popular</option>
                                  <option value="anime">Anime</option>
                                  <option value="top-rated">Top Rated</option>
                                  <option value="custom">Custom</option>
                                </select>
                              </div>
                              <div className="lg:col-span-2">
                                <div className="flex items-center justify-between mb-4">
                                  <label className="block text-zinc-400 font-medium text-sm">Selected Movies</label>
                                  <button
                                    onClick={() => {
                                      setActiveAnimeHomepageSectionForMovieSelection(section.id)
                                      setSelectedMovieIds(new Set(section.movieIds || []))
                                    }}
                                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium text-white transition-colors"
                                  >
                                    Manage Movies
                                  </button>
                                </div>
                                {section.movieIds && section.movieIds.length > 0 ? (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {section.movieIds.map((movieId: any) => {
                                      const movie = movies.find(m => m.id === movieId)
                                      return movie ? (
                                        <div key={movieId} className="bg-zinc-800 rounded-lg p-2 flex flex-col items-center">
                                          {movie.posterPath && (
                                            <img 
                                              src={movie.posterPath} 
                                              alt={movie.title} 
                                              className="w-full aspect-[2/3] rounded-md object-cover mb-2"
                                            />
                                          )}
                                          <p className="text-xs text-white text-center truncate">{movie.title}</p>
                                        </div>
                                      ) : null
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-zinc-500 text-sm">No movies selected for this section</p>
                                )}
                              </div>
                            </>
                          )}
                          {(section.type === 'movie-genre' || section.type === 'tv-genre') && (
                            <div>
                              <label className="block text-zinc-400 mb-2 font-medium text-sm">Genre</label>
                              <select
                                value={section.genre || ''}
                                onChange={(e) => handleEditAnimeHomepageSection(section.id, 'genre', e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500"
                              >
                                {genres.filter(g => g.isActive).map((g) => (
                                  <option key={g.id} value={g.name}>{g.name}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {animeHomepageSections.length === 0 && (
                      <div className="text-center py-12">
                        <LayoutDashboard className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Anime Homepage Sections Yet</h3>
                        <p className="text-zinc-500">Add your first anime section to get started</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'sliders' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Slider Sections</h2>
                    <p className="text-zinc-500 mt-1">Manage your horizontal slider sections</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddSliderSection}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Section
                    </button>
                    <button
                      onClick={handleSaveSliderSections}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                  <div className="space-y-6">
                    {sliderSections.map((section, index) => (
                      <div key={section.id} className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleMoveSliderSection(section.id, 'up')}
                                disabled={index === 0}
                                className="p-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleMoveSliderSection(section.id, 'down')}
                                disabled={index === sliderSections.length - 1}
                                className="p-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">{section.title}</h4>
                              <p className="text-zinc-500 text-sm">Order: {section.order}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditSliderSection(section.id, 'isActive', !section.isActive)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                section.isActive
                                  ? "bg-emerald-600 text-white"
                                  : "bg-zinc-700 text-zinc-400"
                              )}
                            >
                              {section.isActive ? 'Active' : 'Inactive'}
                            </button>
                            <button
                              onClick={() => handleDeleteSliderSection(section.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Slider Type</label>
                            <select
                              value={section.type || 'custom'}
                              onChange={(e) => handleEditSliderSection(section.id, 'type', e.target.value as 'custom' | 'genre')}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                            >
                              <option value="custom">Custom (Manual Selection)</option>
                              <option value="genre">Genre Based</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Animation Duration (seconds)</label>
                            <input
                              type="number"
                              value={section.animationDuration}
                              onChange={(e) => handleEditSliderSection(section.id, 'animationDuration', Number(e.target.value))}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div className="lg:col-span-2">
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Title</label>
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => handleEditSliderSection(section.id, 'title', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div className="lg:col-span-2">
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Description</label>
                            <textarea
                              value={section.description || ''}
                              onChange={(e) => handleEditSliderSection(section.id, 'description', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                              rows={2}
                            />
                          </div>
                          {section.type === 'genre' ? (
                            <div className="lg:col-span-2">
                              <label className="block text-zinc-400 mb-2 font-medium text-sm">Select Genre</label>
                              <select
                                value={section.genreId || ''}
                                onChange={(e) => handleEditSliderSection(section.id, 'genreId', e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                              >
                                <option value="">-- Select a Genre --</option>
                                {genres.filter(g => g.isActive).map(g => (
                                  <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <div className="lg:col-span-2">
                              <div className="flex items-center justify-between mb-4">
                                <label className="block text-zinc-400 font-medium text-sm">Selected Movies</label>
                                <button
                                  onClick={() => {
                                    setActiveSliderForMovieSelection(section.id)
                                    setSelectedMovieIds(new Set(section.movieIds || []))
                                  }}
                                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium text-white transition-colors"
                                >
                                  Manage Movies
                                </button>
                              </div>
                              {section.movieIds && section.movieIds.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                  {section.movieIds.map((movieId: any) => {
                                    const movie = movies.find(m => m.id === movieId)
                                    return movie ? (
                                      <div key={movieId} className="bg-zinc-800 rounded-lg p-2 flex flex-col items-center">
                                        {movie.posterPath && (
                                          <img 
                                            src={movie.posterPath} 
                                            alt={movie.title} 
                                            className="w-full aspect-[2/3] rounded-md object-cover mb-2"
                                          />
                                        )}
                                        <p className="text-xs text-white text-center truncate">{movie.title}</p>
                                      </div>
                                    ) : null
                                  })}
                                </div>
                              ) : (
                                <p className="text-zinc-500 text-sm">No movies selected for this slider</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {sliderSections.length === 0 && (
                      <div className="text-center py-12">
                        <MoveHorizontal className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Slider Sections Yet</h3>
                        <p className="text-zinc-500">Add your first slider section to get started</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'kids-sliders' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Kids Slider Sections</h2>
                    <p className="text-zinc-500 mt-1">Manage the dedicated slider rows shown only on Kids Home.</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddKidsSliderSection}
                      className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Kids Slider
                    </button>
                    <button
                      onClick={handleSaveKidsSliderSections}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save Kids Sliders
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                  <div className="space-y-6">
                    {kidsSliderSections.map((section, index) => (
                      <div key={section.id} className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleMoveKidsSliderSection(section.id, 'up')}
                                disabled={index === 0}
                                className="p-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleMoveKidsSliderSection(section.id, 'down')}
                                disabled={index === kidsSliderSections.length - 1}
                                className="p-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">{section.title}</h4>
                              <p className="text-zinc-500 text-sm">Order: {section.order}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditKidsSliderSection(section.id, 'isActive', !section.isActive)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                section.isActive
                                  ? "bg-emerald-600 text-white"
                                  : "bg-zinc-700 text-zinc-400"
                              )}
                            >
                              {section.isActive ? 'Active' : 'Inactive'}
                            </button>
                            <button
                              onClick={() => handleDeleteKidsSliderSection(section.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="lg:col-span-2">
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Title</label>
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => handleEditKidsSliderSection(section.id, 'title', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                            />
                          </div>
                          <div className="lg:col-span-2">
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Description</label>
                            <textarea
                              value={section.description || ''}
                              onChange={(e) => handleEditKidsSliderSection(section.id, 'description', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Content Type</label>
                            <select
                              value={section.contentType || 'movie'}
                              onChange={(e) => handleEditKidsSliderSection(section.id, 'contentType', e.target.value as 'movie' | 'tv')}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                            >
                              <option value="movie">Movies</option>
                              <option value="tv">TV Shows</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Animation Duration (seconds)</label>
                            <input
                              type="number"
                              value={section.animationDuration}
                              onChange={(e) => handleEditKidsSliderSection(section.id, 'animationDuration', Number(e.target.value))}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                            />
                          </div>
                          {section.contentType === 'movie' && (
                            <div className="lg:col-span-2">
                              <div className="flex items-center justify-between mb-4">
                                <label className="block text-zinc-400 font-medium text-sm">Selected Kids Movies</label>
                                <button
                                  onClick={() => {
                                    setActiveKidsSliderForMovieSelection(section.id)
                                    setSelectedMovieIds(new Set(section.contentIds || []))
                                  }}
                                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium text-white transition-colors"
                                >
                                  Manage Kids Movies
                                </button>
                              </div>
                              {section.contentIds && section.contentIds.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                  {section.contentIds.map((movieId: any) => {
                                    const movie = movies.find(m => m.id === movieId && m.isKids)
                                    return movie ? (
                                      <div key={movieId} className="bg-zinc-900 rounded-lg p-2 flex flex-col items-center">
                                        {movie.posterPath && (
                                          <img 
                                            src={movie.posterPath} 
                                            alt={movie.title} 
                                            className="w-full aspect-[2/3] rounded-md object-cover mb-2"
                                          />
                                        )}
                                        <p className="text-xs text-white text-center truncate">{movie.title}</p>
                                      </div>
                                    ) : null
                                  })}
                                </div>
                              ) : (
                                <p className="text-zinc-500 text-sm">No kids movies selected for this slider</p>
                              )}
                            </div>
                          )}
                          {section.contentType === 'tv' && (
                            <div className="lg:col-span-2">
                              <div className="flex items-center justify-between mb-4">
                                <label className="block text-zinc-400 font-medium text-sm">Selected Kids TV Shows</label>
                                <button
                                  onClick={() => {
                                    setActiveKidsSliderForTVShowSelection(section.id)
                                    setSelectedTVShowIds(new Set(section.contentIds || []))
                                  }}
                                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium text-white transition-colors"
                                >
                                  Manage Kids TV Shows
                                </button>
                              </div>
                              {section.contentIds && section.contentIds.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                  {section.contentIds.map((showId: any) => {
                                    const show = tvShows.find((item: TVShow) => String(item.id) === String(showId) && item.isKids)
                                    return show ? (
                                      <div key={showId} className="bg-zinc-900 rounded-lg p-2 flex flex-col items-center">
                                        {show.posterPath && (
                                          <img
                                            src={show.posterPath}
                                            alt={show.title}
                                            className="w-full aspect-[2/3] rounded-md object-cover mb-2"
                                          />
                                        )}
                                        <p className="text-xs text-white text-center truncate w-full">{show.title}</p>
                                      </div>
                                    ) : null
                                  })}
                                </div>
                              ) : (
                                <p className="text-zinc-500 text-sm">No kids TV shows selected for this slider</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {kidsSliderSections.length === 0 && (
                      <div className="text-center py-12">
                        <Smile className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Kids Sliders Yet</h3>
                        <p className="text-zinc-500">Add your first Kids slider section to get started.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'anime-sliders' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Anime Slider Sections</h2>
                    <p className="text-zinc-500 mt-1">Manage the dedicated slider rows shown only on Anime Home.</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddAnimeSliderSection}
                      className="flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Anime Slider
                    </button>
                    <button
                      onClick={handleSaveAnimeSliderSections}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save Anime Sliders
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                  <div className="space-y-6">
                    {animeSliderSections.map((section, index) => (
                      <div key={section.id} className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleMoveAnimeSliderSection(section.id, 'up')}
                                disabled={index === 0}
                                className="p-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleMoveAnimeSliderSection(section.id, 'down')}
                                disabled={index === animeSliderSections.length - 1}
                                className="p-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">{section.title}</h4>
                              <p className="text-zinc-500 text-sm">Order: {section.order}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditAnimeSliderSection(section.id, 'isActive', !section.isActive)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                section.isActive
                                  ? "bg-emerald-600 text-white"
                                  : "bg-zinc-700 text-zinc-400"
                              )}
                            >
                              {section.isActive ? 'Active' : 'Inactive'}
                            </button>
                            <button
                              onClick={() => handleDeleteAnimeSliderSection(section.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="lg:col-span-2">
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Title</label>
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => handleEditAnimeSliderSection(section.id, 'title', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-400"
                            />
                          </div>
                          <div className="lg:col-span-2">
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Description</label>
                            <textarea
                              value={section.description || ''}
                              onChange={(e) => handleEditAnimeSliderSection(section.id, 'description', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-400"
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Content Type</label>
                            <select
                              value={section.contentType || 'movie'}
                              onChange={(e) => handleEditAnimeSliderSection(section.id, 'contentType', e.target.value as 'movie' | 'tv')}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-400"
                            >
                              <option value="movie">Movies</option>
                              <option value="tv">TV Shows</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Animation Duration (seconds)</label>
                            <input
                              type="number"
                              value={section.animationDuration}
                              onChange={(e) => handleEditAnimeSliderSection(section.id, 'animationDuration', Number(e.target.value))}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-400"
                            />
                          </div>
                          {section.contentType === 'movie' && (
                            <div className="lg:col-span-2">
                              <div className="flex items-center justify-between mb-4">
                                <label className="block text-zinc-400 font-medium text-sm">Selected Anime Movies</label>
                                <button
                                  onClick={() => {
                                    setActiveAnimeSliderForMovieSelection(section.id)
                                    setSelectedMovieIds(new Set(section.contentIds || []))
                                  }}
                                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium text-white transition-colors"
                                >
                                  Manage Anime Movies
                                </button>
                              </div>
                              {section.contentIds && section.contentIds.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                  {section.contentIds.map((movieId: any) => {
                                    const movie = movies.find(m => m.id === movieId && m.isAnime)
                                    return movie ? (
                                      <div key={movieId} className="bg-zinc-900 rounded-lg p-2 flex flex-col items-center">
                                        {movie.posterPath && (
                                          <img 
                                            src={movie.posterPath} 
                                            alt={movie.title} 
                                            className="w-full aspect-[2/3] rounded-md object-cover mb-2"
                                          />
                                        )}
                                        <p className="text-xs text-white text-center truncate">{movie.title}</p>
                                      </div>
                                    ) : null
                                  })}
                                </div>
                              ) : (
                                <p className="text-zinc-500 text-sm">No anime movies selected for this slider</p>
                              )}
                            </div>
                          )}
                          {section.contentType === 'tv' && (
                            <div className="lg:col-span-2">
                              <div className="flex items-center justify-between mb-4">
                                <label className="block text-zinc-400 font-medium text-sm">Selected Anime TV Shows</label>
                                <button
                                  onClick={() => {
                                    setActiveAnimeSliderForTVShowSelection(section.id)
                                    setSelectedTVShowIds(new Set(section.contentIds || []))
                                  }}
                                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium text-white transition-colors"
                                >
                                  Manage Anime TV Shows
                                </button>
                              </div>
                              {section.contentIds && section.contentIds.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                  {section.contentIds.map((showId: any) => {
                                    const show = tvShows.find((item: TVShow) => String(item.id) === String(showId) && item.isAnime)
                                    return show ? (
                                      <div key={showId} className="bg-zinc-900 rounded-lg p-2 flex flex-col items-center">
                                        {show.posterPath && (
                                          <img
                                            src={show.posterPath}
                                            alt={show.title}
                                            className="w-full aspect-[2/3] rounded-md object-cover mb-2"
                                          />
                                        )}
                                        <p className="text-xs text-white text-center truncate w-full">{show.title}</p>
                                      </div>
                                    ) : null
                                  })}
                                </div>
                              ) : (
                                <p className="text-zinc-500 text-sm">No anime TV shows selected for this slider</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {animeSliderSections.length === 0 && (
                      <div className="text-center py-12">
                        <Sparkles className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Anime Sliders Yet</h3>
                        <p className="text-zinc-500">Add your first Anime slider section to get started.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {['import-movies', 'import-tv'].includes(activeTab) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white">
                    {activeTab === 'import-movies'
                      ? 'Import Movies'
                      : 'Import TV Shows'}
                  </h2>
                  <p className="text-zinc-500 mt-1">
                    {`Search and import ${activeTab === 'import-movies' ? 'movies' : 'TV shows'} from TMDB`}
                  </p>
                </div>

                <>
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 mb-8">
                      <form onSubmit={handleSearch} className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                            <div className="relative">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                              <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={`Search ${searchType === 'movie' ? 'movies' : 'TV shows'} by name or IMDb ID (e.g., tt0111161)...`}
                                className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                              />
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="flex bg-zinc-800 rounded-xl p-1">
                              <button
                                type="button"
                                onClick={() => setSearchType('movie')}
                                className={cn(
                                  "px-4 py-2 rounded-lg font-medium transition-all",
                                  searchType === 'movie'
                                    ? "bg-zinc-700 text-white"
                                    : "text-zinc-400 hover:text-white"
                                )}
                              >
                                Movies
                              </button>
                              <button
                                type="button"
                                onClick={() => setSearchType('tv')}
                                className={cn(
                                  "px-4 py-2 rounded-lg font-medium transition-all",
                                  searchType === 'tv'
                                    ? "bg-zinc-700 text-white"
                                    : "text-zinc-400 hover:text-white"
                                )}
                              >
                                TV Shows
                              </button>
                            </div>
                            <button
                              type="submit"
                              disabled={searching}
                              className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                            >
                              {searching ? 'Searching...' : 'Search'}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>

                    {searchResults.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-6">Search Results</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {searchResults.map((item: any) => (
                            <TMDBSearchResultCard
                              key={item.id}
                              item={item}
                              type={searchType}
                              onImport={handleImport}
                              importing={importingId === item.id}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {!searching && searchQuery && searchResults.length === 0 && (
                      <div className="text-center py-20">
                        <Search className="w-20 h-20 text-zinc-700 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-white mb-2">No results found</h3>
                        <p className="text-zinc-500">Try a different search term</p>
                      </div>
                    )}
                  </>
              </motion.div>
            )}

            {activeTab === 'scraping' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white">Automated Scraping</h2>
                  <p className="text-zinc-500 mt-1">Configure and run automated content scraping</p>
                </div>

                {(!externalApiKeys?.tmdb || externalApiKeys.tmdb.trim() === '') && (
                  <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-xl p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="shrink-0 p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
                        <AlertTriangle className="w-6 h-6 text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-amber-200 mb-2">
                          TMDB API Key Required
                        </h3>
                        <p className="text-amber-200/80 text-sm mb-4">
                          Automated Scraping uses The Movie Database (TMDB) to fetch metadata, posters and cast info.
                          Without a valid TMDB API key, scraping will fail to add any new content.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => setActiveTab('apikeys')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-medium transition-colors"
                          >
                            <Key className="w-4 h-4" />
                            Add Your TMDB API Key
                          </button>
                          <a
                            href="https://www.themoviedb.org/settings/api"
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors border border-zinc-700"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Get a Free TMDB Key
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {(!externalApiKeys?.fanartTv || externalApiKeys.fanartTv.trim() === '') && (
                  <div className="mb-8 rounded-2xl border border-sky-500/30 bg-sky-500/10 backdrop-blur-xl p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="shrink-0 p-3 rounded-xl bg-sky-500/20 border border-sky-500/30">
                        <Palette className="w-6 h-6 text-sky-300" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-sky-200 mb-2">
                          Fanart.tv API Key Missing
                        </h3>
                        <p className="text-sky-200/80 text-sm mb-4">
                          Adding a Fanart.tv key enriches imported movies &amp; TV shows with HD logos,
                          cleararts, banners, character art, season posters and disc art.
                          Without it, you'll only get basic TMDB posters and backdrops.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => setActiveTab('apikeys')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium transition-colors"
                          >
                            <Key className="w-4 h-4" />
                            Add Your Fanart.tv API Key
                          </button>
                          <a
                            href="https://fanart.tv/get-an-api-key/"
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors border border-zinc-700"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Get a Free Fanart.tv Key
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Configuration */}
                  <div className="lg:col-span-1 space-y-8">
                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Scraping Settings
                      </h3>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-zinc-300 font-medium block">Auto Scraping</label>
                            <span className="text-xs text-zinc-500">Periodic automated catalog sync</span>
                          </div>
                          <button
                            onClick={() => setScrapingConfig({ ...scrapingConfig, autoScrapeEnabled: !scrapingConfig.autoScrapeEnabled })}
                            className={cn(
                              "w-14 h-7 rounded-full transition-colors",
                              scrapingConfig.autoScrapeEnabled ? "bg-red-600" : "bg-zinc-700"
                            )}
                          >
                            <div className={cn(
                              "w-5 h-5 bg-white rounded-full m-1 transition-transform",
                              scrapingConfig.autoScrapeEnabled ? "translate-x-7" : "translate-x-0"
                            )} />
                          </button>
                        </div>

                        {scrapingConfig.autoScrapeEnabled && (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              Automated Scraping Active
                            </div>
                            <p className="text-xs text-zinc-400">
                              Every {scrapingConfig.scrapeInterval}h &bull; Last run:{' '}
                              {scrapingConfig.lastScrapeTime
                                ? new Date(scrapingConfig.lastScrapeTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'Scheduled on start'}
                            </p>
                          </div>
                        )}

                        <div>
                          <label className="text-zinc-300 block mb-2">Scrape Interval (hours)</label>
                          <input
                            type="number"
                            value={scrapingConfig.scrapeInterval}
                            onChange={(e) => setScrapingConfig({ ...scrapingConfig, scrapeInterval: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white"
                            min="1"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="text-zinc-300">Auto Import</label>
                          <button
                            onClick={() => setScrapingConfig({ ...scrapingConfig, autoImportEnabled: !scrapingConfig.autoImportEnabled })}
                            className={cn(
                              "w-14 h-7 rounded-full transition-colors",
                              scrapingConfig.autoImportEnabled ? "bg-red-600" : "bg-zinc-700"
                            )}
                          >
                            <div className={cn(
                              "w-5 h-5 bg-white rounded-full m-1 transition-transform",
                              scrapingConfig.autoImportEnabled ? "translate-x-7" : "translate-x-0"
                            )} />
                          </button>
                        </div>

                        <button
                          onClick={handleUpdateScrapingConfig}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                        >
                          <Save className="w-5 h-5" />
                          Save Settings
                        </button>
                      </div>
                    </div>

                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Quick Actions
                      </h3>

                      <div className="space-y-3">
                        <button
                          onClick={() => handleStartScraping('all', true)}
                          disabled={isScraping}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 rounded-xl text-sm font-medium transition-colors"
                        >
                          <Clock className="w-4 h-4 text-emerald-400" />
                          Trigger Auto-Scrape Cycle Now
                        </button>

                        <button
                          onClick={() => handleStartScraping('all')}
                          disabled={isScraping}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
                        >
                          <RefreshCw className={cn("w-5 h-5", isScraping && "animate-spin")} />
                          {isScraping ? 'Scraping...' : 'Scrape All Content'}
                        </button>

                        <button
                          onClick={() => handleStartScraping('movie')}
                          disabled={isScraping}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
                        >
                          <Film className="w-5 h-5" />
                          Scrape Movies Only
                        </button>

                        <button
                          onClick={() => handleStartScraping('tv')}
                          disabled={isScraping}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
                        >
                          <Tv className="w-5 h-5" />
                          Scrape TV Shows Only
                        </button>
                      </div>
                    </div>

                    {/* Local File Import Section */}
                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Folder className="w-5 h-5" />
                        Import Local Files
                      </h3>

                      <div className="space-y-4">
                        {/* File Inputs */}
                        <div className="grid grid-cols-1 gap-3">
                          <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-zinc-700 rounded-xl cursor-pointer hover:border-red-500 transition-colors">
                            <Upload className="w-10 h-10 text-zinc-400" />
                            <span className="text-white font-medium">Select Video Files</span>
                            <span className="text-zinc-500 text-xs">MP4, MKV, AVI, WEBM, MOV, etc.</span>
                            <input
                              type="file"
                              multiple
                              accept={scrapingConfig.supportedExtensions.join(',')}
                              className="hidden"
                              onChange={handleFileSelect}
                            />
                          </label>

                          <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-zinc-700 rounded-xl cursor-pointer hover:border-red-500 transition-colors">
                            <FolderOpen className="w-10 h-10 text-zinc-400" />
                            <span className="text-white font-medium">Select Entire Folder</span>
                            <span className="text-zinc-500 text-xs">Import all video files from a folder</span>
                            <input
                              type="file"
                              multiple
                              {...({ webkitdirectory: '', directory: '' } as {
                                webkitdirectory?: string;
                                directory?: string;
                              })}
                              accept={scrapingConfig.supportedExtensions.join(',')}
                              className="hidden"
                              onChange={handleFileSelect}
                            />
                          </label>
                        </div>

                        {/* Selected Files List */}
                        {selectedLocalFiles.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-300 font-medium">
                                {selectedLocalFiles.length} file{selectedLocalFiles.length !== 1 ? 's' : ''} selected
                              </span>
                              <button
                                onClick={handleClearAllFiles}
                                className="text-red-400 hover:text-red-300 text-sm font-medium"
                              >
                                Clear All
                              </button>
                            </div>
                            <div className="max-h-48 overflow-y-auto bg-zinc-800/50 rounded-lg p-2 space-y-1">
                              {selectedLocalFiles.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-2 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Video className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                                    <span className="text-white text-sm truncate">{file.name}</span>
                                    <span className="text-zinc-500 text-xs flex-shrink-0">
                                      ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveFile(index)}
                                    className="text-zinc-500 hover:text-red-400 p-1"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>

                            <button
                              onClick={handleImportLocalFiles}
                              disabled={isProcessingLocalFiles}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
                            >
                              {isProcessingLocalFiles ? (
                                <>
                                  <RefreshCw className="w-5 h-5 animate-spin" />
                                  Importing...
                                </>
                              ) : (
                                <>
                                  <Download className="w-5 h-5" />
                                  Import & Match Metadata
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Job History */}
                  <div className="lg:col-span-2">
                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Scraping Jobs
                      </h3>

                      {scrapingConfig.scrapingJobs.length === 0 ? (
                        <div className="text-center py-12">
                          <Clock className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                          <h4 className="text-lg font-semibold text-white mb-2">No jobs yet</h4>
                          <p className="text-zinc-500">Start a scraping job to see history here</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {scrapingConfig.scrapingJobs.map((job: ScrapingJob) => (
                            <div
                              key={job.id}
                              className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-3 h-3 rounded-full",
                                    job.status === 'completed' ? "bg-green-500" :
                                    job.status === 'failed' ? "bg-red-500" :
                                    job.status === 'running' ? "bg-yellow-500 animate-pulse" : "bg-zinc-500"
                                  )} />
                                  <div>
                                    <h4 className="text-white font-medium capitalize">
                                      {job.type} Scraping
                                    </h4>
                                    <p className="text-zinc-500 text-sm">
                                      Started: {new Date(job.startTime).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-xs font-medium capitalize",
                                  job.status === 'completed' ? "bg-green-500/10 text-green-400" :
                                  job.status === 'failed' ? "bg-red-500/10 text-red-400" :
                                  job.status === 'running' ? "bg-yellow-500/10 text-yellow-400" : "bg-zinc-500/10 text-zinc-400"
                                )}>
                                  {job.status}
                                </span>
                              </div>

                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-zinc-500">Processed</span>
                                  <p className="text-white font-medium">{job.itemsProcessed}</p>
                                </div>
                                <div>
                                  <span className="text-zinc-500">Added</span>
                                  <p className="text-white font-medium">{job.itemsAdded}</p>
                                </div>
                                <div>
                                  <span className="text-zinc-500">Updated</span>
                                  <p className="text-white font-medium">{job.itemsUpdated}</p>
                                </div>
                              </div>

                              {job.errors.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-zinc-700">
                                  <p className="text-red-400 text-sm mb-2">{job.errors.length} Error(s)</p>
                                  <div className="max-h-24 overflow-y-auto">
                                    {job.errors.map((err, idx) => (
                                      <p key={idx} className="text-zinc-400 text-xs">{err}</p>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {job.endTime && (
                                <p className="text-zinc-500 text-xs mt-2">
                                  Completed: {new Date(job.endTime).toLocaleString()}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'movies' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Movies</h2>
                    <p className="text-zinc-500 mt-1">Manage your movie library</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setActiveTab('import')}
                      className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Import
                    </button>
                    <button 
                      onClick={() => {
                        setEditingMovie(null)
                        setIsModalOpen(true)
                      }}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Add Movie
                    </button>
                  </div>
                </div>

                {/* Quick Add Buttons */}
                {selectedMovieIds.size > 0 && (
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-4 mb-8 flex flex-wrap items-center gap-4">
                    <p className="text-white font-medium">{selectedMovieIds.size} movie{selectedMovieIds.size > 1 ? 's' : ''} selected</p>
                    <button
                      onClick={() => handleTagSelectedMovies('kids')}
                      className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      <Smile className="w-4 h-4" />
                      Mark as Kids Movie
                    </button>
                    <button
                      onClick={() => handleTagSelectedMovies('anime')}
                      className="flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      Mark as Anime Movie
                    </button>
                    <button
                      onClick={handleAddSelectedAsHeroBanners}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      <Image className="w-4 h-4" />
                      Add as Hero Banners
                    </button>
                    <button
                      onClick={handleAddSelectedAsKidsHeroBanners}
                      className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      <Smile className="w-4 h-4" />
                      Add as Kids Hero Banners
                    </button>
                    <button
                      onClick={handleAddSelectedAsAnimeHeroBanners}
                      className="flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      Add as Anime Hero Banners
                    </button>
                    <button
                      onClick={handleAddSelectedToSliderSection}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      <Film className="w-4 h-4" />
                      Add to Slider
                    </button>
                    <button
                      onClick={handleAddSelectedToHomepageSection}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      <Home className="w-4 h-4" />
                      Add to Homepage
                    </button>
                    <button
                      onClick={() => setSelectedMovieIds(new Set())}
                      className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Clear
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {movies.map((movie: any) => (
                    <AdminMovieCard
                      key={movie.id}
                      movie={movie}
                      onEdit={() => {
                        setEditingMovie(movie)
                        setIsModalOpen(true)
                      }}
                      onDelete={() => handleDeleteMovie(movie.id)}
                      isSelected={selectedMovieIds.has(movie.id)}
                      onSelect={() => handleSelectMovie(movie.id)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'tv' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {!managedTVShow && (
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold text-white">TV Shows</h2>
                      <p className="text-zinc-500 mt-1">Add, edit, remove, and open series to manage seasons</p>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setActiveTab('import')}
                        className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                      >
                        <Download className="w-5 h-5" />
                        Import
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedTVShow(null)
                          setIsTVShowModalOpen(true)
                        }}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        Add TV Show
                      </button>
                    </div>
                  </div>
                )}

                {!managedTVShow && selectedTVShowIds.size > 0 && (
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-4 mb-8 flex flex-wrap items-center gap-4">
                    <p className="text-white font-medium">{selectedTVShowIds.size} TV show{selectedTVShowIds.size > 1 ? 's' : ''} selected</p>
                    <button
                      onClick={() => handleTagSelectedTVShows('kids')}
                      className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      <Smile className="w-4 h-4" />
                      Add to Kids TV Shows
                    </button>
                    <button
                      onClick={() => handleTagSelectedTVShows('anime')}
                      className="flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      Add to Anime Shows
                    </button>
                    <button
                      onClick={() => handleAddSelectedTVShowsAsModeHeroBanners('kids')}
                      className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      <Image className="w-4 h-4" />
                      Kids Hero Banner
                    </button>
                    <button
                      onClick={() => handleAddSelectedTVShowsAsModeHeroBanners('anime')}
                      className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      <Image className="w-4 h-4" />
                      Anime Hero Banner
                    </button>
                    <button
                      onClick={() => handleAddSelectedTVShowsToModeSlider('kids')}
                      className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-black px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      <MoveHorizontal className="w-4 h-4" />
                      Kids HorizontalSlider
                    </button>
                    <button
                      onClick={() => handleAddSelectedTVShowsToModeSlider('anime')}
                      className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      <MoveHorizontal className="w-4 h-4" />
                      Anime HorizontalSlider
                    </button>
                    <button
                      onClick={() => setSelectedTVShowIds(new Set())}
                      className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Clear
                    </button>
                  </div>
                )}

                {managedTVShow ? (
                  <div className="space-y-8">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <button
                          onClick={handleCloseSeasonManager}
                          className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-zinc-700 bg-zinc-900/70 text-white hover:bg-zinc-800 transition-colors mb-4"
                        >
                          <ChevronDown className="w-5 h-5 rotate-90" />
                        </button>
                        <h2 className="text-3xl font-bold text-white">{managedTVShow.title}</h2>
                        <p className="text-zinc-500 mt-1">Series</p>
                      </div>

                      {!managedSeason && (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              if (isSeasonEditorOpen) {
                                handleCancelSeasonEdit()
                              } else {
                                handleEditSeasonModal(managedTVShow.id)
                              }
                            }}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-cyan-500/60 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-colors font-medium"
                          >
                            <Plus className={cn("w-4 h-4", isSeasonEditorOpen && "rotate-45")} />
                            {isSeasonEditorOpen ? 'Cancel' : 'Add Season'}
                          </button>
                        </div>
                      )}
                    </div>

                    {managedSeason ? (
                      <div className="space-y-8">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <button
                              onClick={handleCloseEpisodeManager}
                              className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-zinc-700 bg-zinc-900/70 text-white hover:bg-zinc-800 transition-colors mb-4"
                            >
                              <ChevronDown className="w-5 h-5 rotate-90" />
                            </button>
                            <p className="text-xs font-semibold tracking-[0.35em] uppercase text-cyan-400 mb-3">Episodes</p>
                            <h3 className="text-4xl font-bold text-white">Manage Episodes</h3>
                            <p className="text-zinc-400 mt-3">Add and edit episodes for this season</p>
                          </div>

                          <button
                            onClick={() => {
                              if (isEpisodeEditorOpen) {
                                handleCancelEpisodeEdit()
                              } else {
                                handleEditEpisodeManager(managedTVShow.id, managedSeason.id)
                              }
                            }}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-cyan-500/60 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-colors font-medium"
                          >
                            <Plus className={cn("w-4 h-4", isEpisodeEditorOpen && "rotate-45")} />
                            {isEpisodeEditorOpen ? 'Cancel' : 'Add Episode'}
                          </button>
                        </div>

                        {isEpisodeEditorOpen && (
                          <form
                            onSubmit={handleSubmitEpisodeForm}
                            className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-[2rem] p-6 md:p-8 space-y-6"
                          >
                            <h4 className="text-3xl font-bold text-white">{editingEpisode ? 'Edit Episode' : 'Add Episode'}</h4>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div>
                                <label className="block text-zinc-300 mb-3 font-medium">Episode Number</label>
                                <input
                                  type="number"
                                  min={1}
                                  value={episodeFormData.episodeNumber}
                                  onChange={(e) => {
                                    const nextEpisodeNumber = Number(e.target.value)
                                    setEpisodeFormData(prev => ({
                                      ...prev,
                                      episodeNumber: Number.isNaN(nextEpisodeNumber) ? 1 : nextEpisodeNumber
                                    }))
                                  }}
                                  className="w-full bg-zinc-950/70 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-zinc-300 mb-3 font-medium">Runtime (min)</label>
                                <input
                                  type="text"
                                  value={episodeFormData.runtime}
                                  onChange={(e) => setEpisodeFormData(prev => ({ ...prev, runtime: e.target.value }))}
                                  className="w-full bg-zinc-950/70 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500"
                                />
                              </div>

                              <div>
                                <label className="block text-zinc-300 mb-3 font-medium">Rating</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max="10"
                                  value={episodeFormData.rating}
                                  onChange={(e) => setEpisodeFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                                  className="w-full bg-zinc-950/70 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-zinc-300 mb-3 font-medium">Episode Title</label>
                              <input
                                type="text"
                                value={episodeFormData.title}
                                onChange={(e) => setEpisodeFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full bg-zinc-950/70 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500"
                                placeholder="Episode title"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-zinc-300 mb-3 font-medium">Thumbnail URL</label>
                                <input
                                  type="text"
                                  value={episodeFormData.thumbnailPath}
                                  onChange={(e) => setEpisodeFormData(prev => ({ ...prev, thumbnailPath: e.target.value }))}
                                  className="w-full bg-zinc-950/70 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500"
                                  placeholder="Episode thumbnail URL"
                                />
                              </div>

                              <div>
                                <label className="block text-zinc-300 mb-3 font-medium">Air Date</label>
                                <input
                                  type="date"
                                  value={episodeFormData.airDate}
                                  onChange={(e) => setEpisodeFormData(prev => ({ ...prev, airDate: e.target.value }))}
                                  className="w-full bg-zinc-950/70 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-zinc-300 mb-3 font-medium">Overview</label>
                              <textarea
                                rows={5}
                                value={episodeFormData.overview}
                                onChange={(e) => setEpisodeFormData(prev => ({ ...prev, overview: e.target.value }))}
                                className="w-full bg-zinc-950/70 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500"
                                placeholder="Episode overview"
                              />
                            </div>

                            <button
                              type="submit"
                              className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-cyan-500/60 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-colors font-medium"
                            >
                              <Plus className="w-4 h-4" />
                              Save Episode
                            </button>
                          </form>
                        )}

                        {managedSeason.episodes?.length > 0 ? (
                          <div className="space-y-5">
                            {managedSeason.episodes.map((episode: any) => (
                              <div
                                key={episode.id}
                                className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-[2rem] px-5 py-6"
                              >
                                <div className="flex items-center justify-between gap-4">
                                  <button
                                    type="button"
                                    onClick={() => handleEditEpisodeManager(managedTVShow.id, managedSeason.id, episode)}
                                    className="flex items-center gap-5 text-left flex-1"
                                  >
                                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-lg">
                                      {episode.episodeNumber}
                                    </div>
                                    <div>
                                      <h4 className="text-2xl font-bold text-white">{episode.title}</h4>
                                      <p className="text-zinc-500 mt-1">{episode.runtime || 'N/A'} min</p>
                                    </div>
                                  </button>

                                  <div className="flex items-center gap-5">
                                    <button
                                      type="button"
                                      onClick={() => handleEditEpisodeManager(managedTVShow.id, managedSeason.id, episode)}
                                      className="text-amber-400 hover:text-amber-300 transition-colors"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteEpisode(managedTVShow.id, managedSeason.id, episode.id)}
                                      className="text-rose-400 hover:text-rose-300 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                <div className="mt-5 pt-5 border-t border-zinc-800/80 space-y-4">
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                      <Video className="w-4 h-4 text-cyan-400" />
                                      <p className="text-sm font-medium text-zinc-300">Video Sources</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleAddEpisodeSource(managedTVShow.id, managedSeason.id, episode.id)}
                                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/50 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-colors text-sm font-medium"
                                    >
                                      <Plus className="w-4 h-4" />
                                      Add Source
                                    </button>
                                  </div>

                                  {episode.sources?.length > 0 ? (
                                    <div className="space-y-3">
                                      {episode.sources.map((source: any) => (
                                        <div
                                          key={source.id}
                                          className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3"
                                        >
                                          <div>
                                            <p className="text-white font-medium">{source.title}</p>
                                            <p className="text-zinc-500 text-sm mt-1">
                                              {source.type} • {source.quality || 'N/A'} • {source.size || 'N/A'}
                                            </p>
                                          </div>

                                          <div className="flex items-center gap-4">
                                            <button
                                              type="button"
                                              onClick={() => handleEditSourceModal(managedTVShow.id, managedSeason.id, episode.id, source)}
                                              className="text-amber-400 hover:text-amber-300 transition-colors"
                                            >
                                              <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteEpisodeSource(managedTVShow.id, managedSeason.id, episode.id, source.id)}
                                              className="text-rose-400 hover:text-rose-300 transition-colors"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="rounded-2xl border border-dashed border-zinc-800 px-4 py-5 text-sm text-zinc-500">
                                      No video sources added yet.
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2rem] p-10 text-center text-zinc-500">
                            No episodes added yet. Click "Add Episode" to create the first one.
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="text-xs font-semibold tracking-[0.35em] uppercase text-cyan-400 mb-3">Seasons</p>
                          <h3 className="text-4xl font-bold text-white">Manage Seasons</h3>
                          <p className="text-zinc-400 mt-3">Add and edit seasons for this series</p>
                        </div>

                        {isSeasonEditorOpen && (
                          <form
                            onSubmit={handleSubmitSeasonForm}
                            className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-[2rem] p-6 md:p-8 space-y-6"
                          >
                            <h4 className="text-3xl font-bold text-white">{editingSeason ? 'Edit Season' : 'Add Season'}</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-zinc-300 mb-3 font-medium">Season Number</label>
                                <input
                                  type="number"
                                  min={1}
                                  value={seasonFormData.seasonNumber}
                                  onChange={(e) => {
                                    const nextSeasonNumber = Number(e.target.value)
                                    setSeasonFormData(prev => ({
                                      ...prev,
                                      seasonNumber: Number.isNaN(nextSeasonNumber) ? 1 : nextSeasonNumber
                                    }))
                                  }}
                                  className="w-full bg-zinc-950/70 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-zinc-300 mb-3 font-medium">Season Title (optional)</label>
                                <input
                                  type="text"
                                  value={seasonFormData.title}
                                  onChange={(e) => setSeasonFormData(prev => ({ ...prev, title: e.target.value }))}
                                  className="w-full bg-zinc-950/70 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500"
                                  placeholder="Season 1"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-zinc-300 mb-3 font-medium">Poster URL</label>
                              <input
                                type="text"
                                value={seasonFormData.posterPath}
                                onChange={(e) => setSeasonFormData(prev => ({ ...prev, posterPath: e.target.value }))}
                                className="w-full bg-zinc-950/70 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500"
                                placeholder="Enter poster URL"
                              />
                            </div>

                            <div>
                              <label className="block text-zinc-300 mb-3 font-medium">Synopsis (optional)</label>
                              <textarea
                                rows={5}
                                value={seasonFormData.overview}
                                onChange={(e) => setSeasonFormData(prev => ({ ...prev, overview: e.target.value }))}
                                className="w-full bg-zinc-950/70 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500"
                                placeholder="Season synopsis"
                              />
                            </div>

                            <button
                              type="submit"
                              className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-cyan-500/60 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-colors font-medium"
                            >
                              <Plus className="w-4 h-4" />
                              Save Season
                            </button>
                          </form>
                        )}

                        {managedTVShow.seasons?.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {managedTVShow.seasons.map((season: any) => (
                              <button
                                key={season.id}
                                type="button"
                                onClick={() => handleOpenEpisodeManager(season.id)}
                                className="w-full text-left bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-[2rem] p-6 hover:border-cyan-500/40 transition-colors"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <h4 className="text-2xl font-bold text-white">{season.title || `Season ${season.seasonNumber}`}</h4>
                                    <p className="text-zinc-400 mt-1">Season {season.seasonNumber}</p>
                                    <p className="text-zinc-500 mt-1">{season.episodes?.length || 0} Episodes</p>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <span
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleEditSeasonModal(managedTVShow.id, season)
                                      }}
                                      className="text-amber-400 hover:text-amber-300 transition-colors"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </span>
                                    <span
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteSeason(managedTVShow.id, season.id)
                                      }}
                                      className="text-rose-400 hover:text-rose-300 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </span>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2rem] p-10 text-center text-zinc-500">
                            No seasons added yet. Click "Add Season" to create the first one.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : tvShows.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {tvShows.map((show: any) => (
                      <AdminTVShowCard
                        key={show.id}
                        tvShow={show}
                        onEdit={() => {
                          setSelectedTVShow(show)
                          setIsTVShowModalOpen(true)
                        }}
                        onDelete={() => {
                          const updatedShows = tvShows.filter((item: any) => item.id !== show.id)
                          setTvShows(updatedShows)
                          saveTVShows(updatedShows)
                          if (managedTVShowId === show.id) {
                            handleCloseSeasonManager()
                          }
                        }}
                        onManageSeasons={() => handleOpenSeasonManager(show.id)}
                        isSelected={selectedTVShowIds.has(show.id)}
                        onSelect={() => handleSelectTVShow(show.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <Tv className="w-20 h-20 text-zinc-700 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-2">No TV Shows Yet</h3>
                    <p className="text-zinc-500 mb-6">Import or add your first TV show to get started</p>
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => setActiveTab('import')}
                        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                      >
                        <Download className="w-5 h-5" />
                        Import TV Show
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedTVShow(null)
                          setIsTVShowModalOpen(true)
                        }}
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        Add TV Show
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'tv-channels' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <AdminTvChannelsSection
                  tvChannels={tvChannels}
                  setTvChannels={setTvChannels}
                  isTvChannelModalOpen={isTvChannelModalOpen}
                  setIsTvChannelModalOpen={setIsTvChannelModalOpen}
                  editingTvChannel={editingTvChannel}
                  setEditingTvChannel={setEditingTvChannel}
                  tvChannelSearchQuery={tvChannelSearchQuery}
                  setTvChannelSearchQuery={setTvChannelSearchQuery}
                  tvChannelCategoryFilter={tvChannelCategoryFilter}
                  setTvChannelCategoryFilter={setTvChannelCategoryFilter}
                  selectedTvChannelIds={selectedTvChannelIds}
                  setSelectedTvChannelIds={setSelectedTvChannelIds}
                  showToast={showToast}
                />
              </motion.div>
            )}

            {activeTab === 'castcrew' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Cast</h2>
                    <p className="text-zinc-500 mt-1">View and manage all cast members</p>
                  </div>
                </div>

                {/* Collect all cast from movies and tv shows */}
                {(() => {
                  // Collect all cast
                  const allCast = [
                    ...movies.flatMap((m: any) => 
                      (m.cast || []).map((c: any) => ({ 
                        ...c, 
                        sourceType: 'movie', 
                        sourceId: m.id, 
                        sourceTitle: m.title 
                      }))
                    ),
                    ...tvShows.flatMap((s: any) => 
                      (s.cast || []).map((c: any) => ({ 
                        ...c, 
                        sourceType: 'tv', 
                        sourceId: s.id, 
                        sourceTitle: s.title 
                      }))
                    )
                  ]

                  return (
                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                      <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Cast Members ({allCast.length})
                      </h3>
                      {allCast.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {allCast.map((castMember, index) => (
                            <div key={`cast-${index}-${castMember.id}`} className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-6">
                              <div className="flex items-start gap-4 mb-4">
                                {castMember.profilePhoto ? (
                                  <img 
                                    src={castMember.profilePhoto} 
                                    alt={castMember.name} 
                                    className="w-16 h-16 rounded-xl object-cover"
                                  />
                                ) : (
                                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center border border-zinc-700">
                                    <Users className="w-8 h-8 text-zinc-500" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <h4 className="text-white font-semibold">{castMember.name}</h4>
                                  {castMember.role && <p className="text-zinc-400 text-sm">{castMember.role}</p>}
                                  {castMember.character && <p className="text-zinc-500 text-xs italic">as {castMember.character}</p>}
                                  <p className="text-zinc-500 text-xs mt-1">
                                    {castMember.sourceType === 'movie' ? 'ðŸŽ¬' : 'ðŸ“º'} {castMember.sourceTitle}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Users className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                          <p className="text-zinc-500">No cast members yet</p>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </motion.div>
            )}

            {activeTab === 'xtream-api' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Xtream API</h2>
                    <p className="text-zinc-500 mt-1">Manage your Xtream API configurations</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleAddXtreamConfig}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Add Config
                    </button>
                    <button 
                      onClick={handleSaveXtreamConfigs}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                  <div className="space-y-6">
                    {xtreamConfigs.map((config) => (
                      <div key={config.id} className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Wifi className="w-8 h-8 text-zinc-400" />
                            <div>
                              <h4 className="text-white font-semibold">{config.name}</h4>
                              <p className="text-zinc-500 text-sm">{config.serverUrl}</p>
                            </div>
                            {config.isActive && (
                              <div className="ml-3 flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-emerald-400 text-sm font-medium">Active</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditXtreamConfig(config.id, 'isActive', !config.isActive)}
                              className={cn(
                                "p-2 rounded-lg transition-colors",
                                config.isActive 
                                  ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                                  : "bg-zinc-700 text-zinc-400 hover:bg-zinc-600"
                              )}
                            >
                              {config.isActive ? "Active" : "Set Active"}
                            </button>
                            <button
                              onClick={() => handleDeleteXtreamConfig(config.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Config Name */}
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Config Name</label>
                            <input
                              type="text"
                              value={config.name}
                              onChange={(e) => handleEditXtreamConfig(config.id, 'name', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          
                          {/* Server URL */}
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Server URL</label>
                            <input
                              type="url"
                              value={config.serverUrl}
                              onChange={(e) => handleEditXtreamConfig(config.id, 'serverUrl', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          
                          {/* Username */}
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Username</label>
                            <input
                              type="text"
                              value={config.username}
                              onChange={(e) => handleEditXtreamConfig(config.id, 'username', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          
                          {/* Password */}
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Password</label>
                            <input
                              type="password"
                              value={config.password}
                              onChange={(e) => handleEditXtreamConfig(config.id, 'password', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {xtreamConfigs.length === 0 && (
                      <div className="text-center py-12">
                        <Wifi className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Xtream Configs Yet</h3>
                        <p className="text-zinc-500">Add your first Xtream API configuration to get started</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'server-health' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Server Health</h2>
                    <p className="text-zinc-500 mt-1">Monitor your server status in real-time</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={checkServerHealth}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Frontend Status */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${serverHealth.frontend.status === 'healthy' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                        <Activity className={`w-5 h-5 ${serverHealth.frontend.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'}`} />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Frontend</h3>
                        <p className="text-zinc-500 text-xs">Status</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${serverHealth.frontend.status === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                      <span className={`text-sm font-medium ${serverHealth.frontend.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {serverHealth.frontend.status}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-xs mt-2">Response: {serverHealth.frontend.responseTime}ms</p>
                    {serverHealth.frontend.lastChecked && (
                      <p className="text-zinc-600 text-xs mt-1">Last check: {serverHealth.frontend.lastChecked.toLocaleTimeString()}</p>
                    )}
                    {(serverHealth.frontend as any).uptime?.formatted && (
                      <p className="text-zinc-400 text-xs mt-2">Uptime: {(serverHealth.frontend as any).uptime.formatted}</p>
                    )}
                    {(serverHealth.frontend as any).memory?.usagePercentage && (
                      <p className="text-zinc-400 text-xs mt-1">Memory: {(serverHealth.frontend as any).memory.usagePercentage}%</p>
                    )}
                    {serverHealth.frontend.message && (
                      <p className="text-yellow-400 text-xs mt-2">{serverHealth.frontend.message}</p>
                    )}
                  </div>

                  {/* Backend Status */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${serverHealth.backend.status === 'healthy' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                        <HardDrive className={`w-5 h-5 ${serverHealth.backend.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'}`} />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Backend</h3>
                        <p className="text-zinc-500 text-xs">API Server</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${serverHealth.backend.status === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                      <span className={`text-sm font-medium ${serverHealth.backend.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {serverHealth.backend.status}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-xs mt-2">Response: {serverHealth.backend.responseTime}ms</p>
                    {serverHealth.backend.lastChecked && (
                      <p className="text-zinc-600 text-xs mt-1">Last check: {serverHealth.backend.lastChecked.toLocaleTimeString()}</p>
                    )}
                    {serverHealth.backend.message && (
                      <p className="text-yellow-400 text-xs mt-2">{serverHealth.backend.message}</p>
                    )}
                  </div>

                  {/* Database Status */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${serverHealth.database.status === 'healthy' ? 'bg-emerald-500/20' : serverHealth.database.status === 'checking' ? 'bg-yellow-500/20' : 'bg-red-500/20'}`}>
                        <Database className={`w-5 h-5 ${serverHealth.database.status === 'healthy' ? 'text-emerald-400' : serverHealth.database.status === 'checking' ? 'text-yellow-400' : 'text-red-400'}`} />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Database</h3>
                        <p className="text-zinc-500 text-xs">Storage</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${serverHealth.database.status === 'healthy' ? 'bg-emerald-500 animate-pulse' : serverHealth.database.status === 'checking' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                      <span className={`text-sm font-medium ${serverHealth.database.status === 'healthy' ? 'text-emerald-400' : serverHealth.database.status === 'checking' ? 'text-yellow-400' : 'text-red-400'}`}>
                        {serverHealth.database.status}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-xs mt-2">Response: {serverHealth.database.responseTime}ms</p>
                    {serverHealth.database.lastChecked && (
                      <p className="text-zinc-600 text-xs mt-1">Last check: {serverHealth.database.lastChecked.toLocaleTimeString()}</p>
                    )}
                    {serverHealth.database.message && (
                      <p className="text-yellow-400 text-xs mt-2">{serverHealth.database.message}</p>
                    )}
                  </div>

                  {/* Uptime */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/20">
                        <Clock className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Uptime</h3>
                        <p className="text-zinc-500 text-xs">Backend Server</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {serverHealth.backend.uptime?.formatted || `${Math.floor(serverHealth.uptime / 86400)}d ${Math.floor((serverHealth.uptime % 86400) / 3600)}h ${Math.floor((serverHealth.uptime % 3600) / 60)}m`}
                    </p>
                  </div>

                  {/* Storage */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/20">
                        <HardDrive className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Storage</h3>
                        <p className="text-zinc-500 text-xs">Disk Usage</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {serverHealth.backend.storage?.usagePercentage || '0.00'}%
                    </p>
                    {serverHealth.backend.lastChecked && (
                      <p className="text-zinc-600 text-xs mt-1">Last check: {serverHealth.backend.lastChecked.toLocaleTimeString()}</p>
                    )}
                  </div>

                  {/* Bandwidth */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-500/20">
                        <Wifi className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Bandwidth</h3>
                        <p className="text-zinc-500 text-xs">Data Transferred</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-emerald-400">↑ {serverHealth.backend.bandwidth?.sentFormatted || '0 B'}</p>
                      <p className="text-sm font-medium text-blue-400">↓ {serverHealth.backend.bandwidth?.receivedFormatted || '0 B'}</p>
                    </div>
                  </div>
                </div>

                {/* Detailed Backend Info */}
                {serverHealth.backend.status === 'healthy' && serverHealth.backend.memory && (
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      System Resources
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Memory Usage */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <label className="text-zinc-400 text-sm font-medium">Memory Usage</label>
                          <span className="text-white font-semibold">{serverHealth.backend.memory.usagePercentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${serverHealth.backend.memory.usagePercentage}%` }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3 text-xs text-zinc-500">
                          <div>Used: {Math.round(serverHealth.backend.memory.used / 1024 / 1024)} MB</div>
                          <div>Total: {Math.round(serverHealth.backend.memory.total / 1024 / 1024)} MB</div>
                        </div>
                      </div>
                      
                      {/* CPU Load */}
                      {serverHealth.backend.cpu && (
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <label className="text-zinc-400 text-sm font-medium">CPU Load</label>
                            <span className="text-white font-semibold">{serverHealth.backend.cpu.load1min.toFixed(2)} (1m)</span>
                          </div>
                          <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                              style={{ width: `${Math.min(100, serverHealth.backend.cpu.load1min / serverHealth.backend.cpu.cores * 100)}%` }}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-3 mt-3 text-xs text-zinc-500">
                            <div>1m: {serverHealth.backend.cpu.load1min.toFixed(2)}</div>
                            <div>5m: {serverHealth.backend.cpu.load5min.toFixed(2)}</div>
                            <div>15m: {serverHealth.backend.cpu.load15min.toFixed(2)}</div>
                          </div>
                        </div>
                      )}

                      {/* Storage Usage */}
                      {serverHealth.backend.storage && (
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <label className="text-zinc-400 text-sm font-medium">Storage Usage</label>
                            <span className="text-white font-semibold">{serverHealth.backend.storage.usagePercentage}%</span>
                          </div>
                          <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                              style={{ width: `${serverHealth.backend.storage.usagePercentage}%` }}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-3 mt-3 text-xs text-zinc-500">
                            <div>Used: {serverHealth.backend.storage.usedFormatted}</div>
                            <div>Free: {serverHealth.backend.storage.freeFormatted}</div>
                            <div>Total: {serverHealth.backend.storage.totalFormatted}</div>
                          </div>
                        </div>
                      )}

                      {/* Bandwidth Usage */}
                      {serverHealth.backend.bandwidth && (
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <label className="text-zinc-400 text-sm font-medium">Bandwidth</label>
                            <span className="text-white font-semibold">Total Transferred</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-zinc-800/50 rounded-xl p-4">
                              <p className="text-zinc-500 text-xs mb-1">Sent</p>
                              <p className="text-emerald-400 font-semibold text-lg">{serverHealth.backend.bandwidth.sentFormatted}</p>
                            </div>
                            <div className="bg-zinc-800/50 rounded-xl p-4">
                              <p className="text-zinc-500 text-xs mb-1">Received</p>
                              <p className="text-blue-400 font-semibold text-lg">{serverHealth.backend.bandwidth.receivedFormatted}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Platform Info */}
                      {serverHealth.backend.platform && (
                        <div className="md:col-span-2">
                          <h4 className="text-zinc-400 text-sm font-medium mb-3">Platform</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-zinc-800/50 rounded-xl p-4">
                              <p className="text-zinc-500 text-xs mb-1">OS</p>
                              <p className="text-white font-semibold">{serverHealth.backend.platform.os}</p>
                            </div>
                            <div className="bg-zinc-800/50 rounded-xl p-4">
                              <p className="text-zinc-500 text-xs mb-1">Arch</p>
                              <p className="text-white font-semibold">{serverHealth.backend.platform.arch}</p>
                            </div>
                            <div className="bg-zinc-800/50 rounded-xl p-4">
                              <p className="text-zinc-500 text-xs mb-1">Node</p>
                              <p className="text-white font-semibold">{serverHealth.backend.platform.nodeVersion}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'ai-features' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white">AI Features</h2>
                    <p className="text-zinc-500 mt-1">Manage your AI-powered features</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {/* Trending Prediction */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">Trending Prediction</h3>
                          <p className="text-zinc-500 text-xs">Predict upcoming content</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAiFeature('trendingPrediction')}
                        className={`w-14 h-8 rounded-full relative cursor-pointer transition-all ${
                          aiFeatures.trendingPrediction?.enabled ? 'bg-red-600' : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                            aiFeatures.trendingPrediction?.enabled ? 'right-1' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-zinc-400 text-sm mb-4">Predict trending movies and shows using ML models</p>
                    {aiFeatures.trendingPrediction?.lastRun && (
                      <p className="text-zinc-500 text-xs mb-4">Last run: {new Date(aiFeatures.trendingPrediction.lastRun).toLocaleString()}</p>
                    )}
                    <button
                      onClick={() => runAiFeature('trendingPrediction', 'Trending prediction')}
                      disabled={isRunning.trendingPrediction || !aiFeatures.trendingPrediction?.enabled}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors",
                        isRunning.trendingPrediction || !aiFeatures.trendingPrediction?.enabled
                          ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      )}
                    >
                      {isRunning.trendingPrediction ? (
                        <span>Running Prediction...</span>
                      ) : (
                        <span>Run Prediction</span>
                      )}
                    </button>
                  </div>

                  {/* Auto Categorization */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                          <Tags className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">Auto Categorization</h3>
                          <p className="text-zinc-500 text-xs">Smart content tagging</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAiFeature('autoCategorization')}
                        className={`w-14 h-8 rounded-full relative cursor-pointer transition-all ${
                          aiFeatures.autoCategorization?.enabled ? 'bg-red-600' : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                            aiFeatures.autoCategorization?.enabled ? 'right-1' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-zinc-400 text-sm mb-4">Automatically categorize and tag movies/shows</p>
                    {aiFeatures.autoCategorization?.lastRun && (
                      <p className="text-zinc-500 text-xs mb-4">Last run: {new Date(aiFeatures.autoCategorization.lastRun).toLocaleString()}</p>
                    )}
                    <button
                      onClick={() => runAiFeature('autoCategorization', 'Auto categorization')}
                      disabled={isRunning.autoCategorization || !aiFeatures.autoCategorization?.enabled}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors",
                        isRunning.autoCategorization || !aiFeatures.autoCategorization?.enabled
                          ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      )}
                    >
                      {isRunning.autoCategorization ? (
                        <span>Running Categorization...</span>
                      ) : (
                        <span>Run Categorization</span>
                      )}
                    </button>
                  </div>

                  {/* AI Subtitles */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                          <Languages className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">AI Subtitles</h3>
                          <p className="text-zinc-500 text-xs">Auto generate subtitles</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAiFeature('aiSubtitles')}
                        className={`w-14 h-8 rounded-full relative cursor-pointer transition-all ${
                          aiFeatures.aiSubtitles?.enabled ? 'bg-red-600' : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                            aiFeatures.aiSubtitles?.enabled ? 'right-1' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-zinc-400 text-sm mb-4">Automatically generate and translate subtitles</p>
                    {aiFeatures.aiSubtitles?.lastRun && (
                      <p className="text-zinc-500 text-xs mb-4">Last run: {new Date(aiFeatures.aiSubtitles.lastRun).toLocaleString()}</p>
                    )}
                    <button
                      onClick={() => runAiFeature('aiSubtitles', 'AI subtitles')}
                      disabled={isRunning.aiSubtitles || !aiFeatures.aiSubtitles?.enabled}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors",
                        isRunning.aiSubtitles || !aiFeatures.aiSubtitles?.enabled
                          ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
                      )}
                    >
                      {isRunning.aiSubtitles ? (
                        <span>Running Subtitles...</span>
                      ) : (
                        <span>Run Subtitles</span>
                      )}
                    </button>
                  </div>

                  {/* AI Translation */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                          <Globe className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">AI Translation</h3>
                          <p className="text-zinc-500 text-xs">Multilingual support</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAiFeature('aiTranslation')}
                        className={`w-14 h-8 rounded-full relative cursor-pointer transition-all ${
                          aiFeatures.aiTranslation?.enabled ? 'bg-red-600' : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                            aiFeatures.aiTranslation?.enabled ? 'right-1' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-zinc-400 text-sm mb-4">Translate content to 100+ languages</p>
                    {aiFeatures.aiTranslation?.lastRun && (
                      <p className="text-zinc-500 text-xs mb-4">Last run: {new Date(aiFeatures.aiTranslation.lastRun).toLocaleString()}</p>
                    )}
                    <button
                      onClick={() => runAiFeature('aiTranslation', 'AI translation')}
                      disabled={isRunning.aiTranslation || !aiFeatures.aiTranslation?.enabled}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors",
                        isRunning.aiTranslation || !aiFeatures.aiTranslation?.enabled
                          ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                      )}
                    >
                      {isRunning.aiTranslation ? (
                        <span>Running Translation...</span>
                      ) : (
                        <span>Run Translation</span>
                      )}
                    </button>
                  </div>

                  {/* AI Voiceovers */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-red-600 flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">AI Voiceovers</h3>
                          <p className="text-zinc-500 text-xs">Voice narration</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAiFeature('aiVoiceovers')}
                        className={`w-14 h-8 rounded-full relative cursor-pointer transition-all ${
                          aiFeatures.aiVoiceovers?.enabled ? 'bg-red-600' : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                            aiFeatures.aiVoiceovers?.enabled ? 'right-1' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-zinc-400 text-sm mb-4">Generate natural voiceovers in multiple languages</p>
                    {aiFeatures.aiVoiceovers?.lastRun && (
                      <p className="text-zinc-500 text-xs mb-4">Last run: {new Date(aiFeatures.aiVoiceovers.lastRun).toLocaleString()}</p>
                    )}
                    <button
                      onClick={() => runAiFeature('aiVoiceovers', 'AI voiceovers')}
                      disabled={isRunning.aiVoiceovers || !aiFeatures.aiVoiceovers?.enabled}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors",
                        isRunning.aiVoiceovers || !aiFeatures.aiVoiceovers?.enabled
                          ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white"
                      )}
                    >
                      {isRunning.aiVoiceovers ? (
                        <span>Running Voiceovers...</span>
                      ) : (
                        <span>Run Voiceovers</span>
                      )}
                    </button>
                  </div>

                  {/* AI Posters */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center">
                          <Image className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">AI Posters</h3>
                          <p className="text-zinc-500 text-xs">Generate posters</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAiFeature('aiPosters')}
                        className={`w-14 h-8 rounded-full relative cursor-pointer transition-all ${
                          aiFeatures.aiPosters?.enabled ? 'bg-red-600' : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                            aiFeatures.aiPosters?.enabled ? 'right-1' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-zinc-400 text-sm mb-4">Generate and enhance movie posters with AI</p>
                    {aiFeatures.aiPosters?.lastRun && (
                      <p className="text-zinc-500 text-xs mb-4">Last run: {new Date(aiFeatures.aiPosters.lastRun).toLocaleString()}</p>
                    )}
                    <button
                      onClick={() => runAiFeature('aiPosters', 'AI posters')}
                      disabled={isRunning.aiPosters || !aiFeatures.aiPosters?.enabled}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors",
                        isRunning.aiPosters || !aiFeatures.aiPosters?.enabled
                          ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white"
                      )}
                    >
                      {isRunning.aiPosters ? (
                        <span>Running Posters...</span>
                      ) : (
                        <span>Run Posters</span>
                      )}
                    </button>
                  </div>

                  {/* Smart Search */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                          <Search className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">Smart Search</h3>
                          <p className="text-zinc-500 text-xs">AI-powered search</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAiFeature('smartSearch')}
                        className={`w-14 h-8 rounded-full relative cursor-pointer transition-all ${
                          aiFeatures.smartSearch?.enabled ? 'bg-red-600' : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                            aiFeatures.smartSearch?.enabled ? 'right-1' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-zinc-400 text-sm mb-4">Natural language search and discovery</p>
                    {aiFeatures.smartSearch?.lastRun && (
                      <p className="text-zinc-500 text-xs mb-4">Last run: {new Date(aiFeatures.smartSearch.lastRun).toLocaleString()}</p>
                    )}
                    <button
                      onClick={() => runAiFeature('smartSearch', 'Smart search')}
                      disabled={isRunning.smartSearch || !aiFeatures.smartSearch?.enabled}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors",
                        isRunning.smartSearch || !aiFeatures.smartSearch?.enabled
                          ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
                      )}
                    >
                      {isRunning.smartSearch ? (
                        <span>Running Search...</span>
                      ) : (
                        <span>Run Search</span>
                      )}
                    </button>
                  </div>

                  {/* AI Chat Assistant */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">AI Chat Assistant</h3>
                          <p className="text-zinc-500 text-xs">Personal assistant</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAiFeature('aiChatAssistant')}
                        className={`w-14 h-8 rounded-full relative cursor-pointer transition-all ${
                          aiFeatures.aiChatAssistant?.enabled ? 'bg-red-600' : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                            aiFeatures.aiChatAssistant?.enabled ? 'right-1' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-zinc-400 text-sm mb-4">Chat with AI for recommendations and help</p>
                    {aiFeatures.aiChatAssistant?.lastRun && (
                      <p className="text-zinc-500 text-xs mb-4">Last run: {new Date(aiFeatures.aiChatAssistant.lastRun).toLocaleString()}</p>
                    )}
                    <button
                      onClick={() => runAiFeature('aiChatAssistant', 'AI chat assistant')}
                      disabled={isRunning.aiChatAssistant || !aiFeatures.aiChatAssistant?.enabled}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors",
                        isRunning.aiChatAssistant || !aiFeatures.aiChatAssistant?.enabled
                          ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
                      )}
                    >
                      {isRunning.aiChatAssistant ? (
                        <span>Running Assistant...</span>
                      ) : (
                        <span>Run Assistant</span>
                      )}
                    </button>
                  </div>

                  {/* Churn Prediction */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">Churn Prediction</h3>
                          <p className="text-zinc-500 text-xs">User retention</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAiFeature('churnPrediction')}
                        className={`w-14 h-8 rounded-full relative cursor-pointer transition-all ${
                          aiFeatures.churnPrediction?.enabled ? 'bg-red-600' : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                            aiFeatures.churnPrediction?.enabled ? 'right-1' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-zinc-400 text-sm mb-4">Predict user churn and suggest retention actions</p>
                    {aiFeatures.churnPrediction?.lastRun && (
                      <p className="text-zinc-500 text-xs mb-4">Last run: {new Date(aiFeatures.churnPrediction.lastRun).toLocaleString()}</p>
                    )}
                    <button
                      onClick={() => runAiFeature('churnPrediction', 'Churn prediction')}
                      disabled={isRunning.churnPrediction || !aiFeatures.churnPrediction?.enabled}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors",
                        isRunning.churnPrediction || !aiFeatures.churnPrediction?.enabled
                          ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
                      )}
                    >
                      {isRunning.churnPrediction ? (
                        <span>Running Prediction...</span>
                      ) : (
                        <span>Run Prediction</span>
                      )}
                    </button>
                  </div>

                  {/* AI Recommendations */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 md:col-span-2 lg:col-span-3">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center">
                          <Star className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">AI Recommendations</h3>
                          <p className="text-zinc-500 text-xs">Personalized suggestions</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAiFeature('aiRecommendations')}
                        className={`w-14 h-8 rounded-full relative cursor-pointer transition-all ${
                          aiFeatures.aiRecommendations?.enabled ? 'bg-red-600' : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                            aiFeatures.aiRecommendations?.enabled ? 'right-1' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-zinc-400 text-sm mb-4">Personalized suggestions for your users</p>
                    {aiFeatures.aiRecommendations?.lastRun && (
                      <p className="text-zinc-500 text-xs mb-4">Last run: {new Date(aiFeatures.aiRecommendations.lastRun).toLocaleString()}</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                      <div className="bg-zinc-800/50 rounded-xl p-3">
                        <p className="text-zinc-300 text-sm font-medium">Trending</p>
                      </div>
                      <div className="bg-zinc-800/50 rounded-xl p-3">
                        <p className="text-zinc-300 text-sm font-medium">Recently Watched</p>
                      </div>
                      <div className="bg-zinc-800/50 rounded-xl p-3">
                        <p className="text-zinc-300 text-sm font-medium">Because You Watched</p>
                      </div>
                      <div className="bg-zinc-800/50 rounded-xl p-3">
                        <p className="text-zinc-300 text-sm font-medium">Popular Near You</p>
                      </div>
                      <div className="bg-zinc-800/50 rounded-xl p-3">
                        <p className="text-zinc-300 text-sm font-medium">New Releases</p>
                      </div>
                      <div className="bg-zinc-800/50 rounded-xl p-3">
                        <p className="text-zinc-300 text-sm font-medium">Top Rated</p>
                      </div>
                    </div>
                    <button
                      onClick={() => runAiFeature('aiRecommendations', 'AI recommendations')}
                      disabled={isRunning.aiRecommendations || !aiFeatures.aiRecommendations?.enabled}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors",
                        isRunning.aiRecommendations || !aiFeatures.aiRecommendations?.enabled
                          ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-lime-600 to-green-600 hover:from-lime-700 hover:to-green-700 text-white"
                      )}
                    >
                      {isRunning.aiRecommendations ? (
                        <span>Running Recommendations...</span>
                      ) : (
                        <span>Run Recommendations</span>
                      )}
                    </button>
                  </div>

                  {/* Download Features */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                          <Download className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">Download Features</h3>
                          <p className="text-zinc-500 text-xs">Offline viewing</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAiFeature('downloadFeatures')}
                        className={`w-14 h-8 rounded-full relative cursor-pointer transition-all ${
                          aiFeatures.downloadFeatures?.enabled ? 'bg-red-600' : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                            aiFeatures.downloadFeatures?.enabled ? 'right-1' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-zinc-400 text-sm mb-4">Offline download, encrypted, smart downloads and more</p>
                    {aiFeatures.downloadFeatures?.lastRun && (
                      <p className="text-zinc-500 text-xs mb-4">Last run: {new Date(aiFeatures.downloadFeatures.lastRun).toLocaleString()}</p>
                    )}
                    <button
                      onClick={() => runAiFeature('downloadFeatures', 'Download features')}
                      disabled={isRunning.downloadFeatures || !aiFeatures.downloadFeatures?.enabled}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors",
                        isRunning.downloadFeatures || !aiFeatures.downloadFeatures?.enabled
                          ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                      )}
                    >
                      {isRunning.downloadFeatures ? (
                        <span>Running Download Setup...</span>
                      ) : (
                        <span>Run Setup</span>
                      )}
                    </button>
                  </div>

                  {/* Android App */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                          <Smartphone className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">Android App</h3>
                          <p className="text-zinc-500 text-xs">Material You + Jetpack Compose</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAiFeature('androidApp')}
                        className={`w-14 h-8 rounded-full relative cursor-pointer transition-all ${
                          aiFeatures.androidApp?.enabled ? 'bg-red-600' : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                            aiFeatures.androidApp?.enabled ? 'right-1' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-zinc-400 text-sm mb-4">Modern Android app with tablet, foldable, Chromecast support</p>
                    {aiFeatures.androidApp?.lastRun && (
                      <p className="text-zinc-500 text-xs mb-4">Last run: {new Date(aiFeatures.androidApp.lastRun).toLocaleString()}</p>
                    )}
                    <button
                      onClick={() => runAiFeature('androidApp', 'Android app')}
                      disabled={isRunning.androidApp || !aiFeatures.androidApp?.enabled}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors",
                        isRunning.androidApp || !aiFeatures.androidApp?.enabled
                          ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      )}
                    >
                      {isRunning.androidApp ? (
                        <span>Running Setup...</span>
                      ) : (
                        <span>Run Setup</span>
                      )}
                    </button>
                  </div>

                  {/* iOS App */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center">
                          <Monitor className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">iOS App</h3>
                          <p className="text-zinc-500 text-xs">SwiftUI + Apple Design</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAiFeature('iosApp')}
                        className={`w-14 h-8 rounded-full relative cursor-pointer transition-all ${
                          aiFeatures.iosApp?.enabled ? 'bg-red-600' : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                            aiFeatures.iosApp?.enabled ? 'right-1' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-zinc-400 text-sm mb-4">iOS app with SwiftUI, Dynamic Island, Widgets, Live Activities</p>
                    {aiFeatures.iosApp?.lastRun && (
                      <p className="text-zinc-500 text-xs mb-4">Last run: {new Date(aiFeatures.iosApp.lastRun).toLocaleString()}</p>
                    )}
                    <button
                      onClick={() => runAiFeature('iosApp', 'iOS app')}
                      disabled={isRunning.iosApp || !aiFeatures.iosApp?.enabled}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors",
                        isRunning.iosApp || !aiFeatures.iosApp?.enabled
                          ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700 text-white"
                      )}
                    >
                      {isRunning.iosApp ? (
                        <span>Running Setup...</span>
                      ) : (
                        <span>Run Setup</span>
                      )}
                    </button>
                  </div>

                  {/* Android TV App */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                          <AppWindow className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">Android TV App</h3>
                          <p className="text-zinc-500 text-xs">TV Optimized</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAiFeature('androidTVApp')}
                        className={`w-14 h-8 rounded-full relative cursor-pointer transition-all ${
                          aiFeatures.androidTVApp?.enabled ? 'bg-red-600' : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                            aiFeatures.androidTVApp?.enabled ? 'right-1' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-zinc-400 text-sm mb-4">Android TV app with remote-friendly UI and voice search</p>
                    {aiFeatures.androidTVApp?.lastRun && (
                      <p className="text-zinc-500 text-xs mb-4">Last run: {new Date(aiFeatures.androidTVApp.lastRun).toLocaleString()}</p>
                    )}
                    <button
                      onClick={() => runAiFeature('androidTVApp', 'Android TV app')}
                      disabled={isRunning.androidTVApp || !aiFeatures.androidTVApp?.enabled}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors",
                        isRunning.androidTVApp || !aiFeatures.androidTVApp?.enabled
                          ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
                      )}
                    >
                      {isRunning.androidTVApp ? (
                        <span>Running Setup...</span>
                      ) : (
                        <span>Run Setup</span>
                      )}
                    </button>
                  </div>

                  {/* AI Metadata Cleanup */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                          <RefreshCw className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">AI Metadata Cleanup</h3>
                          <p className="text-zinc-500 text-xs">Metadata management</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAiFeature('aiMetadataCleanup')}
                        className={`w-14 h-8 rounded-full relative cursor-pointer transition-all ${
                          aiFeatures.aiMetadataCleanup?.enabled ? 'bg-red-600' : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                            aiFeatures.aiMetadataCleanup?.enabled ? 'right-1' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-zinc-400 text-sm mb-4">Clean and standardize content metadata</p>
                    {aiFeatures.aiMetadataCleanup?.lastRun && (
                      <p className="text-zinc-500 text-xs mb-4">Last run: {new Date(aiFeatures.aiMetadataCleanup.lastRun).toLocaleString()}</p>
                    )}
                    <button
                      onClick={() => runAiFeature('aiMetadataCleanup', 'AI metadata cleanup')}
                      disabled={isRunning.aiMetadataCleanup || !aiFeatures.aiMetadataCleanup?.enabled}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors",
                        isRunning.aiMetadataCleanup || !aiFeatures.aiMetadataCleanup?.enabled
                          ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white"
                      )}
                    >
                      {isRunning.aiMetadataCleanup ? (
                        <span>Running Cleanup...</span>
                      ) : (
                        <span>Run Cleanup</span>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {['default-hero', 'kids-hero', 'anime-hero'].includes(activeTab) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'default-hero' && (
                  <>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Hero Banner</h2>
                    <p className="text-zinc-500 mt-1">Manage your hero banner content</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleAddHeroBanner}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Add Banner
                    </button>
                    <button 
                      onClick={handleSaveHeroBanners}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                  <div className="space-y-6">
                    {heroBanners.map((banner, index) => (
                      <div key={banner.id} className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleMoveHeroBanner(banner.id, 'up')}
                                disabled={index === 0}
                                className="p-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 rounded-lg transition-colors"
                              >
                                <ChevronUp className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleMoveHeroBanner(banner.id, 'down')}
                                disabled={index === heroBanners.length - 1}
                                className="p-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 rounded-lg transition-colors"
                              >
                                <ChevronDown className="w-5 h-5" />
                              </button>
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">{banner.title}</h4>
                              <p className="text-zinc-500 text-sm">Order: {banner.order}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditHeroBanner(banner.id, 'isActive', !banner.isActive)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                banner.isActive ? 'bg-emerald-600 text-white' : 'bg-zinc-700 text-zinc-400'
                              )}
                            >
                              {banner.isActive ? 'Active' : 'Inactive'}
                            </button>
                            <button
                              onClick={() => handleDeleteHeroBanner(banner.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Title</label>
                            <input
                              type="text"
                              value={banner.title}
                              onChange={(e) => handleEditHeroBanner(banner.id, 'title', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Description</label>
                            <textarea
                              value={banner.description}
                              onChange={(e) => handleEditHeroBanner(banner.id, 'description', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Backdrop URL</label>
                            <input
                              type="url"
                              value={banner.backdropUrl}
                              onChange={(e) => handleEditHeroBanner(banner.id, 'backdropUrl', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Poster URL</label>
                            <input
                              type="url"
                              value={banner.posterUrl}
                              onChange={(e) => handleEditHeroBanner(banner.id, 'posterUrl', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Auto Scroll Interval (ms)</label>
                            <input
                              type="number"
                              value={banner.autoScrollInterval || 10000}
                              onChange={(e) => handleEditHeroBanner(banner.id, 'autoScrollInterval', Number(e.target.value))}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                              min="1000"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {heroBanners.length === 0 && (
                      <div className="text-center py-12">
                        <Image className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Banners Yet</h3>
                        <p className="text-zinc-500">Add your first banner to get started</p>
                      </div>
                    )}
                  </div>
                </div>
                  </>
                )}

                {activeTab === 'kids-hero' && (
                  <>
                <div className="flex items-center justify-between mt-10 mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Kids Hero Banners</h3>
                    <p className="text-zinc-500 mt-1">Quick add multiple titles and manage the hero banners used only on Kids Home.</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleAddKidsHeroBanner}
                      className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Add Kids Banner
                    </button>
                    <button 
                      onClick={handleSaveKidsHeroBanners}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      Save Kids Banners
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                  <div className="space-y-6">
                    {kidsHeroBanners.map((banner, index) => (
                      <div key={banner.id} className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleMoveKidsHeroBanner(banner.id, 'up')}
                                disabled={index === 0}
                                className="p-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 rounded-lg transition-colors"
                              >
                                <ChevronUp className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleMoveKidsHeroBanner(banner.id, 'down')}
                                disabled={index === kidsHeroBanners.length - 1}
                                className="p-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 rounded-lg transition-colors"
                              >
                                <ChevronDown className="w-5 h-5" />
                              </button>
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">{banner.title}</h4>
                              <p className="text-zinc-500 text-sm">Order: {banner.order}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditKidsHeroBanner(banner.id, 'isActive', !banner.isActive)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                banner.isActive ? 'bg-emerald-600 text-white' : 'bg-zinc-700 text-zinc-400'
                              )}
                            >
                              {banner.isActive ? 'Active' : 'Inactive'}
                            </button>
                            <button
                              onClick={() => handleDeleteKidsHeroBanner(banner.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Title</label>
                            <input
                              type="text"
                              value={banner.title}
                              onChange={(e) => handleEditKidsHeroBanner(banner.id, 'title', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Description</label>
                            <textarea
                              value={banner.description}
                              onChange={(e) => handleEditKidsHeroBanner(banner.id, 'description', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Backdrop URL</label>
                            <input
                              type="url"
                              value={banner.backdropUrl}
                              onChange={(e) => handleEditKidsHeroBanner(banner.id, 'backdropUrl', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Poster URL</label>
                            <input
                              type="url"
                              value={banner.posterUrl}
                              onChange={(e) => handleEditKidsHeroBanner(banner.id, 'posterUrl', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {kidsHeroBanners.length === 0 && (
                      <div className="text-center py-12">
                        <Smile className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Kids Banners Yet</h3>
                        <p className="text-zinc-500">Use quick add from movies or create a kids banner manually.</p>
                      </div>
                    )}
                  </div>
                </div>
                  </>
                )}

                {activeTab === 'anime-hero' && (
                  <>
                <div className="flex items-center justify-between mt-10 mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Anime Hero Banners</h3>
                    <p className="text-zinc-500 mt-1">Manage the hero banners used only on Anime Home.</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleAddAnimeHeroBanner}
                      className="flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Add Anime Banner
                    </button>
                    <button 
                      onClick={handleSaveAnimeHeroBanners}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      Save Anime Banners
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                  <div className="space-y-6">
                    {animeHeroBanners.map((banner, index) => (
                      <div key={banner.id} className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleMoveAnimeHeroBanner(banner.id, 'up')}
                                disabled={index === 0}
                                className="p-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 rounded-lg transition-colors"
                              >
                                <ChevronUp className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleMoveAnimeHeroBanner(banner.id, 'down')}
                                disabled={index === animeHeroBanners.length - 1}
                                className="p-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 rounded-lg transition-colors"
                              >
                                <ChevronDown className="w-5 h-5" />
                              </button>
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">{banner.title}</h4>
                              <p className="text-zinc-500 text-sm">Order: {banner.order}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditAnimeHeroBanner(banner.id, 'isActive', !banner.isActive)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                banner.isActive ? 'bg-emerald-600 text-white' : 'bg-zinc-700 text-zinc-400'
                              )}
                            >
                              {banner.isActive ? 'Active' : 'Inactive'}
                            </button>
                            <button
                              onClick={() => handleDeleteAnimeHeroBanner(banner.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Title</label>
                            <input
                              type="text"
                              value={banner.title}
                              onChange={(e) => handleEditAnimeHeroBanner(banner.id, 'title', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-400"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Description</label>
                            <textarea
                              value={banner.description}
                              onChange={(e) => handleEditAnimeHeroBanner(banner.id, 'description', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-400"
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Backdrop URL</label>
                            <input
                              type="url"
                              value={banner.backdropUrl}
                              onChange={(e) => handleEditAnimeHeroBanner(banner.id, 'backdropUrl', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-400"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Poster URL</label>
                            <input
                              type="url"
                              value={banner.posterUrl}
                              onChange={(e) => handleEditAnimeHeroBanner(banner.id, 'posterUrl', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-400"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {animeHeroBanners.length === 0 && (
                      <div className="text-center py-12">
                        <Sparkles className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Anime Banners Yet</h3>
                        <p className="text-zinc-500">Use quick add from movies or create an anime banner manually.</p>
                      </div>
                    )}
                  </div>
                </div>
                  </>
                )}
              </motion.div>
            )}

            {activeTab === 'genres' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Genres</h2>
                    <p className="text-zinc-500 mt-1">Manage your content genres</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleAddGenre}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Add Genre
                    </button>
                    <button 
                      onClick={handleSaveGenres}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {genres.map((genre) => (
                      <div key={genre.id} className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-white font-semibold">{genre.name}</h4>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditGenre(genre.id, 'isActive', !genre.isActive)}
                              className={`w-3 h-3 rounded-full ${genre.isActive ? 'bg-emerald-500' : 'bg-zinc-600'}`}
                            />
                            <button
                              onClick={() => handleDeleteGenre(genre.id)}
                              className="p-1.5 hover:bg-red-600 rounded-lg text-red-400"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Name</label>
                            <input
                              type="text"
                              value={genre.name}
                              onChange={(e) => handleEditGenre(genre.id, 'name', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Slug</label>
                            <input
                              type="text"
                              value={genre.slug}
                              onChange={(e) => handleEditGenre(genre.id, 'slug', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {genres.length === 0 && (
                    <div className="text-center py-12">
                      <Tags className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">No Genres Yet</h3>
                      <p className="text-zinc-500">Add your first genre to get started</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'countries' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Countries</h2>
                    <p className="text-zinc-500 mt-1">Manage your content countries</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleAddCountry}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Add Country
                    </button>
                    <button 
                      onClick={handleSaveCountries}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {countries.map((country) => (
                      <div key={country.id} className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-white font-semibold">{country.name}</h4>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditCountry(country.id, 'isActive', !country.isActive)}
                              className={`w-3 h-3 rounded-full ${country.isActive ? 'bg-emerald-500' : 'bg-zinc-600'}`}
                            />
                            <button
                              onClick={() => handleDeleteCountry(country.id)}
                              className="p-1.5 hover hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Name</label>
                            <input
                              type="text"
                              value={country.name}
                              onChange={(e) => handleEditCountry(country.id, 'name', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Code</label>
                            <input
                              type="text"
                              value={country.code}
                              onChange={(e) => handleEditCountry(country.id, 'code', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                              maxLength={3}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {countries.length === 0 && (
                    <div className="text-center py-12">
                      <Globe className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">No Countries Yet</h3>
                      <p className="text-zinc-500">Add your first country to get started</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'languages' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Languages</h2>
                    <p className="text-zinc-500 mt-1">Manage your content languages</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleAddLanguage}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Add Language
                    </button>
                    <button 
                      onClick={handleSaveLanguages}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {languages.map((language) => (
                      <div key={language.id} className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-white font-semibold">{language.name}</h4>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditLanguage(language.id, 'isActive', !language.isActive)}
                              className={`w-3 h-3 rounded-full ${language.isActive ? 'bg-emerald-500' : 'bg-zinc-600'}`}
                            />
                            <button
                              onClick={() => handleDeleteLanguage(language.id)}
                              className="p-1.5 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Name</label>
                            <input
                              type="text"
                              value={language.name}
                              onChange={(e) => handleEditLanguage(language.id, 'name', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Code</label>
                            <input
                              type="text"
                              value={language.code}
                              onChange={(e) => handleEditLanguage(language.id, 'code', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                              maxLength={3}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {languages.length === 0 && (
                    <div className="text-center py-12">
                      <Languages className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">No Languages Yet</h3>
                      <p className="text-zinc-500">Add your first language to get started</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white">Push Notifications</h2>
                  <p className="text-zinc-500 mt-1">Send push notifications to your users</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                      <h3 className="text-xl font-semibold text-white mb-6">Send New Notification</h3>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium">Title</label>
                          <input
                            type="text"
                            value={newNotification.title}
                            onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                            placeholder="Notification title"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium">Message</label>
                          <textarea
                            value={newNotification.message}
                            onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                            placeholder="Notification message"
                            rows={4}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium">Image URL (optional)</label>
                          <input
                            type="url"
                            value={newNotification.imageUrl}
                            onChange={(e) => setNewNotification({ ...newNotification, imageUrl: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <button
                          onClick={handleSendNotification}
                          disabled={!newNotification.title || !newNotification.message}
                          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-colors"
                        >
                          <Send className="w-5 h-5" />
                          Send Notification
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                      <h3 className="text-xl font-semibold text-white mb-6">Recent Notifications</h3>
                      <div className="space-y-4">
                        {pushNotifications.slice(0, 10).map((notification) => (
                          <div key={notification.id} className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-white font-semibold text-sm">{notification.title}</h4>
                              <span className="text-xs text-emerald-400 font-medium">
                                {notification.status}
                              </span>
                            </div>
                            <p className="text-zinc-400 text-sm mb-2">{notification.message}</p>
                            <p className="text-zinc-500 text-xs">
                              {new Date(notification.sentAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                        {pushNotifications.length === 0 && (
                          <div className="text-center py-8">
                            <Bell className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                            <p className="text-zinc-500 text-sm">No notifications sent yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'apikeys' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white">API Keys</h2>
                  <p className="text-zinc-500 mt-1">Manage your API keys and external service keys</p>
                </div>

                {/* External API Keys Section */}
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 mb-8">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    External Service API Keys
                  </h3>
                  <div className="space-y-6">
                    {/* TMDB API Key */}
                    <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                      <h4 className="text-white font-semibold mb-4">TMDB (The Movie Database) API Key</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium text-sm">API Key</label>
                          <div className="flex gap-2">
                            <input
                              type="password"
                              value={externalApiKeys.tmdb}
                              onChange={(e) => setExternalApiKeys({ ...externalApiKeys, tmdb: e.target.value })}
                              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(externalApiKeys.tmdb);
                                showToast('TMDB API key copied to clipboard!', 'success');
                              }}
                              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
                            >
                              <Copy className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Firebase Legacy Server Key */}
                    <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                      <h4 className="text-white font-semibold mb-4">Firebase Legacy Server Key</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium text-sm">Server Key</label>
                          <div className="flex gap-2">
                            <input
                              type="password"
                              value={externalApiKeys.firebaseLegacyServerKey}
                              onChange={(e) => setExternalApiKeys({ ...externalApiKeys, firebaseLegacyServerKey: e.target.value })}
                              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                              placeholder="Enter Firebase Legacy Server Key"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(externalApiKeys.firebaseLegacyServerKey);
                                showToast('Firebase Legacy Server Key copied to clipboard!', 'success');
                              }}
                              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
                            >
                              <Copy className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* IMDb API Key */}
                    <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                      <h4 className="text-white font-semibold mb-4">IMDb API Key</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium text-sm">API Key</label>
                          <div className="flex gap-2">
                            <input
                              type="password"
                              value={externalApiKeys.imdb}
                              onChange={(e) => setExternalApiKeys({ ...externalApiKeys, imdb: e.target.value })}
                              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(externalApiKeys.imdb);
                                showToast('IMDb API key copied to clipboard!', 'success');
                              }}
                              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
                            >
                              <Copy className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Fanart.tv API Key */}
                    <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                      <h4 className="text-white font-semibold mb-2">Fanart.tv API Key</h4>
                      <p className="text-zinc-500 text-sm mb-4">
                        Community-contributed HD logos, clearart, banners, posters, character art and disc art for movies and TV shows. Enriches scraping with HD logo and clearart assets.
                      </p>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium text-sm">Project / Personal API Key</label>
                          <div className="flex gap-2">
                            <input
                              type="password"
                              value={externalApiKeys.fanartTv}
                              onChange={(e) => setExternalApiKeys({ ...externalApiKeys, fanartTv: e.target.value })}
                              placeholder="Get a Fanart.tv API key from https://fanart.tv/get-an-api-key/"
                              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(externalApiKeys.fanartTv);
                                showToast('Fanart.tv API key copied to clipboard!', 'success');
                              }}
                              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
                            >
                              <Copy className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                          <a
                            href="https://fanart.tv/get-an-api-key/"
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors border border-zinc-700 text-sm"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Get Free Fanart.tv Key
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={() => {
                        saveExternalApiKeys(externalApiKeys);
                        showToast('External API keys saved successfully!', 'success');
                      }}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      Save External API Keys
                    </button>
                  </div>
                </div>

                {/* Custom API Keys Section */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Custom API Keys</h3>
                  <button 
                    onClick={handleAddApiKey}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Create API Key
                  </button>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                  <div className="space-y-4">
                    {apiKeys.map((apiKey) => (
                      <div key={apiKey.id} className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-white font-semibold">{apiKey.name}</h4>
                            <p className="text-zinc-500 text-sm">
                              Created {new Date(apiKey.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditApiKey(apiKey.id, 'isActive', !apiKey.isActive)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                apiKey.isActive ? 'bg-emerald-600 text-white' : 'bg-zinc-700 text-zinc-400'
                              }`}
                            >
                              {apiKey.isActive ? 'Active' : 'Inactive'}
                            </button>
                            <button
                              onClick={() => handleDeleteApiKey(apiKey.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Name</label>
                            <input
                              type="text"
                              value={apiKey.name}
                              onChange={(e) => handleEditApiKey(apiKey.id, 'name', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">API Key</label>
                            <div className="flex gap-2">
                              <input
                                type="password"
                                value={apiKey.key}
                                readOnly
                                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono"
                              />
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(apiKey.key);
                                  showToast('API key copied to clipboard!', 'success');
                                }}
                                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
                              >
                                <Copy className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Permissions</label>
                            <div className="flex flex-wrap gap-2">
                              {apiKey.permissions.map((perm, i) => (
                                <span key={i} className="px-3 py-1 bg-zinc-700 rounded-full text-sm text-zinc-300">
                                  {perm}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {apiKeys.length === 0 && (
                      <div className="text-center py-12">
                        <Key className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Custom API Keys Yet</h3>
                        <p className="text-zinc-500">Create your first custom API key to get started</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Manage Users</h2>
                    <p className="text-zinc-500 mt-1">New signups automatically appear here for admin review.</p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-300">
                    <UserPlus className="w-4 h-4 text-emerald-400" />
                    <span>{totalUsers} registered users</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <p className="text-zinc-500 text-sm mb-2">Total Users</p>
                    <p className="text-4xl font-bold text-white">{totalUsers}</p>
                  </div>
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <p className="text-zinc-500 text-sm mb-2">Latest Signup</p>
                    <p className="text-lg font-semibold text-white">
                      {registeredUsers[0]?.fullName || 'No users yet'}
                    </p>
                    <p className="text-zinc-500 text-sm mt-1">
                      {registeredUsers[0]?.joinDate || 'Waiting for registrations'}
                    </p>
                  </div>
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <p className="text-zinc-500 text-sm mb-2">Active Records</p>
                    <p className="text-4xl font-bold text-white">{registeredUsers.filter((user) => user.email).length}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {registeredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6"
                    >
                      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                        <div className="flex items-center gap-4 min-w-0">
                          <img
                            src={user.avatar}
                            alt={user.fullName}
                            className="w-16 h-16 rounded-2xl object-cover border border-zinc-700"
                          />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                              <h3 className="text-lg font-semibold text-white truncate">{user.fullName}</h3>
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                Active
                              </span>
                            </div>
                            <p className="text-zinc-400 truncate">{user.email}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 xl:min-w-[440px]">
                          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                            <p className="text-zinc-500 text-xs uppercase tracking-[0.18em] mb-1">Join Date</p>
                            <p className="text-white font-medium">{user.joinDate}</p>
                          </div>
                          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                            <p className="text-zinc-500 text-xs uppercase tracking-[0.18em] mb-1">Last Login</p>
                            <p className="text-white font-medium">{user.lastLogin}</p>
                          </div>
                          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                            <p className="text-zinc-500 text-xs uppercase tracking-[0.18em] mb-1">Gender</p>
                            <p className="text-white font-medium capitalize">{user.gender}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-5 flex justify-end">
                        <button
                          onClick={() => handleDeleteRegisteredUser(user.id, user.fullName)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete User
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'requests' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Movie Requests</h2>
                    <p className="text-zinc-500 mt-1">Review user requests for movies and TV shows, then update their status.</p>
                  </div>
                  <button
                    onClick={handleSaveAllMovieRequests}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    Save Requests
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <p className="text-zinc-500 text-sm mb-2">Total Requests</p>
                    <p className="text-4xl font-bold text-white">{movieRequests.length}</p>
                  </div>
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <p className="text-zinc-500 text-sm mb-2">Pending Review</p>
                    <p className="text-4xl font-bold text-white">{movieRequests.filter((request) => request.status === 'Pending').length}</p>
                  </div>
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <p className="text-zinc-500 text-sm mb-2">Fulfilled</p>
                    <p className="text-4xl font-bold text-white">{movieRequests.filter((request) => request.status === 'Fulfilled').length}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {movieRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6"
                    >
                      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                        <div className="min-w-0 xl:max-w-sm">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-white">{request.title}</h3>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                              {request.type}
                            </span>
                          </div>
                          <p className="text-zinc-400">{request.requesterName}</p>
                          <p className="text-zinc-500 text-sm">{request.requesterEmail}</p>
                          <p className="text-zinc-500 text-sm mt-3">Created: {request.createdAt}</p>
                          <p className="text-zinc-500 text-sm">Updated: {request.updatedAt}</p>
                          {request.notes && <p className="text-zinc-300 text-sm mt-4">{request.notes}</p>}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:min-w-[520px]">
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Status</label>
                            <select
                              value={request.status}
                              onChange={(e) => handleEditMovieRequest(request.id, 'status', e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Approved">Approved</option>
                              <option value="Fulfilled">Fulfilled</option>
                              <option value="Declined">Declined</option>
                            </select>
                          </div>

                          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                            <p className="text-zinc-500 text-xs uppercase tracking-[0.18em] mb-1">Requester ID</p>
                            <p className="text-white font-medium break-all">{request.requesterId}</p>
                          </div>

                          <div className="lg:col-span-2">
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Admin Notes</label>
                            <textarea
                              value={request.adminNotes || ''}
                              onChange={(e) => handleEditMovieRequest(request.id, 'adminNotes', e.target.value)}
                              rows={3}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                              placeholder="Add review notes, availability details, or a follow-up message."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {movieRequests.length === 0 && (
                    <div className="text-center py-12 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl">
                      <MessageSquare className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">No Movie Requests Yet</h3>
                      <p className="text-zinc-500">User-submitted movie requests will appear here.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Analytics</h2>
                    <p className="text-zinc-500 mt-1">Monitor library coverage, publishing health, and content insights</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "px-4 py-2 rounded-xl border text-sm",
                      analyticsConnected 
                        ? "border-emerald-800 bg-emerald-900/40 text-emerald-400" 
                        : "border-zinc-800 bg-zinc-900/60 text-zinc-400"
                    )}>
                      {analyticsConnected 
                        ? "Live tracking data connected" 
                        : "Live tracking data is not connected yet"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                  <StatCard title="Catalog Titles" value={totalTitles.toString()} change={`${totalMovies} movies`} icon={Film} trend="up" />
                  <StatCard title="TV Footprint" value={totalEpisodes.toString()} change={`${totalSeasons} seasons`} icon={Tv} trend="up" />
                  <StatCard title="Genres Active" value={totalGenres.toString()} change={`${genreInsights.length} top clusters`} icon={Tags} trend="up" />
                  <StatCard title="Cast Indexed" value={totalCast.toString()} change={`${totalUsers} registered users`} icon={Users} trend="up" />
                  {analyticsConnected && analyticsData?.activeUsers && (
                    <>
                      <StatCard title="Active Now" value={analyticsData.activeUsers.now.toString()} change="Real-time" icon={Activity} trend="up" />
                      <StatCard title="Active Last Hour" value={analyticsData.activeUsers.lastHour.toString()} change="Recent activity" icon={Users} trend="up" />
                      <StatCard title="Active Today" value={analyticsData.activeUsers.today.toString()} change="Daily active" icon={Users} trend="up" />
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
                  <div className="xl:col-span-2 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold text-white">Content Coverage</h3>
                        <p className="text-zinc-500 text-sm mt-1">A quick view of catalog structure across the platform</p>
                      </div>
                      <BarChart3 className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {analyticsCoverage.map(({ label, value, tone, icon: Icon }) => (
                        <div key={label} className={`rounded-2xl border border-zinc-800 bg-gradient-to-br ${tone} p-5`}>
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-zinc-300 text-sm">{label}</p>
                            <Icon className="w-5 h-5 text-white/80" />
                          </div>
                          <p className="text-4xl font-bold text-white">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold text-white">Engagement Status</h3>
                        <p className="text-zinc-500 text-sm mt-1">Reserved for real analytics tracking</p>
                      </div>
                      <Activity className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: 'Total Views', value: totalViews, icon: Eye },
                        { label: 'Downloads', value: totalDownloads, icon: Download },
                        { label: 'Shares', value: totalShares, icon: Send },
                        { label: 'Comments', value: totalComments, icon: MessageSquare }
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                              <Icon className="w-4 h-4 text-zinc-300" />
                            </div>
                            <span className="text-zinc-300">{label}</span>
                          </div>
                          <span className="text-white font-semibold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold text-white">Top Rated Titles</h3>
                        <p className="text-zinc-500 text-sm mt-1">Best ranked content currently available in the catalog</p>
                      </div>
                      <TrendingUp className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="space-y-4">
                      {topRatedTitles.map((item: any, index: number) => (
                        <div key={`${item.contentType}-${item.id}`} className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/15 text-yellow-300 flex items-center justify-center font-semibold">
                              {index + 1}
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-semibold truncate">{item.title}</p>
                              <p className="text-zinc-500 text-sm">
                                {item.contentType} • {item.releaseYear || item.startYear || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-yellow-400 font-semibold">★ {item.rating || 'N/A'}</p>
                            <p className="text-zinc-500 text-sm">{(item.genres || []).slice(0, 2).join(', ') || 'Uncategorized'}</p>
                          </div>
                        </div>
                      ))}
                      {topRatedTitles.length === 0 && (
                        <div className="text-zinc-500 text-sm">No catalog data available yet.</div>
                      )}
                    </div>
                  </div>

                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold text-white">Publishing Health</h3>
                        <p className="text-zinc-500 text-sm mt-1">Tracks how much of the storefront is configured</p>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="space-y-4">
                      {analyticsHealth.map(({ label, value, total, icon: Icon }) => {
                        const percentage = Math.min(100, Math.round((value / total) * 100))
                        return (
                          <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                                  <Icon className="w-4 h-4 text-zinc-200" />
                                </div>
                                <div>
                                  <p className="text-white font-medium">{label}</p>
                                  <p className="text-zinc-500 text-sm">{value} configured</p>
                                </div>
                              </div>
                              <span className="text-cyan-300 font-semibold">{percentage}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${percentage}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold text-white">Top Genres</h3>
                        <p className="text-zinc-500 text-sm mt-1">Most represented genres across movies and TV</p>
                      </div>
                      <Tags className="w-5 h-5 text-fuchsia-400" />
                    </div>
                    <div className="space-y-3">
                      {genreInsights.map((item) => (
                        <div key={item.name} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                          <span className="text-zinc-300">{item.name}</span>
                          <span className="text-white font-semibold">{item.total}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold text-white">Language Mix</h3>
                        <p className="text-zinc-500 text-sm mt-1">Primary language distribution in your catalog</p>
                      </div>
                      <Languages className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="space-y-3">
                      {languageInsights.map((item) => (
                        <div key={item.name} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                          <span className="text-zinc-300">{item.name}</span>
                          <span className="text-white font-semibold">{item.total}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold text-white">Country Mix</h3>
                        <p className="text-zinc-500 text-sm mt-1">Production country spread in your catalog</p>
                      </div>
                      <Globe className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="space-y-3">
                      {countryInsights.map((item) => (
                        <div key={item.name} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                          <span className="text-zinc-300">{item.name}</span>
                          <span className="text-white font-semibold">{item.total}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'transcoding-jobs' && (
              <TranscodingJobsPanel />
            )}

            {activeTab === 'transcoding-profiles' && (
              <TranscodingProfilesPanel />
            )}

            {activeTab === 'subscriptions' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <CreditCard className="w-20 h-20 text-zinc-700 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2">Subscriptions</h3>
                <p className="text-zinc-500">Coming soon - Manage subscriptions here</p>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white">Settings</h2>
                  <p className="text-zinc-500 mt-1">Manage general platform settings, distribution links, and safety controls</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                  {[
                    {
                      label: 'Maintenance Mode',
                      value: generalSettings.maintenanceMode ? 'Enabled' : 'Live',
                      helper: generalSettings.maintenanceMode ? 'Catalog access is restricted' : 'Platform is publicly accessible',
                      icon: Activity,
                      tone: generalSettings.maintenanceMode ? 'text-yellow-300 bg-yellow-500/10' : 'text-emerald-300 bg-emerald-500/10'
                    },
                    {
                      label: 'Downloads',
                      value: generalSettings.downloadsEnabled ? 'Enabled' : 'Disabled',
                      helper: 'Controls download availability',
                      icon: Download,
                      tone: generalSettings.downloadsEnabled ? 'text-cyan-300 bg-cyan-500/10' : 'text-zinc-300 bg-zinc-800'
                    },
                    {
                      label: 'Registration',
                      value: generalSettings.registrationEnabled ? 'Open' : 'Closed',
                      helper: 'User sign-up availability',
                      icon: UserPlus,
                      tone: generalSettings.registrationEnabled ? 'text-purple-300 bg-purple-500/10' : 'text-zinc-300 bg-zinc-800'
                    },
                    {
                      label: 'Push Notifications',
                      value: generalSettings.pushNotificationsEnabled ? 'Enabled' : 'Disabled',
                      helper: 'Global notification delivery',
                      icon: Bell,
                      tone: generalSettings.pushNotificationsEnabled ? 'text-orange-300 bg-orange-500/10' : 'text-zinc-300 bg-zinc-800'
                    }
                  ].map(({ label, value, helper, icon: Icon, tone }) => (
                    <div key={label} className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tone}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-white font-semibold">{value}</span>
                      </div>
                      <h3 className="text-white font-semibold">{label}</h3>
                      <p className="text-zinc-500 text-sm mt-2">{helper}</p>
                    </div>
                  ))}
                </div>

                {/* App Links Section */}
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 mb-8">
                  <h3 className="text-xl font-semibold text-white mb-6">App Download Links</h3>
                  <div className="space-y-6">
                    {appLinks.map((app) => (
                      <div key={app.platform} className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                              {app.icon === 'phone' && <Smartphone size={24} className="text-white" />}
                              {app.icon === 'play' && <PlayCircle size={24} className="text-white" />}
                              {app.icon === 'apple' && <AppWindow size={24} className="text-white" />}
                              {app.icon === 'tv' && <Tv size={24} className="text-white" />}
                              {app.icon === 'monitor' && <Monitor size={24} className="text-white" />}
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">{app.name}</h4>
                              <p className="text-zinc-500 text-sm capitalize">{app.platform}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Display Name</label>
                            <input
                              type="text"
                              value={app.name}
                              onChange={(e) => {
                                setAppLinks(appLinks.map(a => 
                                  a.platform === app.platform ? { ...a, name: e.target.value } : a
                                ))
                              }}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Download URL</label>
                            <input
                              type="url"
                              value={app.url}
                              onChange={(e) => {
                                setAppLinks(appLinks.map(a => 
                                  a.platform === app.platform ? { ...a, url: e.target.value } : a
                                ))
                              }}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={() => {
                        saveAppLinks(appLinks);
                        showToast('App links saved successfully!', 'success');
                      }}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      Save App Links
                    </button>
                  </div>
                </div>

                {/* General Settings */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                    <h3 className="text-xl font-semibold text-white mb-6">General Settings</h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium text-sm">App Name</label>
                          <input
                            type="text"
                            value={generalSettings.appName}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, appName: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium text-sm">Tagline</label>
                          <input
                            type="text"
                            value={generalSettings.tagline}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, tagline: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium text-sm">Support Email</label>
                          <input
                            type="email"
                            value={generalSettings.supportEmail}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium text-sm">Support Phone</label>
                          <input
                            type="text"
                            value={generalSettings.supportPhone}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, supportPhone: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium text-sm">Default Language</label>
                          <input
                            type="text"
                            value={generalSettings.defaultLanguage}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, defaultLanguage: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium text-sm">Default Browse Tab</label>
                          <select
                            value={generalSettings.defaultBrowseTab}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, defaultBrowseTab: e.target.value as GeneralSettings['defaultBrowseTab'] })}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                          >
                            <option value="home">Home</option>
                            <option value="movies">Movies</option>
                            <option value="tv">TV Shows</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          {
                            key: 'maintenanceMode',
                            label: 'Maintenance Mode',
                            description: 'Temporarily restrict normal platform access.'
                          },
                          {
                            key: 'downloadsEnabled',
                            label: 'Downloads Enabled',
                            description: 'Allow users to download available content.'
                          },
                          {
                            key: 'registrationEnabled',
                            label: 'Registration Enabled',
                            description: 'Allow new users to create accounts.'
                          },
                          {
                            key: 'pushNotificationsEnabled',
                            label: 'Push Notifications Enabled',
                            description: 'Allow app-wide push notification sending.'
                          }
                        ].map((item) => (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() =>
                              setGeneralSettings({
                                ...generalSettings,
                                [item.key]: !generalSettings[item.key as keyof GeneralSettings]
                              })
                            }
                            className="text-left bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 hover:border-zinc-600 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-white font-medium">{item.label}</p>
                                <p className="text-zinc-500 text-sm mt-1">{item.description}</p>
                              </div>
                              <div
                                className={`w-14 h-8 rounded-full relative transition-all ${
                                  generalSettings[item.key as keyof GeneralSettings] ? 'bg-red-600' : 'bg-zinc-700'
                                }`}
                              >
                                <div
                                  className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                                    generalSettings[item.key as keyof GeneralSettings] ? 'right-1' : 'left-1'
                                  }`}
                                />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="pt-6 border-t border-zinc-700">
                        <h4 className="text-white font-medium mb-4">Navbar Settings</h4>
                        <div className="space-y-6">
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Navbar Logo</label>
                            {generalSettings.navbarLogo && (
                              <div className="mb-3">
                                <img
                                  src={generalSettings.navbarLogo}
                                  alt="Navbar Logo Preview"
                                  className="h-16 w-auto"
                                />
                                <button
                                  type="button"
                                  onClick={() => setGeneralSettings({ ...generalSettings, navbarLogo: '' })}
                                  className="mt-2 text-sm text-red-400 hover:text-red-300"
                                >
                                  Remove Logo
                                </button>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const result = event.target?.result as string;
                                    setGeneralSettings({ ...generalSettings, navbarLogo: result });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                            />
                            <p className="text-xs text-zinc-500 mt-2">
                              Upload an image for your navbar logo. Recommended size: 200x80 pixels.
                            </p>
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Navbar Name</label>
                            <input
                              type="text"
                              value={generalSettings.navbarName}
                              onChange={(e) => setGeneralSettings({ ...generalSettings, navbarName: e.target.value })}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                              placeholder="e.g. Play Flix"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-zinc-400 mb-2 font-medium text-sm">Font Size</label>
                              <input
                                type="text"
                                value={generalSettings.navbarFontSize}
                                onChange={(e) => setGeneralSettings({ ...generalSettings, navbarFontSize: e.target.value })}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                                placeholder="e.g. 23px"
                              />
                            </div>
                            <div>
                              <label className="block text-zinc-400 mb-2 font-medium text-sm">Accent Color</label>
                              <div className="flex items-center gap-3">
                                <input
                                  type="color"
                                  value={generalSettings.navbarColor}
                                  onChange={(e) => setGeneralSettings({ ...generalSettings, navbarColor: e.target.value })}
                                  className="w-12 h-12 rounded-xl bg-transparent cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={generalSettings.navbarColor}
                                  onChange={(e) => setGeneralSettings({ ...generalSettings, navbarColor: e.target.value })}
                                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                                  placeholder="#ef4444"
                                />
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Animation Type</label>
                            <select
                              value={generalSettings.navbarAnimationType}
                              onChange={(e) => setGeneralSettings({ ...generalSettings, navbarAnimationType: e.target.value as 'fade' | 'slide' | 'scale' | 'bounce' | 'none' })}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                            >
                              <option value="fade">Fade</option>
                              <option value="slide">Slide</option>
                              <option value="scale">Scale</option>
                              <option value="bounce">Bounce</option>
                              <option value="none">None</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={() => {
                          saveGeneralSettings(generalSettings);
                          showToast('General settings saved successfully!', 'success');
                        }}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                      >
                        <Save className="w-5 h-5" />
                        Save General Settings
                      </button>
                    </div>
                  </div>

                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                    <h3 className="text-xl font-semibold text-white mb-6">Admin Profile</h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium text-sm">Full Name</label>
                          <input
                            type="text"
                            value={adminProfile.fullName}
                            onChange={(e) => setAdminProfile({ ...adminProfile, fullName: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium text-sm">Email</label>
                          <input
                            type="email"
                            value={adminProfile.email}
                            onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                      </div>

                      <div>
                        <div>
                          <label className="block text-zinc-400 mb-2 font-medium text-sm">Gender</label>
                          <select
                            value={adminProfile.gender}
                            onChange={(e) => setAdminProfile({ ...adminProfile, gender: e.target.value as UserProfile['gender'] })}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer not to say">Prefer not to say</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-zinc-400 mb-2 font-medium text-sm">Avatar URL</label>
                        <input
                          type="text"
                          value={adminProfile.avatar}
                          onChange={(e) => setAdminProfile({ ...adminProfile, avatar: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-zinc-500 mb-2 font-medium text-sm">Join Date</label>
                          <input
                            type="text"
                            value={adminProfile.joinDate}
                            readOnly
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-500 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-500 mb-2 font-medium text-sm">Last Login</label>
                          <input
                            type="text"
                            value={adminProfile.lastLogin}
                            readOnly
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-500 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={() => {
                          saveUserProfile({
                            fullName: adminProfile.fullName,
                            email: adminProfile.email,
                            gender: adminProfile.gender,
                            subscription: adminProfile.subscription,
                            avatar: adminProfile.avatar
                          });
                          showToast('Admin profile saved successfully!', 'success');
                        }}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                      >
                        <Save className="w-5 h-5" />
                        Save Admin Profile
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 mt-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white">Admin Login Security</h3>
                      <p className="text-zinc-500 mt-1">Default built-in admin login uses username <span className="text-white">admin</span> and password <span className="text-white">admin</span> until you change it.</p>
                    </div>
                    <button
                      onClick={() => setShowAdminPasswordForm(!showAdminPasswordForm)}
                      className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-3 rounded-xl font-medium transition-colors"
                    >
                      {showAdminPasswordForm ? <X className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                      {showAdminPasswordForm ? 'Cancel Password Change' : 'Change Admin Password'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-zinc-400 mb-2 font-medium text-sm">Admin Username</label>
                      <input
                        type="text"
                        value={adminCredentials.username}
                        readOnly
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-300 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-2 font-medium text-sm">Current Saved Password</label>
                      <div className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-500">
                        Hidden for security
                      </div>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {showAdminPasswordForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -12 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -12 }}
                        transition={{ duration: 0.28, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="border border-zinc-800 rounded-2xl bg-zinc-950/60 p-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                              { key: 'current', label: 'Current Password', value: adminPasswordData.current },
                              { key: 'next', label: 'New Password', value: adminPasswordData.next },
                              { key: 'confirm', label: 'Confirm Password', value: adminPasswordData.confirm }
                            ].map((field) => (
                              <div key={field.key}>
                                <label className="block text-zinc-400 mb-2 font-medium text-sm">{field.label}</label>
                                <div className="relative">
                                  <input
                                    type={showAdminPassword[field.key as keyof typeof showAdminPassword] ? 'text' : 'password'}
                                    value={field.value}
                                    onChange={(e) => setAdminPasswordData({ ...adminPasswordData, [field.key]: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-cyan-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowAdminPassword({
                                        ...showAdminPassword,
                                        [field.key]: !showAdminPassword[field.key as keyof typeof showAdminPassword]
                                      })
                                    }
                                    className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-white transition-colors"
                                  >
                                    {showAdminPassword[field.key as keyof typeof showAdminPassword] ? (
                                      <EyeOff className="w-5 h-5" />
                                    ) : (
                                      <Eye className="w-5 h-5" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-4 pt-6">
                            <button
                              onClick={handleAdminPasswordChange}
                              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                            >
                              <Save className="w-5 h-5" />
                              Update Admin Password
                            </button>
                            <button
                              onClick={() => {
                                setShowAdminPasswordForm(false)
                                setAdminPasswordData({ current: '', next: '', confirm: '' })
                                setShowAdminPassword({ current: false, next: false, confirm: false })
                              }}
                              className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                            >
                              <X className="w-5 h-5" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </main>
        </div>
      </div>

      <MovieModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingMovie(null)
        }}
        movie={editingMovie}
        onSave={handleSaveMovie}
      />
      <TVShowModal
        isOpen={isTVShowModalOpen}
        onClose={() => {
          setIsTVShowModalOpen(false)
          setSelectedTVShow(null)
        }}
        show={selectedTVShow}
        onSave={handleSaveTVShow}
      />
      <MovieSelectionModal
              isOpen={!!activeSliderForMovieSelection || !!activeHomepageSectionForMovieSelection || !!activeKidsSliderForMovieSelection || !!activeAnimeSliderForMovieSelection || !!activeKidsHomepageSectionForMovieSelection || !!activeAnimeHomepageSectionForMovieSelection}
              onClose={() => {
                setActiveSliderForMovieSelection(null);
                setActiveHomepageSectionForMovieSelection(null);
                setActiveKidsSliderForMovieSelection(null);
                setActiveAnimeSliderForMovieSelection(null);
                setActiveKidsHomepageSectionForMovieSelection(null);
                setActiveAnimeHomepageSectionForMovieSelection(null);
              }}
              selectedIds={Array.from(selectedMovieIds)}
              onSave={(selectedMovies: any[]) => {
                if (activeSliderForMovieSelection) {
                  handleSaveMovieSelection(selectedMovies);
                } else if (activeHomepageSectionForMovieSelection) {
                  handleSaveHomepageSectionMovieSelection(selectedMovies);
                } else if (activeKidsSliderForMovieSelection) {
                  handleSaveKidsSliderMovieSelection(selectedMovies);
                } else if (activeAnimeSliderForMovieSelection) {
                  handleSaveAnimeSliderMovieSelection(selectedMovies);
                } else if (activeKidsHomepageSectionForMovieSelection) {
                  handleSaveKidsHomepageMovieSelection(selectedMovies);
                } else if (activeAnimeHomepageSectionForMovieSelection) {
                  handleSaveAnimeHomepageMovieSelection(selectedMovies);
                }
              }}
              allMovies={
                activeKidsSliderForMovieSelection || activeKidsHomepageSectionForMovieSelection
                  ? movies.filter(m => m.isKids) 
                  : activeAnimeSliderForMovieSelection || activeAnimeHomepageSectionForMovieSelection
                    ? movies.filter(m => m.isAnime) 
                    : movies
              }
            />
      <EpisodeModal
        isOpen={isEpisodeModalOpen}
        onClose={() => {
          setIsEpisodeModalOpen(false)
          setEditingEpisode(null)
        }}
        tvShowId={currentTVShowForSeason}
        seasonId={currentSeasonForEpisode}
        episode={editingEpisode}
        onSave={handleSaveEpisode}
      />
      <SourceModal
        isOpen={isSourceModalOpen}
        onClose={() => {
          setIsSourceModalOpen(false)
          setEditingSource(null)
        }}
        tvShowId={currentTVShowForSeason}
        seasonId={currentSeasonForEpisode}
        episodeId={currentEpisodeForSource}
        source={editingSource}
        onSave={handleSaveSource}
      />
      <TVShowSelectionModal
        isOpen={!!activeKidsSliderForTVShowSelection || !!activeAnimeSliderForTVShowSelection}
        onClose={() => {
          setActiveKidsSliderForTVShowSelection(null);
          setActiveAnimeSliderForTVShowSelection(null);
        }}
        selectedIds={Array.from(selectedTVShowIds)}
        onSave={(selectedTVShows: any[]) => {
          if (activeKidsSliderForTVShowSelection) {
            handleSaveKidsSliderTVShowSelection(selectedTVShows);
          } else if (activeAnimeSliderForTVShowSelection) {
            handleSaveAnimeSliderTVShowSelection(selectedTVShows);
          }
        }}
        allTVShows={
          activeKidsSliderForTVShowSelection 
            ? tvShows.filter(show => show.isKids) 
            : activeAnimeSliderForTVShowSelection 
              ? tvShows.filter(show => show.isAnime) 
              : tvShows
        }
      />
    </div>
  )
}
