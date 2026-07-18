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
  Radio,
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
  Wifi
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { API_BASE } from '@/lib/api';
import { sampleMovies, getAppLinks, saveAppLinks, AppLink, getGeneralSettings, saveGeneralSettings, GeneralSettings, getParentalControlSettings, saveParentalControlSettings, ParentalControlSettings, getLiveTVChannels, saveLiveTVChannels, LiveTVChannel, getHeroBanners, saveHeroBanners, getKidsHeroBanners, saveKidsHeroBanners, getAnimeHeroBanners, saveAnimeHeroBanners, HeroBanner, getGenres, saveGenres, Genre, getCountries, saveCountries, Country, getLanguages, saveLanguages, Language, getPushNotifications, savePushNotifications, PushNotification, getApiKeys, saveApiKeys, ApiKey, getExternalApiKeys, saveExternalApiKeys, ExternalApiKeys, getSliderSections, saveSliderSections, getKidsSliderSections, saveKidsSliderSections, getAnimeSliderSections, saveAnimeSliderSections, SliderSection, getHomepageSections, saveHomepageSections, getKidsHomepageSections, saveKidsHomepageSections, getAnimeHomepageSections, saveAnimeHomepageSections, HomepageSection, searchTMDB, getTMDBDetails, getTMDBSeasonDetails, convertTMDBToMovie, convertTMDBToTVShow, convertTMDBToTVShowWithEpisodes, getMovies, saveMovies, getTVShows, saveTVShows, Movie, MovieSource, CastMember, CrewMember, Season, Episode, getScrapingConfig, saveScrapingConfig, addScrapingJob, updateScrapingJob, ScrapingConfig, ScrapingJob, ScraperSource, parseFilename, getUserProfile, saveUserProfile, UserProfile, getAdminCredentials, saveAdminCredentials, AdminCredentials, isAdminAuthenticated, logoutAdmin, getUsers, AppUser, getMovieRequests, saveMovieRequests, MovieRequest, TVShow, getXtreamConfigs, saveXtreamConfigs, getActiveXtreamConfig, setActiveXtreamConfig, XtreamConfig } from '@/lib/data';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

function createClientId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
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

const AdminSidebar = ({ activeTab, setActiveTab }: any) => {
  const isHomeTabActive = ['home', 'kids-home', 'anime-home'].includes(activeTab)
  const [homeDropdownOpen, setHomeDropdownOpen] = useState(isHomeTabActive)
  const isSliderTabActive = ['sliders', 'kids-sliders', 'anime-sliders'].includes(activeTab)
  const [sliderDropdownOpen, setSliderDropdownOpen] = useState(isSliderTabActive)
  const isImportTabActive = ['import-movies', 'import-tv', 'import-livetv'].includes(activeTab)
  const [importDropdownOpen, setImportDropdownOpen] = useState(isImportTabActive)
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
        { id: 'import-livetv', label: 'Import Live TV', icon: Radio },
      ]
    },
    { id: 'scraping', label: 'Automated Scraping', icon: RefreshCw },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'tv', label: 'TV Shows', icon: Tv },
    { id: 'castcrew', label: 'Cast', icon: Users },
    { id: 'livetv', label: 'Live TV', icon: Radio },
    { id: 'xtream-api', label: 'Xtream API', icon: Wifi },
    { id: 'herobanner', label: 'Hero Banner', icon: Image },
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
  }, [isHomeTabActive, isSliderTabActive, isImportTabActive])

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
            const dropdownOpen = isHomeGroup
              ? homeDropdownOpen
              : isSliderGroup
                ? sliderDropdownOpen
                : importDropdownOpen
            const setDropdownOpen = isHomeGroup
              ? setHomeDropdownOpen
              : isSliderGroup
                ? setSliderDropdownOpen
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

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileHomeDropdownOpen, setMobileHomeDropdownOpen] = useState(false)
  const [mobileSliderDropdownOpen, setMobileSliderDropdownOpen] = useState(false)
  const [mobileImportDropdownOpen, setMobileImportDropdownOpen] = useState(false)
  const [movies, setMovies] = useState<Movie[]>(() => getMovies())
  const [tvShows, setTvShows] = useState<any[]>(() => getTVShows())
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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [adminProfile, setAdminProfile] = useState<UserProfile>(() => getUserProfile())
  const [registeredUsers, setRegisteredUsers] = useState<AppUser[]>(() => getUsers())
  const [movieRequests, setMovieRequests] = useState<MovieRequest[]>(() => getMovieRequests())
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>(() => getAdminCredentials())
  const [appLinks, setAppLinks] = useState<AppLink[]>(() => getAppLinks())
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(() => getGeneralSettings())
  const [adminParentalSettings, setAdminParentalSettings] = useState<ParentalControlSettings>(() => getParentalControlSettings())
  const [liveTVChannels, setLiveTVChannels] = useState<LiveTVChannel[]>(() => getLiveTVChannels())
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>(() => getHeroBanners())
  const [kidsHeroBanners, setKidsHeroBanners] = useState<HeroBanner[]>(() => getKidsHeroBanners())
  const [animeHeroBanners, setAnimeHeroBanners] = useState<HeroBanner[]>(() => getAnimeHeroBanners())
  const [genres, setGenres] = useState<Genre[]>(() => getGenres())
  const [countries, setCountries] = useState<Country[]>(() => getCountries())
  const [languages, setLanguages] = useState<Language[]>(() => getLanguages())
  const [pushNotifications, setPushNotifications] = useState<PushNotification[]>(() => getPushNotifications())
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(() => getApiKeys());
  const [externalApiKeys, setExternalApiKeys] = useState<ExternalApiKeys>(() => getExternalApiKeys());
  const [xtreamConfigs, setXtreamConfigs] = useState<XtreamConfig[]>(() => getXtreamConfigs());
  const [sliderSections, setSliderSections] = useState<SliderSection[]>(() => getSliderSections())
  const [kidsSliderSections, setKidsSliderSections] = useState<SliderSection[]>(() => getKidsSliderSections())
  const [animeSliderSections, setAnimeSliderSections] = useState<SliderSection[]>(() => getAnimeSliderSections())
  const [homepageSections, setHomepageSections] = useState<HomepageSection[]>(() => getHomepageSections())
  const [kidsHomepageSections, setKidsHomepageSections] = useState<HomepageSection[]>(() => getKidsHomepageSections())
  const [animeHomepageSections, setAnimeHomepageSections] = useState<HomepageSection[]>(() => getAnimeHomepageSections())
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
  const [scrapingConfig, setScrapingConfig] = useState<ScrapingConfig>(() => getScrapingConfig())
  const [isScraping, setIsScraping] = useState(false);
  const [selectedLocalFiles, setSelectedLocalFiles] = useState<File[]>([]);
  
  // Server Health State
  const [serverHealth, setServerHealth] = useState({
    frontend: { status: 'checking', lastChecked: null, responseTime: 0 },
    backend: { status: 'checking', lastChecked: null, responseTime: 0 },
    database: { status: 'checking', lastChecked: null, responseTime: 0 },
    uptime: 0
  });
  const [isProcessingLocalFiles, setIsProcessingLocalFiles] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false)
  const [isAdminAccessReady, setIsAdminAccessReady] = useState(false)
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
    setIsAdminAccessReady(true)
  }, [router])

  useEffect(() => {
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
  }, [])

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
        { id: 'import-livetv', label: 'Import Live TV', icon: Radio },
      ],
    },
    { id: 'scraping', label: 'Automated Scraping', icon: RefreshCw },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'tv', label: 'TV Shows', icon: Tv },
    { id: 'castcrew', label: 'Cast', icon: Users },
    { id: 'livetv', label: 'Live TV', icon: Radio },
    { id: 'xtream-api', label: 'Xtream API', icon: Wifi },
    { id: 'herobanner', label: 'Hero Banner', icon: Image },
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
    if (['import-movies', 'import-tv', 'import-livetv'].includes(activeTab)) {
      setMobileImportDropdownOpen(true)
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
    // Frontend Health
    const frontendStart = Date.now();
    await new Promise(r => setTimeout(r, 50 + Math.random() * 100));
    const frontendResponseTime = Date.now() - frontendStart;
    
    let backendStatus = 'unhealthy';
    let backendResponseTime = 0;
    let backendData: any = null;
    const backendStart = Date.now();
    try {
      const res = await fetch(`${API_BASE}/api/server-health`);
      backendResponseTime = Date.now() - backendStart;
      if (res.ok) {
        backendStatus = 'healthy';
        backendData = await res.json();
      }
    } catch (err) {
      backendStatus = 'unhealthy';
    }
    
    // Database Health (we'll check via backend response if available)
    let dbStatus = 'checking';
    let dbResponseTime = 0;
    if (backendData) {
      // If backend is healthy, assume DB is healthy too for now
      dbStatus = 'healthy';
      dbResponseTime = 50 + Math.random() * 50;
    }
    
    setServerHealth({
      frontend: { 
        status: 'healthy', 
        lastChecked: now, 
        responseTime: frontendResponseTime 
      },
      backend: { 
        status: backendStatus, 
        lastChecked: now, 
        responseTime: backendResponseTime,
        ...backendData
      },
      database: { 
        status: dbStatus, 
        lastChecked: now, 
        responseTime: dbResponseTime 
      },
      uptime: backendData?.uptime?.seconds || 0
    });
  }

  // Periodic Health Check
  useEffect(() => {
    checkServerHealth();
    const interval = setInterval(() => {
      checkServerHealth();
    }, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAdminPasswordChange = () => {
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

    const updatedCredentials = {
      ...adminCredentials,
      password: adminPasswordData.next
    }

    saveAdminCredentials(updatedCredentials)
    setAdminCredentials(updatedCredentials)
    setAdminPasswordData({ current: '', next: '', confirm: '' })
    setShowAdminPassword({
      current: false,
      next: false,
      confirm: false
    })
    setShowAdminPasswordForm(false)
    showToast('Admin password updated successfully!', 'success')
  }

  const handleAdminLogout = () => {
    logoutAdmin()
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
  const totalLiveChannels = liveTVChannels.length
  const totalGenres = genres.filter((genre) => genre.isActive).length
  const totalCast = movies.reduce((total, movie) => total + (movie.cast?.length || 0), 0)
    + tvShows.reduce((total, show) => total + (show.cast?.length || 0), 0)
  const totalUsers = registeredUsers.length
  const totalComments = 0
  const totalViews = 0
  const totalDownloads = 0
  const totalShares = 0
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

  const handleSearch = async (query = searchQuery, e?: React.FormEvent) => {
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
        handleSearch(searchQuery)
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
        const movie = convertTMDBToMovie(details)
        const newMovies = [...movies, movie]
        setMovies(newMovies)
        saveMovies(newMovies)
      } else {
        const show = await convertTMDBToTVShowWithEpisodes(details)
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

  const handleStartScraping = async (type: 'movie' | 'tv' | 'all') => {
    const newJob = addScrapingJob({ type: type })
    setIsScraping(true)
    updateScrapingJob(newJob.id, { status: 'running' })
    
    try {
      // Simulate scraping with sample popular content from TMDB
      const sampleQueries = ['Inception', 'The Dark Knight', 'Interstellar', 'The Matrix', 'Forrest Gump']
      let itemsProcessed = 0
      let itemsAdded = 0
      const errors: string[] = []
      
      for (const query of sampleQueries) {
        try {
          itemsProcessed++
          if (type === 'all' || type === 'movie') {
            const movieResults = await searchTMDB(query, 'movie')
            if (movieResults && movieResults.length > 0) {
              const details = await getTMDBDetails(movieResults[0].id, 'movie')
              const movie = convertTMDBToMovie(details)
              const exists = movies.some(m => m.title === movie.title)
              if (!exists) {
                const newMovies = [...movies, movie]
                setMovies(newMovies)
                saveMovies(newMovies)
                itemsAdded++
              }
            }
          }
          
          updateScrapingJob(newJob.id, { itemsProcessed, itemsAdded, errors })
          
          // Add a small delay to simulate scraping
          await new Promise(resolve => setTimeout(resolve, 500))
        } catch (err) {
          errors.push(`Error scraping query "${query}": ${(err as Error).message}`)
        }
      }
      
      updateScrapingJob(newJob.id, { 
        status: 'completed', 
        endTime: new Date().toISOString(),
        itemsProcessed,
        itemsAdded,
        errors 
      })
      
      showToast(`Scraping completed successfully! ${itemsAdded} new items added!`, 'success')
    } catch (error) {
      updateScrapingJob(newJob.id, { 
        status: 'failed', 
        endTime: new Date().toISOString(),
        errors: [...scrapingConfig.scrapingJobs.find(j => j.id === newJob.id)?.errors || [], (error as Error).message]
      })
      showToast(`Scraping failed: ${(error as Error).message}`, 'error')
    } finally {
      setIsScraping(false)
    }
  }

  const handleUpdateScrapingConfig = () => {
    saveScrapingConfig(scrapingConfig)
    showToast('Scraping configuration saved successfully!', 'success')
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
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
    
    let itemsProcessed = 0;
    let itemsAdded = 0;
    const errors: string[] = [];
    
    try {
      for (const file of selectedLocalFiles) {
        itemsProcessed++;
        try {
          const parsed = parseFilename(file.name);
          
          if (parsed.title) {
            if (parsed.type === 'movie') {
              // Try to find movie on TMDB
              try {
                const searchResults = await searchTMDB(parsed.title, 'movie');
                if (searchResults && searchResults.length > 0) {
                  const details = await getTMDBDetails(searchResults[0].id, 'movie');
                  const movie = convertTMDBToMovie(details);
                  
                  // Create a local source
                  const localSource: MovieSource = {
                    id: Date.now().toString(),
                    title: file.name,
                    quality: scrapingConfig.defaultQuality,
                    size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
                    type: 'Local Storage',
                    isLocal: true,
                    url: URL.createObjectURL(file)
                  };
                  
                  movie.sources = [localSource];
                  
                  // Check if movie already exists
                  const exists = movies.some(m => m.title === movie.title);
                  if (!exists) {
                    const newMovies = [...movies, movie];
                    setMovies(newMovies);
                    saveMovies(newMovies);
                    itemsAdded++;
                  }
                }
              } catch (err) {
                // If TMDB fails, add as basic movie
                const basicMovie: Movie = {
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
                  quality: scrapingConfig.defaultQuality,
                  studio: '',
                  director: '',
                  sources: [{
                    id: Date.now().toString(),
                    title: file.name,
                    quality: scrapingConfig.defaultQuality,
                    size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
                    type: 'Local Storage',
                    isLocal: true,
                    url: URL.createObjectURL(file)
                  }]
                };
                
                const exists = movies.some(m => m.title === basicMovie.title);
                if (!exists) {
                  const newMovies = [...movies, basicMovie];
                  setMovies(newMovies);
                  saveMovies(newMovies);
                  itemsAdded++;
                }
              }
            } else if (parsed.type === 'tv') {
              // Try to find TV show on TMDB
              try {
                const searchResults = await searchTMDB(parsed.title, 'tv');
                let tvShow: any;
                
                if (searchResults && searchResults.length > 0) {
                  const details = await getTMDBDetails(searchResults[0].id, 'tv');
                  tvShow = await convertTMDBToTVShowWithEpisodes(details);
                } else {
                  // If TMDB fails, add as basic TV show
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
                    quality: scrapingConfig.defaultQuality,
                    studio: '',
                    tags: [],
                    trailerUrl: '',
                    seasons: []
                  };
                }

                // Create a local source
                const localSource: MovieSource = {
                  id: Date.now().toString(),
                  title: file.name,
                  quality: scrapingConfig.defaultQuality,
                  size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
                  type: 'Local Storage',
                  isLocal: true,
                  url: URL.createObjectURL(file)
                };

                // Find or create the season
                const targetSeasonNumber = parsed.season || 1;
                let targetSeason = tvShow.seasons?.find((s: any) => s.seasonNumber === targetSeasonNumber);
                
                if (!targetSeason) {
                  targetSeason = {
                    id: Date.now(),
                    seasonNumber: targetSeasonNumber,
                    title: `Season ${targetSeasonNumber}`,
                    overview: '',
                    posterPath: '',
                    episodes: []
                  };
                  tvShow.seasons = [...(tvShow.seasons || []), targetSeason];
                }

                // Find or create the episode
                const targetEpisodeNumber = parsed.episode || 1;
                let targetEpisode = targetSeason.episodes?.find((e: any) => e.episodeNumber === targetEpisodeNumber);
                
                if (!targetEpisode) {
                  targetEpisode = {
                    id: Date.now(),
                    title: `Episode ${targetEpisodeNumber}`,
                    overview: '',
                    episodeNumber: targetEpisodeNumber,
                    runtime: '45',
                    rating: 0,
                    airDate: '',
                    thumbnailPath: '',
                    sources: []
                  };
                  targetSeason.episodes = [...(targetSeason.episodes || []), targetEpisode];
                }

                // Add the local source to the episode
                targetEpisode.sources = [...(targetEpisode.sources || []), localSource];

                // Check if TV show already exists
                const exists = tvShows.some(s => s.title === tvShow.title);
                if (!exists) {
                  const newShows = [...tvShows, tvShow];
                  setTvShows(newShows);
                  saveTVShows(newShows);
                  itemsAdded++;
                } else {
                  // Update existing TV show
                  const newShows = tvShows.map((s: any) => {
                    if (s.title !== tvShow.title) return s;
                    
                    // Merge seasons
                    const mergedSeasons = [...(s.seasons || [])];
                    tvShow.seasons?.forEach((newSeason: any) => {
                      const existingSeasonIndex = mergedSeasons.findIndex((ms: any) => ms.seasonNumber === newSeason.seasonNumber);
                      if (existingSeasonIndex === -1) {
                        mergedSeasons.push(newSeason);
                      } else {
                        // Merge episodes
                        const existingSeason = mergedSeasons[existingSeasonIndex];
                        newSeason.episodes?.forEach((newEpisode: any) => {
                          const existingEpisodeIndex = existingSeason.episodes.findIndex((me: any) => me.episodeNumber === newEpisode.episodeNumber);
                          if (existingEpisodeIndex === -1) {
                            existingSeason.episodes.push(newEpisode);
                          } else {
                            // Add new source to existing episode
                            existingSeason.episodes[existingEpisodeIndex].sources = [
                              ...(existingSeason.episodes[existingEpisodeIndex].sources || []),
                              ...(newEpisode.sources || [])
                            ];
                          }
                        });
                      }
                    });
                    
                    return { ...s, seasons: mergedSeasons };
                  });
                  setTvShows(newShows);
                  saveTVShows(newShows);
                }
              } catch (err) {
                // If anything fails, add as basic TV show
                const basicShow: any = {
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
                  quality: scrapingConfig.defaultQuality,
                  studio: '',
                  tags: [],
                  trailerUrl: '',
                  seasons: [
                    {
                      id: Date.now(),
                      seasonNumber: parsed.season || 1,
                      title: `Season ${parsed.season || 1}`,
                      overview: '',
                      posterPath: '',
                      episodes: [
                        {
                          id: Date.now(),
                          title: `Episode ${parsed.episode || 1}`,
                          overview: '',
                          episodeNumber: parsed.episode || 1,
                          runtime: '45',
                          rating: 0,
                          airDate: '',
                          thumbnailPath: '',
                          sources: [
                            {
                              id: Date.now().toString(),
                              title: file.name,
                              quality: scrapingConfig.defaultQuality,
                              size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
                              type: 'Local Storage',
                              isLocal: true,
                              url: URL.createObjectURL(file)
                            }
                          ]
                        }
                      ]
                    }
                  ]
                };
                
                const exists = tvShows.some(s => s.title === basicShow.title);
                if (!exists) {
                  const newShows = [...tvShows, basicShow];
                  setTvShows(newShows);
                  saveTVShows(newShows);
                  itemsAdded++;
                }
              }
            }
          }
          
          updateScrapingJob(job.id, { itemsProcessed, itemsAdded, errors });
          await new Promise(resolve => setTimeout(resolve, 300)); // Small delay
        } catch (err) {
          errors.push(`Error processing ${file.name}: ${(err as Error).message}`);
        }
      }
      
      updateScrapingJob(job.id, { 
        status: 'completed', 
        endTime: new Date().toISOString(),
        itemsProcessed,
        itemsAdded,
        errors 
      });
      
      setSelectedLocalFiles([]);
      showToast(`Successfully imported ${itemsAdded} items!`, 'success');
    } catch (err) {
      updateScrapingJob(job.id, { 
        status: 'failed', 
        endTime: new Date().toISOString(),
        errors: [...errors, (err as Error).message] 
      });
      showToast('Failed to import files', 'error');
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

  const handleAddChannel = () => {
    const newChannel: LiveTVChannel = {
      id: Date.now().toString(),
      name: 'New Channel',
      genre: 'General',
      streamUrl: 'https://example.com/stream',
      streamType: 'HLS',
      posterPath: '',
      accentColor: '#ef4444',
      order: liveTVChannels.length + 1,
    };
    setLiveTVChannels([...liveTVChannels, newChannel]);
  }

  const handleEditChannel = (id: string, field: keyof LiveTVChannel, value: any) => {
    setLiveTVChannels(liveTVChannels.map((c: LiveTVChannel) => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  }

  const handleDeleteChannel = (id: string) => {
    setLiveTVChannels(liveTVChannels.filter((c: LiveTVChannel) => c.id !== id));
  }

  const handleMoveChannel = (id: string, direction: 'up' | 'down') => {
    const index = liveTVChannels.findIndex((c: LiveTVChannel) => c.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= liveTVChannels.length) return;

    const newChannels = [...liveTVChannels];
    [newChannels[index], newChannels[newIndex]] = [newChannels[newIndex], newChannels[index]];

    setLiveTVChannels(newChannels.map((c, i) => ({ ...c, order: i + 1 })));
  }

  const handleSaveLiveTV = () => {
    saveLiveTVChannels(liveTVChannels);
    showToast('Live TV channels saved successfully!', 'success');
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

  if (!isHydrated || !isAdminAccessReady) {
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
                : "bg-rose-900/90 border-rose-700 text-rose-100"
            )}
          >
            {toast.type === 'success' ? (
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">✓</div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center">✕</div>
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
                        const dropdownOpen = isHomeGroup
                          ? mobileHomeDropdownOpen
                          : isSliderGroup
                            ? mobileSliderDropdownOpen
                            : mobileImportDropdownOpen
                        const setDropdownOpen = isHomeGroup
                          ? setMobileHomeDropdownOpen
                          : isSliderGroup
                            ? setMobileSliderDropdownOpen
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
                  <button 
                    onClick={() => setActiveTab('import')}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Import Content
                  </button>
                </div>

                {/* Server Stats Section (Moved to Top) */}
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 mb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-xl font-semibold text-white">Server Health</h3>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Online</span>
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
                        <span className="text-lg font-bold text-white">35%</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500" 
                          style={{ width: '35%' }}
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
                        <span className="text-lg font-bold text-white">64%</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500" 
                          style={{ width: '64%' }}
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
                        <span className="text-lg font-bold text-white">2.4 Mbps</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 transition-all duration-500" 
                          style={{ width: '45%' }}
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
                        <span className="text-lg font-bold text-white">52%</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500" 
                          style={{ width: '52%' }}
                        />
                      </div>
                    </div>
                    
                    {/* Server Status */}
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span className="text-sm text-zinc-400 font-medium">Server Status</span>
                        </div>
                        <span className="text-lg font-bold text-emerald-400">Healthy</span>
                      </div>
                      <div className="text-sm text-zinc-500">
                        Uptime: 14 days 2 hours
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
                    title="Live Channels"
                    value={totalLiveChannels.toLocaleString()}
                    icon={Radio}
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
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Live Channels</span>
                              <span className="text-white font-medium">{totalLiveChannels.toLocaleString()}</span>
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
                            <>
                              <div>
                                <label className="block text-zinc-400 mb-2 font-medium text-sm">Type</label>
                                <select
                                  value={section.type}
                                  onChange={(e) => handleEditHomepageSection(section.id, 'type', e.target.value as any)}
                                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                                >
                                  <option value="continue-watching">Continue Watching</option>
                                  <option value="recommended">Recommended</option>
                                  <option value="live-tv">Live TV</option>
                                  <option value="trending">Trending</option>
                                  <option value="news">News</option>
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
                            </>
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

            {['import-movies', 'import-tv', 'import-livetv'].includes(activeTab) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white">
                    {activeTab === 'import-movies'
                      ? 'Import Movies'
                      : activeTab === 'import-tv'
                        ? 'Import TV Shows'
                        : 'Import Live TV'}
                  </h2>
                  <p className="text-zinc-500 mt-1">
                    {activeTab === 'import-livetv'
                      ? 'Choose how you want to add live TV content.'
                      : `Search and import ${activeTab === 'import-movies' ? 'movies' : 'TV shows'} from TMDB`}
                  </p>
                </div>

                {activeTab === 'import-livetv' ? (
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                    <div className="text-center py-12">
                      <Radio className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-2">Live TV Import</h3>
                      <p className="text-zinc-500 max-w-2xl mx-auto">
                        Use this section for live TV import sources. You can continue managing channels from the Live TV and Xtream API areas.
                      </p>
                    </div>
                  </div>
                ) : (
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
                )}
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
                          <label className="text-zinc-300">Auto Scraping</label>
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
                                    {castMember.sourceType === 'movie' ? '🎬' : '📺'} {castMember.sourceTitle}
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

            {activeTab === 'livetv' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Live TV</h2>
                    <p className="text-zinc-500 mt-1">Manage your Live TV channels</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleAddChannel}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Add Channel
                    </button>
                    <button 
                      onClick={handleSaveLiveTV}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                  <div className="space-y-6">
                    {liveTVChannels.map((channel, index) => (
                      <div key={channel.id} className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                          <div className="lg:col-span-2 flex items-center gap-4">
                            {channel.posterPath ? (
                              <img 
                                src={channel.posterPath} 
                                alt={channel.name} 
                                className="w-16 h-16 rounded-xl object-cover"
                              />
                            ) : (
                              <div 
                                className="w-16 h-16 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: channel.accentColor }}
                              >
                                <Radio className="w-8 h-8 text-white" />
                              </div>
                            )}
                            <div>
                              <h4 className="text-white font-semibold">{channel.name}</h4>
                              <p className="text-zinc-500 text-sm">Order: {channel.order}</p>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                              <button
                                onClick={() => handleMoveChannel(channel.id, 'up')}
                                disabled={index === 0}
                                className="p-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 rounded-lg transition-colors"
                              >
                                <ChevronUp className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleMoveChannel(channel.id, 'down')}
                                disabled={index === liveTVChannels.length - 1}
                                className="p-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 rounded-lg transition-colors"
                              >
                                <ChevronDown className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteChannel(channel.id)}
                                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Channel Name */}
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Channel Name</label>
                            <input
                              type="text"
                              value={channel.name}
                              onChange={(e) => handleEditChannel(channel.id, 'name', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          
                          {/* Genre */}
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Genre</label>
                            <input
                              type="text"
                              value={channel.genre}
                              onChange={(e) => handleEditChannel(channel.id, 'genre', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          
                          {/* Stream Type */}
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Stream Type</label>
                            <select
                              value={channel.streamType || 'HLS'}
                              onChange={(e) => handleEditChannel(channel.id, 'streamType', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                            >
                              <option value="HLS">HLS</option>
                              <option value="M3U8">M3U8</option>
                              <option value="TS">TS</option>
                              <option value="RTMP">RTMP</option>
                              <option value="Embed URL">Embed URL</option>
                              <option value="YouTube URL">YouTube URL</option>
                            </select>
                          </div>
                          
                          {/* Accent Color */}
                          <div>
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Accent Color</label>
                            <div className="flex gap-3">
                              <input
                                type="color"
                                value={channel.accentColor}
                                onChange={(e) => handleEditChannel(channel.id, 'accentColor', e.target.value)}
                                className="w-12 h-12 rounded-lg border-0 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={channel.accentColor}
                                onChange={(e) => handleEditChannel(channel.id, 'accentColor', e.target.value)}
                                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                              />
                            </div>
                          </div>
                          
                          {/* Stream URL */}
                          <div className="lg:col-span-2">
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Stream URL</label>
                            <input
                              type="url"
                              value={channel.streamUrl}
                              onChange={(e) => handleEditChannel(channel.id, 'streamUrl', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          
                          {/* Poster Upload */}
                          <div className="lg:col-span-2">
                            <label className="block text-zinc-400 mb-2 font-medium text-sm">Channel Poster</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Image Preview */}
                              {channel.posterPath && (
                                <div className="relative">
                                  <img 
                                    src={channel.posterPath} 
                                    alt={channel.name} 
                                    className="w-full h-40 object-cover rounded-lg"
                                  />
                                  <button
                                    onClick={() => handleEditChannel(channel.id, 'posterPath', '')}
                                    className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 rounded-full"
                                  >
                                    <X className="w-4 h-4 text-white" />
                                  </button>
                                </div>
                              )}
                              
                              {/* File Input */}
                              <label className={cn(
                                "flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-zinc-700 rounded-xl cursor-pointer hover:border-red-500 transition-colors",
                                channel.posterPath ? "md:col-span-1" : "md:col-span-2"
                              )}>
                                <Upload className="w-8 h-8 text-zinc-400" />
                                <span className="text-white font-medium">Upload Poster</span>
                                <span className="text-zinc-500 text-xs">PNG, JPG, GIF up to 5MB</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        handleEditChannel(channel.id, 'posterPath', event.target?.result as string);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {liveTVChannels.length === 0 && (
                      <div className="text-center py-12">
                        <Radio className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Channels Yet</h3>
                        <p className="text-zinc-500">Add your first channel to get started</p>
                      </div>
                    )}
                  </div>
                </div>
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
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Trending Prediction</h3>
                        <p className="text-zinc-500 text-xs">Predict upcoming content</p>
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm">Predict trending movies and shows using ML models</p>
                  </div>

                  {/* Auto Categorization */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <Tags className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Auto Categorization</h3>
                        <p className="text-zinc-500 text-xs">Smart content tagging</p>
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm">Automatically categorize and tag movies/shows</p>
                  </div>

                  {/* AI Subtitles */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                        <Languages className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">AI Subtitles</h3>
                        <p className="text-zinc-500 text-xs">Auto generate subtitles</p>
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm">Automatically generate and translate subtitles</p>
                  </div>

                  {/* AI Translation */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">AI Translation</h3>
                        <p className="text-zinc-500 text-xs">Multilingual support</p>
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm">Translate content to 100+ languages</p>
                  </div>

                  {/* AI Voiceover */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-red-600 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">AI Voiceover</h3>
                        <p className="text-zinc-500 text-xs">Voice narration</p>
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm">Generate natural voiceovers in multiple languages</p>
                  </div>

                  {/* AI Posters */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center">
                        <Image className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">AI Posters</h3>
                        <p className="text-zinc-500 text-xs">Generate posters</p>
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm">Generate and enhance movie posters with AI</p>
                  </div>

                  {/* Smart Search */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                        <Search className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Smart Search</h3>
                        <p className="text-zinc-500 text-xs">AI-powered search</p>
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm">Natural language search and discovery</p>
                  </div>

                  {/* AI Chat Assistant */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">AI Chat Assistant</h3>
                        <p className="text-zinc-500 text-xs">Personal assistant</p>
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm">Chat with AI for recommendations and help</p>
                  </div>

                  {/* Churn Prediction */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Churn Prediction</h3>
                        <p className="text-zinc-500 text-xs">User retention</p>
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm">Predict user churn and suggest retention actions</p>
                  </div>

                  {/* AI Recommendations */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 md:col-span-2 lg:col-span-3">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">AI Recommendations</h3>
                        <p className="text-zinc-500 text-xs">Personalized suggestions</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
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
                  </div>

                  {/* Download Features */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                        <Download className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Download Features</h3>
                        <p className="text-zinc-500 text-xs">Offline viewing</p>
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm">Offline download, encrypted, smart downloads and more</p>
                  </div>

                  {/* Android App */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Android App</h3>
                        <p className="text-zinc-500 text-xs">Material You + Jetpack Compose</p>
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm">Modern Android app with tablet, foldable, Chromecast support</p>
                  </div>

                  {/* iOS App */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">iOS App</h3>
                        <p className="text-zinc-500 text-xs">SwiftUI + Apple Design</p>
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm">iOS app with SwiftUI, Dynamic Island, Widgets, Live Activities</p>
                  </div>

                  {/* Android TV App */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                        <AppWindow className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Android TV App</h3>
                        <p className="text-zinc-500 text-xs">TV Optimized</p>
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm">Android TV app with remote-friendly UI and voice search</p>
                  </div>

                  {/* AI Metadata Cleanup */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">AI Metadata Cleanup</h3>
                        <p className="text-zinc-500 text-xs">Metadata management</p>
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm">Clean and standardize content metadata</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'herobanner' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
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
                    <div className="px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-400 text-sm">
                      Live tracking data is not connected yet
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                  <StatCard title="Catalog Titles" value={totalTitles.toString()} change={`${totalMovies} movies`} icon={Film} trend="up" />
                  <StatCard title="TV Footprint" value={totalEpisodes.toString()} change={`${totalSeasons} seasons`} icon={Tv} trend="up" />
                  <StatCard title="Genres Active" value={totalGenres.toString()} change={`${genreInsights.length} top clusters`} icon={Tags} trend="up" />
                  <StatCard title="Cast Indexed" value={totalCast.toString()} change={`${totalUsers} registered users`} icon={Users} trend="up" />
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

                {/* Parental Controls Section */}
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 mb-8">
                  <h3 className="text-xl font-semibold text-white mb-6">Parental Controls</h3>
                  <div className="space-y-6">
                    <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-white font-medium">PIN Protection</h4>
                          <p className="text-zinc-500 text-sm">Require PIN for restricted content</p>
                        </div>
                        <button
                          onClick={() => {
                            const newSettings = { ...adminParentalSettings, pinEnabled: !adminParentalSettings.pinEnabled };
                            setAdminParentalSettings(newSettings);
                          }}
                          className={`w-14 h-8 rounded-full relative cursor-pointer transition-all ${
                            adminParentalSettings.pinEnabled ? 'bg-red-600' : 'bg-zinc-700'
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                              adminParentalSettings.pinEnabled ? 'right-1' : 'left-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div>
                        <label className="block text-zinc-400 mb-3 font-medium text-sm">
                          Maximum Allowed Rating
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {['G', 'PG', 'PG-13', 'R', 'NC-17'].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => {
                                setAdminParentalSettings({
                                  ...adminParentalSettings,
                                  maxAllowedRating: rating as any
                                });
                              }}
                              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                adminParentalSettings.maxAllowedRating === rating
                                  ? 'bg-red-600 text-white'
                                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                              }`}
                            >
                              {rating}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-white font-medium">Kids Mode</h4>
                          <p className="text-zinc-500 text-sm">Restrict to age-appropriate content only</p>
                        </div>
                        <button
                          onClick={() => {
                            const nextKidsMode = !adminParentalSettings.kidsModeEnabled;
                            setAdminParentalSettings({
                              ...adminParentalSettings,
                              kidsModeEnabled: nextKidsMode,
                              animeModeEnabled: nextKidsMode ? false : adminParentalSettings.animeModeEnabled
                            });
                          }}
                          className={`w-14 h-8 rounded-full relative cursor-pointer transition-all ${
                            adminParentalSettings.kidsModeEnabled ? 'bg-red-600' : 'bg-zinc-700'
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                              adminParentalSettings.kidsModeEnabled ? 'right-1' : 'left-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-white font-medium">Anime Mode</h4>
                          <p className="text-zinc-500 text-sm">Switch the app header and home experience to Anime mode</p>
                        </div>
                        <button
                          onClick={() => {
                            const nextAnimeMode = !adminParentalSettings.animeModeEnabled;
                            setAdminParentalSettings({
                              ...adminParentalSettings,
                              animeModeEnabled: nextAnimeMode,
                              kidsModeEnabled: nextAnimeMode ? false : adminParentalSettings.kidsModeEnabled
                            });
                          }}
                          className={`w-14 h-8 rounded-full relative cursor-pointer transition-all ${
                            adminParentalSettings.animeModeEnabled ? 'bg-fuchsia-600' : 'bg-zinc-700'
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                              adminParentalSettings.animeModeEnabled ? 'right-1' : 'left-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => {
                        saveParentalControlSettings(adminParentalSettings);
                        showToast('Parental control settings saved successfully!', 'success');
                      }}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      Save Parental Settings
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
                            <option value="livetv">Live TV</option>
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
