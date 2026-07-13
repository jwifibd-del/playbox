'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Clock,
  Heart,
  Download,
  Bell,
  MessageSquare,
  Settings,
  Shield,
  Save,
  X,
  Trash2,
  Play,
  Lock,
  Unlock,
  Camera,
  Edit3,
  LogOut
} from 'lucide-react';
import { 
  sampleMovies, 
  continueWatching, 
  getParentalControlSettings, 
  saveParentalControlSettings, 
  ParentalControlSettings,
  getUserProfile,
  saveUserProfile,
  UserProfile,
  getUserAuthCredentials,
  saveUserAuthCredentials,
  getMovieRequests,
  submitMovieRequest,
  MovieRequest,
  isUserAuthenticated,
  logoutUser
} from '@/lib/data';
import { MovieCard } from '@/components/MovieCard';

function formatGenderLabel(gender: UserProfile['gender']) {
  switch (gender) {
    case 'male':
      return 'Male';
    case 'female':
      return 'Female';
    case 'other':
      return 'Other';
    default:
      return 'Prefer not to say';
  }
}

function normalizeGenderValue(gender?: string): UserProfile['gender'] {
  const normalizedGender = gender?.trim().toLowerCase();

  if (normalizedGender === 'male') return 'male';
  if (normalizedGender === 'female') return 'female';
  if (normalizedGender === 'other') return 'other';

  return 'prefer not to say';
}

export default function AccountPage() {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isAccessReady, setIsAccessReady] = useState(false);
  const [parentalSettings, setParentalSettings] = useState<ParentalControlSettings>(() => getParentalControlSettings());
  const [pinInput, setPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile>(() => getUserProfile());
  const [editMode, setEditMode] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [movieRequests, setMovieRequests] = useState<MovieRequest[]>([]);
  const [requestForm, setRequestForm] = useState({
    title: '',
    type: 'Movie' as MovieRequest['type'],
    notes: ''
  });
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Please upload an image smaller than 5MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageDataUrl = typeof reader.result === 'string' ? reader.result : '';

      if (!imageDataUrl) {
        alert('Unable to read the selected image.');
        return;
      }

      setUserProfile((currentProfile) => ({
        ...currentProfile,
        avatar: imageDataUrl
      }));
      setEditMode(true);
    };
    reader.onerror = () => {
      alert('Unable to upload the selected image.');
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'history', label: 'Watch History', icon: Clock },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'requests', label: 'Movie Requests', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'parental', label: 'Parental Controls', icon: Shield }
  ];

  const notifications = [
    { id: 1, title: 'New Release', message: 'Your favorite movie has a new sequel', date: '2 hours ago', unread: true },
    { id: 2, title: 'Reminder', message: 'Your subscription will renew in 3 days', date: '1 day ago', unread: true },
    { id: 3, title: 'New in Library', message: 'Check out the new TV show additions', date: '3 days ago', unread: false },
    { id: 4, title: 'Update Available', message: 'New app update is now available', date: '1 week ago', unread: false }
  ];

  const downloads = [
    { id: 1, title: 'Interstellar Odyssey', progress: 100, quality: '1080p', size: '2.3 GB', downloadedDate: '2 days ago' },
    { id: 2, title: 'The Matrix', progress: 75, quality: '4K', size: '4.1 GB', downloadedDate: 'Downloading...' },
    { id: 3, title: 'The Shawshank Redemption', progress: 100, quality: '720p', size: '1.1 GB', downloadedDate: '1 week ago' }
  ];

  const favorites = sampleMovies.slice(0, 4);

  useEffect(() => {
    if (!isUserAuthenticated()) {
      router.replace('/login');
      return;
    }
    setIsAccessReady(true);
  }, [router]);

  useEffect(() => {
    if (!isAccessReady) {
      return;
    }

    setUserProfile(getUserProfile());
  }, [isAccessReady]);

  useEffect(() => {
    const syncMovieRequests = () => {
      const profileEmail = getUserProfile().email;
      setMovieRequests(
        getMovieRequests().filter((request) => request.requesterEmail.toLowerCase() === profileEmail.toLowerCase())
      );
    };

    syncMovieRequests();
    window.addEventListener('storage', syncMovieRequests);
    window.addEventListener('playflix-movie-requests-updated', syncMovieRequests);

    return () => {
      window.removeEventListener('storage', syncMovieRequests);
      window.removeEventListener('playflix-movie-requests-updated', syncMovieRequests);
    };
  }, []);

  const handleSaveProfile = () => {
    saveUserProfile(userProfile);
    setEditMode(false);
    alert('Profile saved successfully!');
    router.push('/');
  };

  const handleChangePassword = () => {
    const currentCredentials = getUserAuthCredentials();
    if (passwordData.current !== currentCredentials.password) {
      alert('Current password is incorrect!');
      return;
    }
    if (passwordData.new.length < 6) {
      alert('Password must be at least 6 characters!');
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      alert('Passwords do not match!');
      return;
    }
    saveUserAuthCredentials({ ...currentCredentials, password: passwordData.new });
    setShowChangePassword(false);
    setPasswordData({ current: '', new: '', confirm: '' });
    alert('Password changed successfully!');
  };

  const handleLogout = () => {
    logoutUser();
    setIsAccessReady(false);
    router.replace('/login');
  };

  const handleSubmitMovieRequest = () => {
    const result = submitMovieRequest(requestForm);

    if (!result.success) {
      alert(result.message || 'Unable to submit your request.');
      return;
    }

    setRequestForm({ title: '', type: 'Movie', notes: '' });
    setMovieRequests((currentRequests) => (result.request ? [result.request, ...currentRequests] : currentRequests));
    alert('Movie request submitted successfully!');
  };

  if (!hydrated || !isAccessReady) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading account...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
              {/* User Avatar */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-500/50">
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{userProfile.fullName}</h3>
                  <p className="text-zinc-500 text-sm">{userProfile.email}</p>
                </div>
              </div>

              {/* Tabs */}
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ' +
                        (activeTab === tab.id
                          ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                          : 'text-zinc-400 hover:bg-zinc-800 hover:text-white')
                      }
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Profile Management */}
              {activeTab === 'profile' && (
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <h2 className="text-3xl font-bold">Profile Management</h2>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => setEditMode(true)}
                        disabled={editMode}
                        className={
                          'flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors ' +
                          (editMode
                            ? 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed'
                            : 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white')
                        }
                      >
                        <Edit3 className="w-5 h-5" />
                        Edit Profile
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl font-medium transition-colors"
                      >
                        <Save className="w-5 h-5" />
                        Save Changes
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl font-medium transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        Logout
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                        />
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-700">
                          <img
                            src={userProfile.avatar}
                            alt={userProfile.fullName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          className="absolute bottom-0 right-0 bg-red-600 p-2 rounded-full cursor-pointer hover:bg-red-500 transition-colors"
                        >
                          <Camera className="w-5 h-5 text-white" />
                        </button>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{userProfile.fullName}</h3>
                        <p className="text-zinc-400">{userProfile.email}</p>
                        <p className="text-zinc-500 text-sm mt-2">
                          Upload a profile image to show it in the header bar.
                        </p>
                      </div>
                    </div>

                    {/* Personal Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-zinc-400 mb-2 font-medium">Full Name</label>
                        {editMode ? (
                          <input
                            type="text"
                            value={userProfile.fullName}
                            onChange={(e) => setUserProfile({ ...userProfile, fullName: e.target.value })}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                          />
                        ) : (
                          <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white">
                            {userProfile.fullName}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-2 font-medium">Email Address</label>
                        {editMode ? (
                          <input
                            type="email"
                            value={userProfile.email}
                            onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                          />
                        ) : (
                          <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white">
                            {userProfile.email}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div>
                        <label className="block text-zinc-400 mb-2 font-medium">Gender</label>
                        {editMode ? (
                          <select
                            value={normalizeGenderValue(userProfile.gender)}
                            onChange={(e) =>
                              setUserProfile({
                                ...userProfile,
                                gender: normalizeGenderValue(e.target.value)
                              })
                            }
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer not to say">Prefer not to say</option>
                          </select>
                        ) : (
                          <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white">
                            {formatGenderLabel(userProfile.gender)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Account Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-zinc-400 mb-2 font-medium">Join Date</label>
                        <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white">
                          {userProfile.joinDate}
                        </div>
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-2 font-medium">Last Login</label>
                        <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white">
                          {userProfile.lastLogin}
                        </div>
                      </div>
                    </div>

                    {/* Change Password */}
                    <div className="pt-6 border-t border-zinc-700">
                      <button
                        onClick={() => setShowChangePassword(!showChangePassword)}
                        className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-medium transition-colors"
                      >
                        <Lock className="w-5 h-5" />
                        Change Password
                      </button>
                      {showChangePassword && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-6 bg-zinc-800/50 rounded-xl p-6 border border-zinc-700"
                        >
                          <div className="space-y-4">
                            <div>
                              <label className="block text-zinc-400 mb-2 font-medium text-sm">Current Password</label>
                              <input
                                type="password"
                                value={passwordData.current}
                                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                              />
                            </div>
                            <div>
                              <label className="block text-zinc-400 mb-2 font-medium text-sm">New Password</label>
                              <input
                                type="password"
                                value={passwordData.new}
                                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                              />
                            </div>
                            <div>
                              <label className="block text-zinc-400 mb-2 font-medium text-sm">Confirm New Password</label>
                              <input
                                type="password"
                                value={passwordData.confirm}
                                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                              />
                            </div>
                            <div className="flex gap-4 pt-2">
                              <button
                                onClick={handleChangePassword}
                                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                              >
                                Update Password
                              </button>
                              <button
                                onClick={() => {
                                  setShowChangePassword(false);
                                  setPasswordData({ current: '', new: '', confirm: '' });
                                }}
                                className="px-5 py-2.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-medium transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Watch History */}
              {activeTab === 'history' && (
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold">Watch History</h2>
                    <button className="text-zinc-400 hover:text-white transition-colors">
                      Clear History
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {continueWatching.map((item) => (
                      <div key={item.id} className="group cursor-pointer">
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3">
                          <img
                            src={item.posterPath}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-semibold">
                              <Play size={16} fill="black" />
                              Continue
                            </button>
                          </div>
                          {/* Progress Bar */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
                            <div
                              className="h-full bg-red-600"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                        <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
                        <p className="text-zinc-500 text-sm">
                          {item.currentTime} of {item.duration}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorites/Watchlist */}
              {activeTab === 'favorites' && (
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold mb-8">My Favorites</h2>

                  {favorites.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {favorites.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <Heart className="w-20 h-20 text-zinc-700 mx-auto mb-6" />
                      <h3 className="text-2xl font-bold mb-2">No Favorites Yet</h3>
                      <p className="text-zinc-500">Start adding movies to your favorites list</p>
                    </div>
                  )}
                </div>
              )}

              {/* Downloads */}
              {activeTab === 'downloads' && (
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold mb-8">Downloads</h2>

                  <div className="space-y-4">
                    {downloads.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700"
                      >
                        <div className="flex-shrink-0 w-16 h-20 rounded-lg bg-zinc-700">
                          <img
                            src={sampleMovies[0].posterPath}
                            alt=""
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          <p className="text-zinc-500 text-sm mb-2">
                            {item.quality} • {item.size} • {item.downloadedDate}
                          </p>
                          {item.progress < 100 && (
                            <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-600 transition-all duration-300"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <button className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold">Notifications</h2>
                    <button className="text-zinc-400 hover:text-white transition-colors">
                      Mark All Read
                    </button>
                  </div>

                  <div className="space-y-4">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                          item.unread
                            ? 'bg-red-600/10 border-red-500/30'
                            : 'bg-zinc-800/50 border-zinc-700'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            item.unread
                              ? 'bg-red-600 text-white'
                              : 'bg-zinc-700 text-zinc-300'
                          }`}
                        >
                          <Bell className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{item.title}</h3>
                            <span className="text-zinc-500 text-sm">{item.date}</span>
                          </div>
                          <p className="text-zinc-400 mt-1">{item.message}</p>
                        </div>
                        {item.unread && (
                          <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'requests' && (
                <div className="space-y-8">
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                      <div>
                        <h2 className="text-3xl font-bold">Movie Requests</h2>
                        <p className="text-zinc-500 mt-2">Request a movie or TV show you want added to PlayFlix.</p>
                      </div>
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-300">
                        <MessageSquare className="w-4 h-4 text-red-400" />
                        <span>{movieRequests.length} request{movieRequests.length === 1 ? '' : 's'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-zinc-400 mb-2 font-medium">Requested Title</label>
                        <input
                          type="text"
                          value={requestForm.title}
                          onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                          placeholder="Enter movie or TV show name"
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-2 font-medium">Type</label>
                        <select
                          value={requestForm.type}
                          onChange={(e) => setRequestForm({ ...requestForm, type: e.target.value as MovieRequest['type'] })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                        >
                          <option value="Movie">Movie</option>
                          <option value="TV Show">TV Show</option>
                        </select>
                      </div>
                      <div className="lg:col-span-2">
                        <label className="block text-zinc-400 mb-2 font-medium">Notes</label>
                        <textarea
                          value={requestForm.notes}
                          onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                          placeholder="Add language, release year, or any helpful details."
                          rows={4}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={handleSubmitMovieRequest}
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-medium transition-colors"
                      >
                        <MessageSquare className="w-5 h-5" />
                        Submit Request
                      </button>
                    </div>
                  </div>

                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                    <h3 className="text-2xl font-bold mb-6">Your Request History</h3>
                    <div className="space-y-4">
                      {movieRequests.map((request) => (
                        <div key={request.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-xl font-semibold text-white">{request.title}</h4>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                                  {request.type}
                                </span>
                              </div>
                              <p className="text-zinc-400 text-sm mb-3">Requested on {request.createdAt}</p>
                              {request.notes && <p className="text-zinc-300">{request.notes}</p>}
                              {request.adminNotes && (
                                <p className="text-emerald-300 text-sm mt-3">Admin note: {request.adminNotes}</p>
                              )}
                            </div>
                            <div className="inline-flex items-center px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-white font-medium">
                              {request.status}
                            </div>
                          </div>
                        </div>
                      ))}

                      {movieRequests.length === 0 && (
                        <div className="text-center py-12">
                          <MessageSquare className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                          <h4 className="text-xl font-bold text-white mb-2">No Requests Yet</h4>
                          <p className="text-zinc-500">Submit your first movie or TV show request here.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Account Settings */}
              {activeTab === 'settings' && (
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold mb-8">Account Settings</h2>

                  <div className="space-y-8">
                    {/* Playback Settings */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Playback</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                          <div>
                            <h4 className="font-medium">Auto-Play</h4>
                            <p className="text-zinc-500 text-sm">Automatically play next episode</p>
                          </div>
                          <div className="w-14 h-8 bg-red-600 rounded-full relative cursor-pointer">
                            <div className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                          <div>
                            <h4 className="font-medium">Default Video Quality</h4>
                            <p className="text-zinc-500 text-sm">Choose default streaming quality</p>
                          </div>
                          <div className="bg-zinc-700 px-4 py-2 rounded-lg">
                            Auto
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                          <div>
                            <h4 className="font-medium">Subtitles</h4>
                            <p className="text-zinc-500 text-sm">Show subtitles by default</p>
                          </div>
                          <div className="w-14 h-8 bg-zinc-700 rounded-full relative cursor-pointer">
                            <div className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Privacy Settings */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Privacy</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                          <div>
                            <h4 className="font-medium">Show Watch Activity</h4>
                            <p className="text-zinc-500 text-sm">Let others see what you watch</p>
                          </div>
                          <div className="w-14 h-8 bg-zinc-700 rounded-full relative cursor-pointer">
                            <div className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="border-t border-zinc-700 pt-8">
                      <h3 className="text-xl font-semibold text-red-500 mb-4">Danger Zone</h3>
                      <div className="p-4 bg-red-900/10 border border-red-500/30 rounded-xl">
                        <h4 className="font-semibold mb-2">Delete Account</h4>
                        <p className="text-zinc-400 text-sm mb-4">
                          Permanently delete your account and all associated data
                        </p>
                        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Parental Controls */}
              {activeTab === 'parental' && (
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold">Parental Controls</h2>
                    {parentalSettings.kidsModeEnabled && (
                      <button
                        onClick={() => router.push('/kids')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-xl font-semibold hover:from-yellow-300 hover:to-orange-400 transition-all shadow-lg"
                      >
                        <Play fill="black" className="w-5 h-5" />
                        Go to Kids Mode
                      </button>
                    )}
                  </div>

                  <div className="space-y-8">
                    {/* PIN Protection */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4">PIN Protection</h3>
                      <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700 mb-4">
                        <div>
                          <h4 className="font-medium">Enable PIN Lock</h4>
                          <p className="text-zinc-500 text-sm">Require PIN for restricted content</p>
                        </div>
                        <button
                          onClick={() => {
                            const newSettings = { ...parentalSettings, pinEnabled: !parentalSettings.pinEnabled };
                            setParentalSettings(newSettings);
                            saveParentalControlSettings(newSettings);
                          }}
                          className={`w-14 h-8 rounded-full relative cursor-pointer transition-all ${
                            parentalSettings.pinEnabled ? 'bg-red-600' : 'bg-zinc-700'
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                              parentalSettings.pinEnabled ? 'right-1' : 'left-1'
                            }`}
                          />
                        </button>
                      </div>

                      {parentalSettings.pinEnabled && (
                        <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                          {!parentalSettings.pin ? (
                            <div className="space-y-4">
                              <label className="block text-zinc-400 mb-3 font-medium">Set your 4‑digit PIN</label>
                              <div className="flex gap-4">
                                <input
                                  type="password"
                                  maxLength={4}
                                  placeholder="Enter PIN"
                                  value={pinInput}
                                  onChange={(e) => setPinInput(e.target.value)}
                                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center text-2xl font-bold tracking-widest focus:outline-none focus:border-red-500"
                                />
                                <input
                                  type="password"
                                  maxLength={4}
                                  placeholder="Confirm PIN"
                                  value={confirmPinInput}
                                  onChange={(e) => setConfirmPinInput(e.target.value)}
                                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center text-2xl font-bold tracking-widest focus:outline-none focus:border-red-500"
                                />
                              </div>
                              <button
                                onClick={() => {
                                  if (pinInput.length === 4 && pinInput === confirmPinInput) {
                                    const newSettings = { ...parentalSettings, pin: pinInput };
                                    setParentalSettings(newSettings);
                                    saveParentalControlSettings(newSettings);
                                    setPinInput('');
                                    setConfirmPinInput('');
                                  } else {
                                    alert('Please enter a valid 4-digit PIN that matches in both fields');
                                  }
                                }}
                                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-medium transition-colors"
                              >
                                <Save className="w-5 h-5" />
                                Set PIN
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-4">
                              <Lock className="w-8 h-8 text-green-400" />
                              <div className="flex-1">
                                <h4 className="font-medium">PIN is set</h4>
                                <p className="text-zinc-500 text-sm">Your PIN is protected and secure</p>
                              </div>
                              <button
                                onClick={() => {
                                  const newSettings = { ...parentalSettings, pin: '' };
                                  setParentalSettings(newSettings);
                                  saveParentalControlSettings(newSettings);
                                }}
                                className="px-5 py-2.5 bg-zinc-700 hover:bg-zinc-600 rounded-xl font-medium transition-colors"
                              >
                                Change PIN
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Content Rating */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Content Restrictions</h3>
                      <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                        <label className="block text-zinc-400 mb-3 font-medium">
                          Maximum Allowed Rating
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {['G', 'PG', 'PG-13', 'R', 'NC-17'].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => {
                                const newSettings = {
                                  ...parentalSettings,
                                  maxAllowedRating: rating as any
                                };
                                setParentalSettings(newSettings);
                                saveParentalControlSettings(newSettings);
                              }}
                              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                parentalSettings.maxAllowedRating === rating
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

                    {/* Kids Profile */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Kids Mode</h3>
                      <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700 mb-4">
                        <div>
                          <h4 className="font-medium">Enable Kids Mode</h4>
                          <p className="text-zinc-500 text-sm">Restrict to age-appropriate content only</p>
                        </div>
                        <button
                          onClick={() => {
                            const newSettings = { ...parentalSettings, kidsModeEnabled: !parentalSettings.kidsModeEnabled };
                            setParentalSettings(newSettings);
                            saveParentalControlSettings(newSettings);
                            if (!parentalSettings.kidsModeEnabled) {
                              router.push('/kids');
                            }
                          }}
                          className={`w-14 h-8 rounded-full relative cursor-pointer transition-all ${
                            parentalSettings.kidsModeEnabled ? 'bg-red-600' : 'bg-zinc-700'
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                              parentalSettings.kidsModeEnabled ? 'right-1' : 'left-1'
                            }`}
                          />
                        </button>
                      </div>

                      {parentalSettings.kidsModeEnabled && (
                        <div className="p-4 bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-pink-900/30 rounded-xl border border-blue-500/30">
                          <div className="flex items-center gap-4">
                            <Unlock className="w-8 h-8 text-blue-400" />
                            <div>
                              <h4 className="font-medium text-white">Kids Mode is Active</h4>
                              <p className="text-blue-200/70 text-sm">Safe content only for children</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => saveParentalControlSettings(parentalSettings)}
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-medium transition-colors"
                      >
                        <Save className="w-5 h-5" />
                        Save All Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
