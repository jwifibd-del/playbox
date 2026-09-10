
const http = require('http');
const os = require('os');
const fs = require('fs');
const url = require('url');

const PORT = 3002;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Get TMDB API key from environment variable (set via .env or export TMDB_API_KEY=...)
// Get your key here: https://www.themoviedb.org/settings/api
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Sample data for movies, tv shows, etc.
const sampleMovies = [
  {
    id: 1,
    title: "Interstellar Odyssey",
    tagline: "Mankind was born on Earth. It was never meant to die here.",
    overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=epic%20sci-fi%20movie%20poster%2C%20interstellar%2C%20cinematic%2C%20space%2C%20black%20hole&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cinematic%20movie%20backdrop%2C%20epic%20space%20scene%2C%20nebula%2C%20stars%2C%20dramatic%20lighting&image_size=landscape_16_9",
    releaseYear: 2014,
    rating: 8.7,
    runtime: "2h 49m",
    genres: ["Sci-Fi", "Adventure", "Drama"],
    country: "United States",
    language: "English",
    quality: "4K HDR",
    studio: "Paramount Pictures",
    director: "Christopher Nolan",
    tags: ["Space", "Time Travel", "Wormhole"],
    trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
    sources: [
      { id: 1, title: "Main Source", quality: "4K", size: "12.5 GB", type: "MP4", isLocal: false, url: "https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4" },
      { id: 2, title: "HLS Stream", quality: "1080p", size: "4.2 GB", type: "HLS", isLocal: false, url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" }
    ],
    cast: [
      { id: 1, name: "Matthew McConaughey", role: "Actor", character: "Cooper", profilePath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=actor%20matthew%20mcconaughey%20portrait%2C%20professional%20headshot&image_size=square" },
      { id: 2, name: "Anne Hathaway", role: "Actress", character: "Brand", profilePath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=actress%20anne%20hathaway%20portrait%2C%20professional%20headshot&image_size=square" }
    ]
  },
  {
    id: 2,
    title: "The Dark Knight",
    tagline: "Why So Serious?",
    overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=dark%20knight%20movie%20poster%2C%20batman%2C%20joker%2C%20cinematic%2C%20dark%20tones&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gotham%20city%20night%20skyline%2C%20cinematic%2C%20dramatic%2C%20dark%20blue%20tones&image_size=landscape_16_9",
    releaseYear: 2008,
    rating: 9.0,
    runtime: "2h 32m",
    genres: ["Action", "Crime", "Drama"],
    country: "United States",
    language: "English",
    quality: "1080p",
    studio: "Warner Bros. Pictures",
    director: "Christopher Nolan",
    tags: ["Superhero", "Gotham", "Joker"],
    trailerUrl: "https://www.youtube.com/watch?v=EXeTwQWrcwY"
  },
  {
    id: 3,
    title: "Inception",
    tagline: "Your mind is the scene of the crime.",
    overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=inception%20movie%20poster%2C%20dream%2C%20mind%2C%20cinematic&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cinematic%20dream%20landscape%2C%20rotating%20city%2C%20inception%2C%20dramatic&image_size=landscape_16_9",
    releaseYear: 2010,
    rating: 8.8,
    runtime: "2h 28m",
    genres: ["Sci-Fi", "Action", "Thriller"],
    country: "United States",
    language: "English",
    quality: "4K",
    studio: "Warner Bros. Pictures",
    director: "Christopher Nolan",
    tags: ["Dreams", "Mind", "Heist"]
  }
];

const sampleTVShows = [
  {
    id: 1,
    title: "Stranger Things",
    tagline: "One summer can change everything.",
    overview: "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=stranger%20things%20tv%20show%20poster%2C%2080s%2C%20supernatural&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=stranger%20things%20backdrop%2C%20upside%20down%2C%20cinematic&image_size=landscape_16_9",
    releaseYear: 2016,
    rating: 8.7,
    genres: ["Sci-Fi", "Horror", "Drama"],
    seasons: 4,
    episodes: 34,
    country: "United States",
    language: "English",
    quality: "4K HDR"
  },
  {
    id: 2,
    title: "Breaking Bad",
    tagline: "Chemistry is the study of matter... but I prefer to see it as the study of change.",
    overview: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=breaking%20bad%20tv%20show%20poster%2C%20walter%20white%2C%20heisenberg&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=breaking%20bad%20backdrop%2C%20desert%2C%20cinematic&image_size=landscape_16_9",
    releaseYear: 2008,
    rating: 9.5,
    genres: ["Crime", "Drama", "Thriller"],
    seasons: 5,
    episodes: 62,
    country: "United States",
    language: "English",
    quality: "1080p"
  }
];

const sampleAIRecommendations = [
  { id: 1, title: "Blade Runner 2049", genres: ["Sci-Fi", "Drama"], rating: 8.0, posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=blade%20runner%202049%20poster&image_size=portrait_4_3" },
  { id: 2, title: "Dune", genres: ["Sci-Fi", "Adventure"], rating: 8.3, posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=dune%20movie%20poster&image_size=portrait_4_3" }
];

// Local storage for mock users and OTPs
let mockUsers = [
  {
    id: 1,
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    password: 'user', // In real app, this should be hashed!
    gender: 'male',
    joinDate: 'January 15, 2024',
    lastLogin: new Date().toISOString(),
    avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=friendly%20user%20avatar%20portrait%2C%20simple%2C%20clean%20design&image_size=square',
    subscription: {
      plan: 'Premium',
      startDate: 'January 15, 2024',
      endDate: 'January 15, 2025',
      autoRenew: true
    },
    profiles: [
      { id: 'profile-1', name: 'John', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=friendly%20user%20avatar%20portrait%2C%20simple%2C%20clean%20design&image_size=square', isKids: false, pin: '', preferences: { language: 'English', subtitlesEnabled: false, defaultQuality: 'Auto' } },
      { id: 'profile-2', name: 'Kids', avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cute%20cartoon%20profile%20avatar%2C%20kids%2C%20colorful&image_size=square', isKids: true, pin: '1234', preferences: { language: 'English', subtitlesEnabled: true, defaultQuality: '720p' } }
    ],
    activeProfileId: 'profile-1'
  }
];
let mockOtps = {};

// Simulate bandwidth (bytes sent/received)
let bytesSent = 0;
let bytesReceived = 0;

// Simulate live analytics data
let analyticsData = {
  totalViews: 0,
  totalDownloads: 0,
  totalShares: 0,
  totalComments: 0,
  activeUsers: {
    now: 0,
    lastHour: 0,
    today: 0
  },
  contentViews: [],
  userActivity: []
};

// Initialize some simulated content views
const sampleContent = [
  { id: 1, title: "Inception", type: "movie", views: 1250 },
  { id: 2, title: "The Dark Knight", type: "movie", views: 980 },
  { id: 3, title: "Stranger Things", type: "tv", views: 2100 },
  { id: 4, title: "Breaking Bad", type: "tv", views: 1850 },
  { id: 5, title: "Interstellar", type: "movie", views: 1420 }
];
analyticsData.contentViews = sampleContent;
analyticsData.totalViews = sampleContent.reduce((sum, item) => sum + item.views, 0);
analyticsData.totalDownloads = Math.floor(analyticsData.totalViews * 0.3);
analyticsData.totalShares = Math.floor(analyticsData.totalViews * 0.1);
analyticsData.totalComments = Math.floor(analyticsData.totalViews * 0.05);
analyticsData.activeUsers = {
  now: Math.floor(Math.random() * 50) + 10,
  lastHour: Math.floor(Math.random() * 200) + 50,
  today: Math.floor(Math.random() * 1000) + 200
};

function getServerHealth() {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  const cpuUsage = os.loadavg();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;

  // Get disk storage info for main drive
  let storageInfo = { total: 0, used: 0, free: 0, usagePercentage: '0.00' };
  try {
    const stats = fs.statSync(__dirname);
    const simulatedTotal = 1024 * 1024 * 1024 * 500;
    const simulatedUsed = Math.floor(Math.random() * simulatedTotal * 0.6 + simulatedTotal * 0.3);
    const simulatedFree = simulatedTotal - simulatedUsed;
    storageInfo = {
      total: simulatedTotal,
      used: simulatedUsed,
      free: simulatedFree,
      usagePercentage: ((simulatedUsed / simulatedTotal) * 100).toFixed(2)
    };
  } catch (e) {
    storageInfo = { total: 1e12, used: 3e11, free: 7e11, usagePercentage: '30.00' };
  }

  bytesSent += Math.floor(Math.random() * 1000000);
  bytesReceived += Math.floor(Math.random() * 2000000);

  function formatUptime(seconds) {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: { seconds: uptime, formatted: formatUptime(uptime) },
    memory: {
      rss: memoryUsage.rss, heapTotal: memoryUsage.heapTotal, heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external, arrayBuffers: memoryUsage.arrayBuffers, total: totalMemory,
      used: usedMemory, free: freeMemory, usagePercentage: ((usedMemory / totalMemory) * 100).toFixed(2)
    },
    cpu: { load1min: cpuUsage[0], load5min: cpuUsage[1], load15min: cpuUsage[2], cores: os.cpus().length },
    platform: { os: os.platform(), arch: os.arch(), nodeVersion: process.version },
    storage: {
      ...storageInfo, totalFormatted: formatBytes(storageInfo.total),
      usedFormatted: formatBytes(storageInfo.used), freeFormatted: formatBytes(storageInfo.free)
    },
    bandwidth: { bytesSent, bytesReceived, sentFormatted: formatBytes(bytesSent), receivedFormatted: formatBytes(bytesReceived) }
  };
}

// TMDB Proxy Functions
async function proxyTMDBRequest(endpoint, queryParams = {}) {
  const params = new URLSearchParams({ api_key: TMDB_API_KEY, ...queryParams });
  const url = `${TMDB_BASE_URL}${endpoint}?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error proxying TMDB request:', error);
    throw error;
  }
}

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Helper to parse request body
  const parseBody = () => {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        resolve(body ? JSON.parse(body) : {});
      });
    });
  };

  function getAnalytics() {
    analyticsData.activeUsers.now = Math.floor(Math.random() * 50) + 10;
    analyticsData.activeUsers.lastHour = Math.floor(Math.random() * 200) + 50;
    analyticsData.activeUsers.today = Math.floor(Math.random() * 1000) + 200;
    analyticsData.contentViews.forEach(item => { item.views += Math.floor(Math.random() * 10); });
    analyticsData.totalViews = analyticsData.contentViews.reduce((sum, item) => sum + item.views, 0);
    analyticsData.totalDownloads = Math.floor(analyticsData.totalViews * 0.3);
    analyticsData.totalShares = Math.floor(analyticsData.totalViews * 0.1);
    analyticsData.totalComments = Math.floor(analyticsData.totalViews * 0.05);
    return analyticsData;
  }

  // Server Health Endpoint
  if (req.url === '/api/server-health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getServerHealth()));
    return;
  }

  // Analytics Endpoint
  if (req.url === '/api/analytics' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getAnalytics()));
    return;
  }

  // Movies Endpoint
  if ((req.url === '/movies' || req.url === '/api/movies') && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(sampleMovies));
    return;
  }

  // TV Shows Endpoint
  if ((req.url === '/tv-shows' || req.url === '/api/tv-shows') && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(sampleTVShows));
    return;
  }

  // Recommendations Endpoint
  if ((req.url === '/recommendations' || req.url === '/api/recommendations') && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(sampleAIRecommendations));
    return;
  }

  // Auth Endpoints
  if (req.url?.startsWith('/api/auth/') || req.url?.startsWith('/auth/')) {
    const pathParts = req.url.split('/').filter(Boolean);
    const authIndex = pathParts.indexOf('auth');
    const authPath = pathParts[authIndex + 1]; // Get the part after 'auth'
    const body = await parseBody();

    // Login
    if (authPath === 'login' && req.method === 'POST') {
      const { email, password } = body;
      const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user && user.password === password) {
        user.lastLogin = new Date().toISOString();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          access_token: 'mock-jwt-token',
          user: { ...user, password: undefined }
        }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid email or password' }));
      }
      return;
    }

    // Register
    if (authPath === 'register' && req.method === 'POST') {
      const { email, password, name } = body;
      const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User with this email already exists' }));
      } else {
        const newUser = {
          id: mockUsers.length + 1,
          fullName: name,
          email,
          password,
          gender: 'prefer not to say',
          joinDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          lastLogin: new Date().toISOString(),
          avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=friendly%20user%20avatar%20portrait%2C%20simple%2C%20clean%20design&image_size=square',
          subscription: {
            plan: 'Free',
            startDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            autoRenew: true
          },
          profiles: [
            { id: `profile-${mockUsers.length + 1}-1`, name: name.split(' ')[0], avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=friendly%20user%20avatar%20portrait%2C%20simple%2C%20clean%20design&image_size=square', isKids: false, pin: '', preferences: { language: 'English', subtitlesEnabled: false, defaultQuality: 'Auto' } }
          ],
          activeProfileId: `profile-${mockUsers.length + 1}-1`
        };
        mockUsers.push(newUser);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          access_token: 'mock-jwt-token',
          user: { ...newUser, password: undefined }
        }));
      }
      return;
    }

    // Send OTP
    if (authPath === 'send-otp' && req.method === 'POST') {
      const { email } = body;
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      mockOtps[email.toLowerCase()] = { otp, expiresAt: Date.now() + 300000 };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'OTP sent successfully' }));
      return;
    }

    // Login with OTP
    if (authPath === 'login-with-otp' && req.method === 'POST') {
      const { email, otp } = body;
      const otpRecord = mockOtps[email.toLowerCase()];
      if (otpRecord && otpRecord.otp === otp && Date.now() < otpRecord.expiresAt) {
        let user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
          user = {
            id: mockUsers.length + 1,
            fullName: email.split('@')[0],
            email,
            password: Math.random().toString(36).slice(-8),
            gender: 'prefer not to say',
            joinDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            lastLogin: new Date().toISOString(),
            avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=friendly%20user%20avatar%20portrait%2C%20simple%2C%20clean%20design&image_size=square',
            subscription: {
              plan: 'Free',
              startDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
              endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
              autoRenew: true
            },
            profiles: [
              { id: `profile-${mockUsers.length + 1}-1`, name: email.split('@')[0], avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=friendly%20user%20avatar%20portrait%2C%20simple%2C%20clean%20design&image_size=square', isKids: false, pin: '', preferences: { language: 'English', subtitlesEnabled: false, defaultQuality: 'Auto' } }
            ],
            activeProfileId: `profile-${mockUsers.length + 1}-1`
          };
          mockUsers.push(user);
        }
        user.lastLogin = new Date().toISOString();
        delete mockOtps[email.toLowerCase()];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          access_token: 'mock-jwt-token',
          user: { ...user, password: undefined }
        }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid or expired OTP' }));
      }
      return;
    }

    // Session endpoint
    if (authPath === 'session' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        user: { ...mockUsers[0], password: undefined },
        expires: new Date(Date.now() + 86400000).toISOString()
      }));
      return;
    }

    // Admin panel login (username + password)
    if (authPath === 'admin-panel-login' && req.method === 'POST') {
      const username = typeof body?.username === 'string' ? body.username.trim() : '';
      const password = typeof body?.password === 'string' ? body.password : '';
      const ok =
        (username === 'admin' && password === 'admin') ||
        (username === 'admin' && password === 'admin') ||
        (username.length > 0 && password.length >= 4 && password.length < 200);
      if (ok) {
        const issued = Date.now();
        const token = `mock-admin-${issued.toString(36)}.${Buffer.from(JSON.stringify({ sub: username || 'admin', role: 'admin', iat: issued, exp: issued + 86400000 })).toString('base64url')}`;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          access_token: token,
          token_type: 'Bearer',
          expires_in: 86400,
          admin: { username: username || 'admin', role: 'admin' },
        }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid admin credentials' }));
      }
      return;
    }

    // Admin panel password change (requires bearer token)
    if (authPath === 'panel-password' && req.method === 'PATCH') {
      const auth = (req.headers?.authorization || '').toString();
      const bearer = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
      if (!bearer) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Missing admin token' }));
        return;
      }
      const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';
      if (!newPassword || newPassword.length < 4) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'New password too short' }));
        return;
      }
      const issued = Date.now();
      const token = `mock-admin-${issued.toString(36)}.${Buffer.from(JSON.stringify({ sub: 'admin', role: 'admin', iat: issued, exp: issued + 86400000 })).toString('base64url')}`;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ok: true,
        message: 'Admin password updated',
        access_token: token,
      }));
      return;
    }

    // Forgot Password
    if (authPath === 'forgot-password' && req.method === 'POST') {
      const { email } = body;
      const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Password reset process initiated' }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Password reset process initiated' }));
      }
      return;
    }
  }

  // TMDB Endpoints
  if (req.url?.startsWith('/api/tmdb/')) {
    const parsedUrl = url.parse(req.url, true);
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    const query = parsedUrl.query;

    try {
      let data;
      if (pathParts[2] === 'search' && pathParts[3] === 'movies') {
        data = await proxyTMDBRequest('/search/movie', { query: query.query, page: query.page || 1 });
      } else if (pathParts[2] === 'movies' && pathParts[3]) {
        data = await proxyTMDBRequest(`/movie/${pathParts[3]}`, { append_to_response: 'credits,keywords' });
      } else if (pathParts[2] === 'trending' && pathParts[3] === 'movies') {
        data = await proxyTMDBRequest(`/trending/movie/${query.timeWindow || 'week'}`);
      } else if (pathParts[2] === 'search' && pathParts[3] === 'tv') {
        data = await proxyTMDBRequest('/search/tv', { query: query.query, page: query.page || 1 });
      } else if (pathParts[2] === 'tv' && pathParts[3]) {
        data = await proxyTMDBRequest(`/tv/${pathParts[3]}`, { append_to_response: 'credits,keywords' });
      } else if (pathParts[2] === 'trending' && pathParts[3] === 'tv') {
        data = await proxyTMDBRequest(`/trending/tv/${query.timeWindow || 'week'}`);
      } else {
        throw new Error('Invalid TMDB endpoint');
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
      return;
    } catch (error) {
      console.error('TMDB proxy error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Error fetching from TMDB', error: error.message }));
      return;
    }
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Not Found' }));
});

server.listen(PORT, () => {
  console.log(`Mock PlayFlix Backend running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET /api/server-health');
  console.log('  GET /api/analytics');
  console.log('  GET /api/tmdb/search/movies?query=...&page=...');
  console.log('  GET /api/tmdb/movies/:tmdbId');
  console.log('  GET /api/tmdb/trending/movies?timeWindow=...');
  console.log('  GET /api/tmdb/search/tv?query=...&page=...');
  console.log('  GET /api/tmdb/tv/:tmdbId');
  console.log('  GET /api/tmdb/trending/tv?timeWindow=...');
});
