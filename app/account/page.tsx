'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Users,
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
  Pause,
  Lock,
  Unlock,
  Camera,
  Edit3,
  LogOut,
  Plus,
  Check,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Eye,
  Sliders,
  Film
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import {
  sampleMovies,
  getParentalControlSettings,
  saveParentalControlSettings,
  ParentalControlSettings,
  getUserProfile,
  saveUserProfile,
  UserProfile,
  registerUser,
  getUsers,
  getUserAuthCredentials,
  saveUserAuthCredentials,
  getMovieRequests,
  submitMovieRequest,
  deleteMovieRequest,
  MovieRequest,
  isUserAuthenticated,
  setUserAuthenticated,
  logoutUser,
  getActiveProfile,
  switchProfile,
  updateProfile,
  addProfile,
  deleteProfile,
  deleteUser,
  Profile,
  getWatchHistory,
  clearWatchHistory,
  removeWatchHistoryItem,
  WatchHistoryItem,
  getFavorites,
  clearFavorites,
  removeFavorite,
  getDownloads,
  saveDownloads,
  removeDownload,
  clearDownloads,
  toggleDownloadPause,
  Download as DownloadType,
  getUserNotifications,
  markAllNotificationsAsRead,
  toggleNotificationRead,
  deleteUserNotification,
  clearAllUserNotifications,
  addUserNotification,
  UserNotification
} from '@/lib/data';
import { Navbar } from '@/components/Navbar';
import { MovieCard } from '@/components/MovieCard';

const AVATAR_PRESETS = [
  'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=friendly%20user%20avatar%20portrait%2C%20simple%2C%20clean%20design&image_size=square',
  'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cute%20cartoon%20profile%20avatar%2C%20kids%2C%20colorful&image_size=square',
  'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=superhero%20avatar%20icon%2C%20neon%20lighting%2C%20streamer&image_size=square',
  'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=anime%20style%20avatar%20character%2C%20cyberpunk%20colors&image_size=square',
  'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=minimalist%20movie%20critic%20avatar%2C%20sunglasses%2C%20cinema&image_size=square'
];

function formatGenderLabel(gender?: UserProfile['gender']) {
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
  const { data: session, status } = useSession();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const syncedSessionEmailRef = useRef<string | null>(null);

  const [activeTab, setActiveTab] = useState('profile');
  const [hydrated, setHydrated] = useState(false);
  const [isAccessReady, setIsAccessReady] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // User and profiles state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [parentalSettings, setParentalSettings] = useState<ParentalControlSettings | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Dynamic modules state
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [downloads, setDownloads] = useState<DownloadType[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [movieRequests, setMovieRequests] = useState<MovieRequest[]>([]);

  // Profile management modals
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileIsKids, setNewProfileIsKids] = useState(false);
  const [newProfilePin, setNewProfilePin] = useState('');
  const [newProfileAvatar, setNewProfileAvatar] = useState(AVATAR_PRESETS[0]);

  // Settings modals
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  // Parental PIN form
  const [pinInput, setPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinMessage, setPinMessage] = useState<string | null>(null);

  // Password data
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Movie request form
  const [requestForm, setRequestForm] = useState({
    title: '',
    type: 'Movie' as MovieRequest['type'],
    notes: ''
  });

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ja', name: '日本語' }
  ];

  const triggerToast = (message: string) => {
    setFeedbackToast(message);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Hydration & initial tab from query params
  useEffect(() => {
    setHydrated(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Authentication check & session sync
  useEffect(() => {
    if (status === 'loading') return;

    const isAuthenticatedLocally = isUserAuthenticated();
    const isAuthenticatedSession = status === 'authenticated';

    if (!isAuthenticatedLocally && !isAuthenticatedSession) {
      router.replace('/login');
      return;
    }

    if (isAuthenticatedSession && session?.user?.email) {
      const email = String(session.user.email).trim().toLowerCase();

      if (syncedSessionEmailRef.current !== email) {
        syncedSessionEmailRef.current = email;
        const fullName = String(session.user.name ?? email.split('@')[0] ?? email).trim();
        const existingUsers = getUsers();
        const existingUser = existingUsers.find((user) => user.email.toLowerCase() === email);

        if (!existingUser) {
          registerUser({
            fullName,
            email,
            password: `google-${Math.random().toString(36).slice(2, 12)}`,
          });
        }

        setUserAuthenticated(true, email);
        const currentSaved = getUserProfile();
        const hasCustomUploadedAvatar =
          typeof currentSaved?.avatar === 'string' &&
          currentSaved.avatar.trim().startsWith('data:image/');
        const googleImage = String((session.user as any)?.image ?? '').trim();
        const fallbackExisting =
          existingUser?.avatar && String(existingUser.avatar).trim()
            ? String(existingUser.avatar).trim()
            : '';
        const finalAvatar: string | undefined = hasCustomUploadedAvatar
          ? currentSaved.avatar
          : googleImage || fallbackExisting || undefined;

        saveUserProfile({
          fullName,
          email,
          ...(finalAvatar ? { avatar: finalAvatar } : {}),
        });

        setUserProfile(getUserProfile());
        setActiveProfile(getActiveProfile());
      }
    }

    setIsAccessReady(true);
  }, [status, session, router]);

  // Synchronize data from localStorage
  useEffect(() => {
    if (!isAccessReady || !hydrated) return;

    const refreshData = () => {
      setUserProfile(getUserProfile());
      setActiveProfile(getActiveProfile());
      setParentalSettings(getParentalControlSettings());
      setWatchHistory(getWatchHistory());
      setFavorites(getFavorites());
      setDownloads(getDownloads());
      setNotifications(getUserNotifications());
      setMovieRequests(getMovieRequests());
    };

    refreshData();

    window.addEventListener('storage', refreshData);
    window.addEventListener('playflix-users-updated', refreshData);
    window.addEventListener('playflix-parental-controls-updated', refreshData);
    window.addEventListener('playflix-watch-history-updated', refreshData);
    window.addEventListener('playflix-favorites-updated', refreshData);
    window.addEventListener('playflix-downloads-updated', refreshData);
    window.addEventListener('playflix-notifications-updated', refreshData);
    window.addEventListener('playflix-movie-requests-updated', refreshData);

    return () => {
      window.removeEventListener('storage', refreshData);
      window.removeEventListener('playflix-users-updated', refreshData);
      window.removeEventListener('playflix-parental-controls-updated', refreshData);
      window.removeEventListener('playflix-watch-history-updated', refreshData);
      window.removeEventListener('playflix-favorites-updated', refreshData);
      window.removeEventListener('playflix-downloads-updated', refreshData);
      window.removeEventListener('playflix-notifications-updated', refreshData);
      window.removeEventListener('playflix-movie-requests-updated', refreshData);
    };
  }, [isAccessReady, hydrated]);

  // Handlers
  const handleSaveProfile = () => {
    if (userProfile) {
      saveUserProfile(userProfile);
      setEditMode(false);
      triggerToast('Profile updated successfully!');
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
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
      if (!imageDataUrl) return;

      setUserProfile((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, avatar: imageDataUrl };
        saveUserProfile(updated);
        return updated;
      });
      triggerToast('Avatar updated!');
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleChangePassword = () => {
    const currentCredentials = getUserAuthCredentials();
    if (passwordData.current !== currentCredentials.password) {
      alert('Current password is incorrect.');
      return;
    }
    if (passwordData.new.length < 6) {
      alert('New password must be at least 6 characters.');
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      alert('New passwords do not match.');
      return;
    }
    saveUserAuthCredentials({ ...currentCredentials, password: passwordData.new });
    setShowChangePassword(false);
    setPasswordData({ current: '', new: '', confirm: '' });
    triggerToast('Password updated successfully!');
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    logoutUser();
    setIsAccessReady(false);
    router.replace('/login');
  };

  // Movie Requests
  const handleSubmitMovieRequest = () => {
    const result = submitMovieRequest(requestForm);
    if (!result.success) {
      alert(result.message || 'Unable to submit your request.');
      return;
    }
    setRequestForm({ title: '', type: 'Movie', notes: '' });
    setMovieRequests(getMovieRequests());
    addUserNotification({
      title: 'Movie Request Received',
      message: `Your request for "${requestForm.title}" has been submitted to the PlayFlix content team.`,
      unread: true,
      type: 'system',
    });
    triggerToast('Request submitted successfully!');
  };

  const handleDeleteMovieRequest = (requestId: string) => {
    if (confirm('Are you sure you want to cancel this request?')) {
      deleteMovieRequest(requestId);
      setMovieRequests(getMovieRequests());
      triggerToast('Request cancelled.');
    }
  };

  // Profile Management Handlers
  const handleSwitchProfile = (profileId: string | number) => {
    switchProfile(profileId);
    setActiveProfile(getActiveProfile());
    setUserProfile(getUserProfile());
    triggerToast('Switched active profile.');
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) {
      alert('Please enter a profile name.');
      return;
    }
    addProfile({
      name: newProfileName.trim(),
      avatar: newProfileAvatar,
      isKids: newProfileIsKids,
      pin: newProfilePin.trim(),
      preferences: {
        language: 'English',
        subtitlesEnabled: false,
        defaultQuality: newProfileIsKids ? '720p' : 'Auto',
      },
    });
    setNewProfileName('');
    setNewProfilePin('');
    setNewProfileIsKids(false);
    setShowAddProfileModal(false);
    setUserProfile(getUserProfile());
    setActiveProfile(getActiveProfile());
    triggerToast('Profile created successfully!');
  };

  const handleUpdateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;
    updateProfile(editingProfile.id, {
      name: editingProfile.name,
      avatar: editingProfile.avatar,
      isKids: editingProfile.isKids,
      pin: editingProfile.pin,
    });
    setEditingProfile(null);
    setUserProfile(getUserProfile());
    setActiveProfile(getActiveProfile());
    triggerToast('Profile updated!');
  };

  const handleDeleteProfile = (profileId: string | number) => {
    if (confirm('Are you sure you want to delete this profile?')) {
      const ok = deleteProfile(profileId);
      if (ok) {
        setUserProfile(getUserProfile());
        setActiveProfile(getActiveProfile());
        triggerToast('Profile deleted.');
      } else {
        alert('You cannot delete your only remaining profile.');
      }
    }
  };

  // Watch History Handlers
  const handleClearWatchHistory = () => {
    if (confirm('Clear all your watch history? This cannot be undone.')) {
      clearWatchHistory();
      setWatchHistory([]);
      triggerToast('Watch history cleared.');
    }
  };

  const handleRemoveHistoryItem = (id: string | number) => {
    removeWatchHistoryItem(id);
    setWatchHistory(getWatchHistory());
    triggerToast('Item removed from history.');
  };

  // Favorites Handlers
  const handleClearFavorites = () => {
    if (confirm('Clear all favorite movies and shows?')) {
      clearFavorites();
      setFavorites([]);
      triggerToast('Favorites cleared.');
    }
  };

  const handleRemoveFavorite = (movieId: number | string) => {
    removeFavorite(movieId);
    setFavorites(getFavorites());
    triggerToast('Removed from favorites.');
  };

  // Downloads Handlers
  const handleToggleDownloadPause = (id: string) => {
    toggleDownloadPause(id);
    setDownloads(getDownloads());
  };

  const handleRemoveDownload = (id: string) => {
    removeDownload(id);
    setDownloads(getDownloads());
    triggerToast('Download removed.');
  };

  const handleClearDownloads = () => {
    if (confirm('Delete all downloaded items?')) {
      clearDownloads();
      setDownloads([]);
      triggerToast('All downloads deleted.');
    }
  };

  // Notifications Handlers
  const handleMarkAllNotificationsRead = () => {
    markAllNotificationsAsRead();
    setNotifications(getUserNotifications());
    triggerToast('All notifications marked as read.');
  };

  const handleToggleNotificationRead = (id: string | number) => {
    toggleNotificationRead(String(id));
    setNotifications(getUserNotifications());
  };

  const handleDeleteNotification = (id: string | number) => {
    deleteUserNotification(String(id));
    setNotifications(getUserNotifications());
  };

  const handleClearAllNotifications = () => {
    if (confirm('Clear all notifications?')) {
      clearAllUserNotifications();
      setNotifications([]);
      triggerToast('Notifications cleared.');
    }
  };

  // Parental Control Handlers
  const handleSavePin = () => {
    if (!parentalSettings) return;
    if (pinInput.length !== 4 || pinInput !== confirmPinInput) {
      alert('Please enter matching 4-digit PIN numbers.');
      return;
    }
    const updated = { ...parentalSettings, pin: pinInput, pinEnabled: true };
    setParentalSettings(updated);
    saveParentalControlSettings(updated);
    setPinInput('');
    setConfirmPinInput('');
    triggerToast('Parental PIN updated and active!');
  };

  const handleRemovePin = () => {
    if (!parentalSettings) return;
    const updated = { ...parentalSettings, pin: '', pinEnabled: false };
    setParentalSettings(updated);
    saveParentalControlSettings(updated);
    triggerToast('Parental PIN removed.');
  };

  const handleToggleKidsMode = () => {
    if (!parentalSettings) return;
    const nextState = !parentalSettings.kidsModeEnabled;
    const updated = { ...parentalSettings, kidsModeEnabled: nextState };
    setParentalSettings(updated);
    saveParentalControlSettings(updated);
    triggerToast(nextState ? 'Kids Mode enabled.' : 'Kids Mode disabled.');
  };

  const handleSetRatingRestriction = (rating: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17') => {
    if (!parentalSettings) return;
    const updated = { ...parentalSettings, maxAllowedRating: rating };
    setParentalSettings(updated);
    saveParentalControlSettings(updated);
    triggerToast(`Maximum rating set to ${rating}`);
  };

  // Account Settings Handlers
  const handleUpdateSubscriptionPlan = (plan: 'Free' | 'Premium' | 'VIP' | 'Family') => {
    if (!userProfile) return;
    const now = new Date();
    const endDate = new Date(now);
    endDate.setFullYear(endDate.getFullYear() + 1);

    const updatedUser = {
      ...userProfile,
      subscription: {
        ...userProfile.subscription,
        plan,
        startDate: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        endDate: endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      },
    };
    saveUserProfile(updatedUser);
    setUserProfile(updatedUser);
    setShowPlanModal(false);
    triggerToast(`Subscription plan updated to ${plan}!`);
  };

  const handleToggleAutoRenew = () => {
    if (!userProfile?.subscription) return;
    const updated = {
      ...userProfile,
      subscription: {
        ...userProfile.subscription,
        autoRenew: !userProfile.subscription.autoRenew,
      },
    };
    saveUserProfile(updated);
    setUserProfile(updated);
    triggerToast(`Auto-renew ${updated.subscription.autoRenew ? 'enabled' : 'disabled'}`);
  };

  const handleDeleteAccountConfirm = () => {
    if (!userProfile) return;
    deleteUser(userProfile.id);
    logoutUser();
    router.replace('/login');
  };

  const tabs = [
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'profiles', label: 'Profile Management', icon: Users },
    { id: 'history', label: 'Watch History', icon: Clock, badge: watchHistory.length },
    { id: 'favorites', label: 'My Favorites', icon: Heart, badge: favorites.length },
    { id: 'downloads', label: 'Downloads', icon: Download, badge: downloads.length },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: notifications.filter((n) => n.unread).length,
    },
    { id: 'requests', label: 'Movie Requests', icon: MessageSquare, badge: movieRequests.length },
    { id: 'settings', label: 'Account Settings', icon: Settings },
    { id: 'parental', label: 'Parental Controls', icon: Shield },
  ];

  if (!hydrated || !isAccessReady || !userProfile || !parentalSettings || !activeProfile) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading your account...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white selection:bg-red-500/30">
      <Navbar />

      {/* Floating Feedback Toast */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 flex items-center gap-3 px-5 py-3 bg-zinc-900 border border-red-500/40 shadow-2xl rounded-2xl text-white text-sm font-medium backdrop-blur-xl"
          >
            <CheckCircle2 className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span>{feedbackToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 sticky top-24">
              {/* Profile Card Header */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-800">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-red-500/60 flex-shrink-0">
                  <img
                    src={activeProfile.avatar || userProfile.avatar}
                    alt={activeProfile.name || userProfile.fullName}
                    className="w-full h-full object-cover"
                  />
                  {activeProfile.isKids && (
                    <span className="absolute bottom-0 right-0 px-1 text-[9px] font-black bg-yellow-400 text-black rounded">
                      KIDS
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-white truncate">
                      {activeProfile.name || userProfile.fullName}
                    </h3>
                  </div>
                  <p className="text-zinc-500 text-xs truncate">{userProfile.email}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-600/20 text-red-400 border border-red-600/30">
                    {userProfile.subscription?.plan || 'Free'} Plan
                  </span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-1.5">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        if (typeof window !== 'undefined') {
                          const url = new URL(window.location.href);
                          url.searchParams.set('tab', tab.id);
                          window.history.replaceState({}, '', url.toString());
                        }
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 text-left ${
                        isActive
                          ? 'bg-red-600 text-white font-semibold shadow-lg shadow-red-600/25'
                          : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm">{tab.label}</span>
                      </div>
                      {typeof tab.badge === 'number' && tab.badge > 0 && (
                        <span
                          className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="mt-8 pt-6 border-t border-zinc-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800/80 hover:bg-zinc-800 hover:text-red-400 text-zinc-400 rounded-2xl text-sm font-medium transition-colors border border-zinc-700/60"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* ========================================================= */}
              {/* TAB 1: USER PROFILE */}
              {/* ========================================================= */}
              {activeTab === 'profile' && (
                <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold">User Profile</h2>
                      <p className="text-zinc-400 text-sm mt-1">
                        Manage your personal credentials, contact info, and security.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => setEditMode(!editMode)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors border ${
                          editMode
                            ? 'bg-zinc-800 border-zinc-700 text-zinc-300'
                            : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white'
                        }`}
                      >
                        <Edit3 className="w-4 h-4" />
                        {editMode ? 'Cancel Edit' : 'Edit Profile'}
                      </button>
                      {editMode && (
                        <button
                          onClick={handleSaveProfile}
                          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-red-600/30"
                        >
                          <Save className="w-4 h-4" />
                          Save Changes
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Avatar Upload */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 bg-zinc-800/40 rounded-2xl border border-zinc-800 mb-8">
                    <div className="relative">
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                      <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-red-600/40 shadow-xl">
                        <img
                          src={userProfile.avatar}
                          alt={userProfile.fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        title="Change Avatar Image"
                        className="absolute bottom-0 right-0 bg-red-600 p-2.5 rounded-full cursor-pointer hover:bg-red-500 transition-colors shadow-lg"
                      >
                        <Camera className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <div className="text-center sm:text-left flex-1">
                      <h3 className="font-bold text-xl mb-1">{userProfile.fullName}</h3>
                      <p className="text-zinc-400 text-sm mb-3">{userProfile.email}</p>
                      <p className="text-zinc-500 text-xs">
                        Click the camera icon to upload a custom profile picture (PNG, JPG up to 5MB).
                      </p>
                    </div>
                  </div>

                  {/* Profile Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-zinc-400 mb-2 font-medium text-sm">Full Name</label>
                      {editMode ? (
                        <input
                          type="text"
                          value={userProfile.fullName}
                          onChange={(e) => setUserProfile({ ...userProfile, fullName: e.target.value })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                        />
                      ) : (
                        <div className="bg-zinc-800/60 border border-zinc-800 rounded-xl px-4 py-3 text-white font-medium">
                          {userProfile.fullName}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-2 font-medium text-sm">Email Address</label>
                      {editMode ? (
                        <input
                          type="email"
                          value={userProfile.email}
                          onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
                        />
                      ) : (
                        <div className="bg-zinc-800/60 border border-zinc-800 rounded-xl px-4 py-3 text-white font-medium">
                          {userProfile.email}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-2 font-medium text-sm">Gender</label>
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
                        <div className="bg-zinc-800/60 border border-zinc-800 rounded-xl px-4 py-3 text-white font-medium">
                          {formatGenderLabel(userProfile.gender)}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-2 font-medium text-sm">Member Since</label>
                      <div className="bg-zinc-800/60 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-300 font-medium">
                        {userProfile.joinDate}
                      </div>
                    </div>
                  </div>

                  {/* Password Management */}
                  <div className="pt-6 border-t border-zinc-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">Password & Security</h4>
                        <p className="text-zinc-500 text-sm">Ensure your account uses a strong, secure password.</p>
                      </div>
                      <button
                        onClick={() => setShowChangePassword(!showChangePassword)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl font-medium text-sm transition-colors"
                      >
                        <Lock className="w-4 h-4" />
                        {showChangePassword ? 'Close' : 'Change Password'}
                      </button>
                    </div>

                    {showChangePassword && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-6 p-6 bg-zinc-800/40 border border-zinc-700 rounded-2xl"
                      >
                        <div className="space-y-4 max-w-md">
                          <div>
                            <label className="block text-zinc-400 text-xs mb-1.5 font-medium">Current Password</label>
                            <input
                              type="password"
                              value={passwordData.current}
                              onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 text-xs mb-1.5 font-medium">New Password</label>
                            <input
                              type="password"
                              value={passwordData.new}
                              onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 text-xs mb-1.5 font-medium">Confirm New Password</label>
                            <input
                              type="password"
                              value={passwordData.confirm}
                              onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={handleChangePassword}
                              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl font-semibold text-sm transition-colors"
                            >
                              Update Password
                            </button>
                            <button
                              onClick={() => {
                                setShowChangePassword(false);
                                setPasswordData({ current: '', new: '', confirm: '' });
                              }}
                              className="px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 rounded-xl font-medium text-sm transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 2: PROFILE MANAGEMENT */}
              {/* ========================================================= */}
              {activeTab === 'profiles' && (
                <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold">Profile Management</h2>
                      <p className="text-zinc-400 text-sm mt-1">
                        Create, switch, or customize profiles for everyone in your household.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddProfileModal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-red-600/30 self-start"
                    >
                      <Plus className="w-4 h-4" />
                      Add Profile
                    </button>
                  </div>

                  {/* Profiles Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userProfile.profiles.map((profile) => {
                      const isActive = String(profile.id) === String(userProfile.activeProfileId);
                      return (
                        <div
                          key={profile.id}
                          className={`relative rounded-2xl border p-5 transition-all ${
                            isActive
                              ? 'bg-zinc-800/80 border-red-500 shadow-xl shadow-red-600/10'
                              : 'bg-zinc-800/30 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          {isActive && (
                            <span className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                              <Check className="w-3.5 h-3.5" />
                              Active
                            </span>
                          )}

                          <div className="flex items-center gap-4 mb-4">
                            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-zinc-700 flex-shrink-0">
                              <img
                                src={profile.avatar}
                                alt={profile.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-lg text-white truncate">{profile.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                {profile.isKids ? (
                                  <span className="px-2 py-0.5 text-[10px] font-black bg-yellow-400 text-black rounded">
                                    KIDS
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 text-[10px] font-medium bg-zinc-700 text-zinc-300 rounded">
                                    Standard
                                  </span>
                                )}
                                {profile.pin && (
                                  <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                                    <Lock className="w-3 h-3 text-red-400" /> PIN
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-3 border-t border-zinc-700/60">
                            {!isActive ? (
                              <button
                                onClick={() => handleSwitchProfile(profile.id)}
                                className="flex-1 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-xs font-semibold transition-colors"
                              >
                                Switch to Profile
                              </button>
                            ) : (
                              <div className="flex-1 py-2 text-center text-xs font-semibold text-red-400 bg-red-950/40 rounded-xl border border-red-900/50">
                                Currently Watching
                              </div>
                            )}

                            <button
                              onClick={() => setEditingProfile(profile)}
                              title="Edit Profile"
                              className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {userProfile.profiles.length > 1 && (
                              <button
                                onClick={() => handleDeleteProfile(profile.id)}
                                title="Delete Profile"
                                className="p-2 bg-zinc-800 hover:bg-red-900/40 hover:text-red-400 rounded-xl text-zinc-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Profile Modal */}
                  {showAddProfileModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold">Add New Profile</h3>
                          <button
                            onClick={() => setShowAddProfileModal(false)}
                            className="p-1 text-zinc-400 hover:text-white"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <form onSubmit={handleCreateProfile} className="space-y-5">
                          <div>
                            <label className="block text-zinc-400 text-xs font-medium mb-2">Profile Name</label>
                            <input
                              type="text"
                              value={newProfileName}
                              onChange={(e) => setNewProfileName(e.target.value)}
                              placeholder="e.g. Alex, Mom, Cinema Buff"
                              required
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500"
                            />
                          </div>

                          <div>
                            <label className="block text-zinc-400 text-xs font-medium mb-2">Choose Avatar</label>
                            <div className="flex items-center gap-3 overflow-x-auto pb-2">
                              {AVATAR_PRESETS.map((preset, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setNewProfileAvatar(preset)}
                                  className={`relative w-14 h-14 rounded-2xl overflow-hidden border-2 transition-transform flex-shrink-0 ${
                                    newProfileAvatar === preset ? 'border-red-500 scale-105' : 'border-zinc-700 opacity-60 hover:opacity-100'
                                  }`}
                                >
                                  <img src={preset} alt="" className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-zinc-800/60 rounded-xl border border-zinc-700/60">
                            <div>
                              <h5 className="font-semibold text-sm">Kids Profile?</h5>
                              <p className="text-zinc-400 text-xs">Only show age-appropriate titles</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={newProfileIsKids}
                              onChange={(e) => setNewProfileIsKids(e.target.checked)}
                              className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                            />
                          </div>

                          <div>
                            <label className="block text-zinc-400 text-xs font-medium mb-1.5">
                              Optional 4-digit Profile PIN
                            </label>
                            <input
                              type="password"
                              maxLength={4}
                              placeholder="e.g. 1234"
                              value={newProfilePin}
                              onChange={(e) => setNewProfilePin(e.target.value)}
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 text-center tracking-widest font-mono"
                            />
                          </div>

                          <div className="flex gap-3 pt-2">
                            <button
                              type="submit"
                              className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-red-600/30"
                            >
                              Create Profile
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowAddProfileModal(false)}
                              className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Edit Profile Modal */}
                  {editingProfile && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold">Edit Profile</h3>
                          <button
                            onClick={() => setEditingProfile(null)}
                            className="p-1 text-zinc-400 hover:text-white"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <form onSubmit={handleUpdateProfileSubmit} className="space-y-5">
                          <div>
                            <label className="block text-zinc-400 text-xs font-medium mb-2">Profile Name</label>
                            <input
                              type="text"
                              value={editingProfile.name}
                              onChange={(e) =>
                                setEditingProfile({ ...editingProfile, name: e.target.value })
                              }
                              required
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500"
                            />
                          </div>

                          <div>
                            <label className="block text-zinc-400 text-xs font-medium mb-2">Choose Avatar</label>
                            <div className="flex items-center gap-3 overflow-x-auto pb-2">
                              {AVATAR_PRESETS.map((preset, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() =>
                                    setEditingProfile({ ...editingProfile, avatar: preset })
                                  }
                                  className={`relative w-14 h-14 rounded-2xl overflow-hidden border-2 transition-transform flex-shrink-0 ${
                                    editingProfile.avatar === preset
                                      ? 'border-red-500 scale-105'
                                      : 'border-zinc-700 opacity-60 hover:opacity-100'
                                  }`}
                                >
                                  <img src={preset} alt="" className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-zinc-800/60 rounded-xl border border-zinc-700/60">
                            <div>
                              <h5 className="font-semibold text-sm">Kids Mode</h5>
                              <p className="text-zinc-400 text-xs">Safe content restricted to kids</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={editingProfile.isKids}
                              onChange={(e) =>
                                setEditingProfile({ ...editingProfile, isKids: e.target.checked })
                              }
                              className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                            />
                          </div>

                          <div>
                            <label className="block text-zinc-400 text-xs font-medium mb-1.5">
                              Profile PIN Lock
                            </label>
                            <input
                              type="password"
                              maxLength={4}
                              placeholder="Leave blank for none"
                              value={editingProfile.pin || ''}
                              onChange={(e) =>
                                setEditingProfile({ ...editingProfile, pin: e.target.value })
                              }
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 text-center tracking-widest font-mono"
                            />
                          </div>

                          <div className="flex gap-3 pt-2">
                            <button
                              type="submit"
                              className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-red-600/30"
                            >
                              Save Changes
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingProfile(null)}
                              className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 3: WATCH HISTORY */}
              {/* ========================================================= */}
              {activeTab === 'history' && (
                <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold">Watch History</h2>
                      <p className="text-zinc-400 text-sm mt-1">
                        Resume titles you've started watching or clear your playback records.
                      </p>
                    </div>
                    {watchHistory.length > 0 && (
                      <button
                        onClick={handleClearWatchHistory}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-red-900/30 hover:text-red-400 rounded-xl text-xs font-semibold transition-colors border border-zinc-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear All History
                      </button>
                    )}
                  </div>

                  {watchHistory.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {watchHistory.map((item) => (
                        <div
                          key={item.id}
                          className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col hover:border-zinc-700 transition-all shadow-lg"
                        >
                          <div className="relative aspect-[16/9] w-full bg-zinc-800 overflow-hidden">
                            <img
                              src={item.posterPath}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Link
                                href={item.isMovie === false ? `/tv/${item.id}` : `/movie/${item.id}`}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold text-xs rounded-xl shadow hover:bg-gray-200 transition-colors"
                              >
                                <Play className="w-3.5 h-3.5" fill="currentColor" />
                                Resume
                              </Link>
                            </div>

                            {/* Progress bar */}
                            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800">
                              <div
                                className="h-full bg-red-600 transition-all"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          </div>

                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="font-semibold text-white text-base truncate mb-1" title={item.title}>
                                {item.title}
                              </h4>
                              <p className="text-zinc-500 text-xs">
                                {item.currentTime && item.duration
                                  ? `${item.currentTime} of ${item.duration}`
                                  : `${item.progress}% completed`}
                              </p>
                            </div>

                            <div className="mt-4 flex items-center justify-between pt-3 border-t border-zinc-800/80">
                              <span className="text-[11px] text-zinc-500">
                                {item.watchedAt || 'Recently watched'}
                              </span>
                              <button
                                onClick={() => handleRemoveHistoryItem(item.id)}
                                title="Remove from history"
                                className="text-zinc-500 hover:text-red-400 p-1 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-zinc-800/20 rounded-3xl border border-dashed border-zinc-800">
                      <Clock className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-1">No Watch History</h3>
                      <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-6">
                        Movies and TV shows you start watching will automatically appear here.
                      </p>
                      <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-semibold text-white transition-colors"
                      >
                        <Play className="w-4 h-4" fill="currentColor" />
                        Explore Movies
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 4: MY FAVORITES */}
              {/* ========================================================= */}
              {activeTab === 'favorites' && (
                <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold">My Favorites</h2>
                      <p className="text-zinc-400 text-sm mt-1">
                        Titles you have bookmarked to your personal watchlist.
                      </p>
                    </div>
                    {favorites.length > 0 && (
                      <button
                        onClick={handleClearFavorites}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-red-900/30 hover:text-red-400 rounded-xl text-xs font-semibold transition-colors border border-zinc-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear All Favorites
                      </button>
                    )}
                  </div>

                  {favorites.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                      {favorites.map((movie) => (
                        <div key={movie.id} className="relative group">
                          <MovieCard movie={movie} />
                          <button
                            onClick={() => handleRemoveFavorite(movie.id)}
                            title="Remove from favorites"
                            className="absolute top-3 right-3 z-20 p-2 bg-black/70 hover:bg-red-600 text-white rounded-full transition-all shadow-md"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-zinc-800/20 rounded-3xl border border-dashed border-zinc-800">
                      <Heart className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-1">Your Watchlist is Empty</h3>
                      <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-6">
                        Click the Heart or "Add to List" button on any movie card or title page to bookmark it here.
                      </p>
                      <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-semibold text-white transition-colors"
                      >
                        <Film className="w-4 h-4" />
                        Browse Catalog
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 5: DOWNLOADS */}
              {/* ========================================================= */}
              {activeTab === 'downloads' && (
                <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold">Downloads</h2>
                      <p className="text-zinc-400 text-sm mt-1">
                        Downloaded videos available for offline playback anytime.
                      </p>
                    </div>
                    {downloads.length > 0 && (
                      <button
                        onClick={handleClearDownloads}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-red-900/30 hover:text-red-400 rounded-xl text-xs font-semibold transition-colors border border-zinc-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear All Downloads
                      </button>
                    )}
                  </div>

                  {downloads.length > 0 ? (
                    <div className="space-y-4">
                      {downloads.map((item) => {
                        const isDownloading = item.status === 'downloading';
                        const isPaused = item.status === 'paused';
                        const isCompleted = item.status === 'completed';

                        return (
                          <div
                            key={item.id}
                            className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-zinc-800/40 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all"
                          >
                            <div className="relative w-full sm:w-28 sm:h-20 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
                              <img
                                src={item.posterPath}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                              {isCompleted && (
                                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-green-600/90 text-white text-[10px] font-bold rounded-full">
                                  Saved
                                </span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-bold text-base text-white truncate">{item.title}</h4>
                                <span className="text-xs font-medium text-zinc-400 capitalize">
                                  {item.status}
                                </span>
                              </div>
                              <p className="text-zinc-500 text-xs mb-3">
                                {item.quality} • {item.size} • {new Date(item.addedAt).toLocaleDateString()}
                              </p>

                              {item.progress < 100 && (
                                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-1">
                                  <div
                                    className={`h-full transition-all duration-300 ${
                                      isPaused ? 'bg-yellow-500' : 'bg-red-600'
                                    }`}
                                    style={{ width: `${item.progress}%` }}
                                  />
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                              {!isCompleted && (
                                <button
                                  onClick={() => handleToggleDownloadPause(item.id)}
                                  className="p-2.5 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-white transition-colors"
                                  title={isDownloading ? 'Pause Download' : 'Resume Download'}
                                >
                                  {isDownloading ? (
                                    <Pause className="w-4 h-4" />
                                  ) : (
                                    <Play className="w-4 h-4" fill="currentColor" />
                                  )}
                                </button>
                              )}

                              {isCompleted && item.url && (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-3 py-2 bg-white text-black hover:bg-gray-200 rounded-xl text-xs font-bold transition-colors"
                                >
                                  <Play className="w-3.5 h-3.5" fill="currentColor" />
                                  Watch
                                </a>
                              )}

                              <button
                                onClick={() => handleRemoveDownload(item.id)}
                                className="p-2.5 bg-zinc-800 hover:bg-red-900/30 hover:text-red-400 rounded-xl text-zinc-400 transition-colors"
                                title="Delete Download"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-zinc-800/20 rounded-3xl border border-dashed border-zinc-800">
                      <Download className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-1">No Offline Downloads</h3>
                      <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-6">
                        Download titles from any movie or episode page to watch offline without Wi-Fi.
                      </p>
                      <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-semibold text-white transition-colors"
                      >
                        Explore Content
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 6: NOTIFICATIONS */}
              {/* ========================================================= */}
              {activeTab === 'notifications' && (
                <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-4 border-b border-zinc-800">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold">Notifications</h2>
                      <p className="text-zinc-400 text-sm mt-1">
                        Updates on new releases, requests, and account notices.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleMarkAllNotificationsRead}
                        className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-xs font-semibold text-white transition-colors"
                      >
                        Mark All Read
                      </button>
                      <button
                        onClick={handleClearAllNotifications}
                        className="px-3.5 py-2 bg-zinc-800 hover:bg-red-900/30 hover:text-red-400 border border-zinc-700 rounded-xl text-xs font-semibold text-zinc-400 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {notifications.length > 0 ? (
                    <div className="space-y-3">
                      {notifications.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-start gap-4 p-4 sm:p-5 rounded-2xl border transition-all ${
                            item.unread
                              ? 'bg-red-600/10 border-red-500/40 shadow-md'
                              : 'bg-zinc-800/30 border-zinc-800'
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              item.unread ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            <Bell className="w-5 h-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-sm text-white truncate">{item.title}</h4>
                              <span className="text-[11px] text-zinc-500 flex-shrink-0">{item.date}</span>
                            </div>
                            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">{item.message}</p>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0 self-center">
                            <button
                              onClick={() => handleToggleNotificationRead(item.id)}
                              title={item.unread ? 'Mark as Read' : 'Mark as Unread'}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
                            >
                              <Check className={`w-4 h-4 ${!item.unread ? 'text-green-500' : ''}`} />
                            </button>
                            <button
                              onClick={() => handleDeleteNotification(item.id)}
                              title="Delete notification"
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-zinc-800/20 rounded-3xl border border-dashed border-zinc-800">
                      <Bell className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-1">No Notifications</h3>
                      <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-6">
                        You're all caught up! Release alerts and system notes will appear here.
                      </p>
                      <button
                        onClick={() => {
                          addUserNotification({
                            title: 'Welcome to PlayFlix',
                            message: 'Enjoy unlimited HD movies, series, anime, and live channels!',
                            unread: true,
                            type: 'system',
                          });
                          setNotifications(getUserNotifications());
                          triggerToast('Test notification added!');
                        }}
                        className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-xs font-semibold text-white transition-colors"
                      >
                        Send Sample Notification
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 7: MOVIE REQUESTS */}
              {/* ========================================================= */}
              {activeTab === 'requests' && (
                <div className="space-y-8">
                  {/* Submit Form */}
                  <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold">Request Content</h2>
                        <p className="text-zinc-400 text-sm mt-1">
                          Can't find your favorite movie or TV show? Request it here and we will add it!
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-600/30 rounded-full text-xs font-semibold self-start">
                        {movieRequests.length} Total Request{movieRequests.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                      <div>
                        <label className="block text-zinc-400 text-xs font-medium mb-2">
                          Title of Movie or TV Series *
                        </label>
                        <input
                          type="text"
                          value={requestForm.title}
                          onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                          placeholder="e.g. Dune: Part Two, Shogun"
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-xs font-medium mb-2">Media Type</label>
                        <select
                          value={requestForm.type}
                          onChange={(e) =>
                            setRequestForm({
                              ...requestForm,
                              type: e.target.value as MovieRequest['type']
                            })
                          }
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500"
                        >
                          <option value="Movie">Movie</option>
                          <option value="TV Show">TV Show</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-zinc-400 text-xs font-medium mb-2">
                          Additional Details (Release Year, Language, Seasons)
                        </label>
                        <textarea
                          value={requestForm.notes}
                          onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                          placeholder="Provide any details that will help us find and upload the exact version..."
                          rows={3}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSubmitMovieRequest}
                      className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-red-600/30"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Submit Request
                    </button>
                  </div>

                  {/* Request History */}
                  <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 sm:p-8">
                    <h3 className="text-xl font-bold mb-6">Your Previous Requests</h3>

                    {movieRequests.length > 0 ? (
                      <div className="space-y-4">
                        {movieRequests.map((request) => (
                          <div
                            key={request.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-800 bg-zinc-800/30 hover:border-zinc-700 transition-all"
                          >
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h4 className="font-bold text-base text-white">{request.title}</h4>
                                <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-full">
                                  {request.type}
                                </span>
                              </div>
                              <p className="text-zinc-400 text-xs mb-2">Requested on {request.createdAt}</p>
                              {request.notes && (
                                <p className="text-zinc-300 text-xs bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800 max-w-xl">
                                  {request.notes}
                                </p>
                              )}
                              {request.adminNotes && (
                                <p className="text-emerald-400 text-xs mt-2">
                                  Staff response: {request.adminNotes}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-3 self-end sm:self-center">
                              <span
                                className={`px-3 py-1 text-xs font-bold rounded-full ${
                                  request.status === 'Fulfilled'
                                    ? 'bg-green-600/20 text-green-400 border border-green-600/40'
                                    : request.status === 'Approved'
                                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/40'
                                    : request.status === 'Declined'
                                    ? 'bg-red-600/20 text-red-400 border border-red-600/40'
                                    : 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/40'
                                }`}
                              >
                                {request.status}
                              </span>
                              <button
                                onClick={() => handleDeleteMovieRequest(request.id)}
                                title="Cancel Request"
                                className="p-2 text-zinc-500 hover:text-red-400 bg-zinc-800/80 hover:bg-zinc-800 rounded-xl transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-zinc-500 text-sm">
                        No movie requests submitted yet. Use the form above to request any movie or show.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 8: ACCOUNT SETTINGS */}
              {/* ========================================================= */}
              {activeTab === 'settings' && (
                <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 sm:p-8">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-8">Account Settings</h2>

                  <div className="space-y-8">
                    {/* Subscription Settings */}
                    {userProfile.subscription && (
                      <div className="p-6 bg-zinc-800/40 border border-zinc-800 rounded-2xl">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                          <div>
                            <span className="text-xs uppercase tracking-wider font-bold text-zinc-500">
                              Membership Tier
                            </span>
                            <h4 className="text-2xl font-black text-white mt-1">
                              {userProfile.subscription.plan} Plan
                            </h4>
                            <p className="text-zinc-400 text-xs mt-1">
                              Valid from {userProfile.subscription.startDate} to {userProfile.subscription.endDate}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/30 rounded-full text-xs font-bold self-start">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active Subscription
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-700/60">
                          <button
                            onClick={() => setShowPlanModal(true)}
                            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-colors shadow"
                          >
                            Change Plan
                          </button>
                          <button
                            onClick={handleToggleAutoRenew}
                            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition-colors"
                          >
                            {userProfile.subscription.autoRenew ? 'Disable Auto-Renew' : 'Enable Auto-Renew'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Language & Playback Preferences */}
                    <div>
                      <h3 className="text-lg font-bold mb-4">Playback & Experience</h3>
                      <div className="space-y-4">
                        {/* Display Language */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-zinc-800/40 border border-zinc-800 rounded-2xl">
                          <div>
                            <h5 className="font-semibold text-sm">Display Language</h5>
                            <p className="text-zinc-400 text-xs">Audio and UI language preference</p>
                          </div>
                          <select
                            value={activeProfile.preferences.language || 'English'}
                            onChange={(e) => {
                              const updated = {
                                ...activeProfile,
                                preferences: { ...activeProfile.preferences, language: e.target.value }
                              };
                              updateProfile(activeProfile.id, updated);
                              setActiveProfile(updated);
                              triggerToast(`Language updated to ${e.target.value}`);
                            }}
                            className="bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-red-500"
                          >
                            {languages.map((lang) => (
                              <option key={lang.code} value={lang.name}>
                                {lang.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Default Video Quality */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-zinc-800/40 border border-zinc-800 rounded-2xl">
                          <div>
                            <h5 className="font-semibold text-sm">Default Video Quality</h5>
                            <p className="text-zinc-400 text-xs">Streaming bitrate and resolution ceiling</p>
                          </div>
                          <select
                            value={activeProfile.preferences.defaultQuality || 'Auto'}
                            onChange={(e) => {
                              const updated = {
                                ...activeProfile,
                                preferences: { ...activeProfile.preferences, defaultQuality: e.target.value }
                              };
                              updateProfile(activeProfile.id, updated);
                              setActiveProfile(updated);
                              triggerToast(`Quality set to ${e.target.value}`);
                            }}
                            className="bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-red-500"
                          >
                            <option value="Auto">Auto (Best for connection)</option>
                            <option value="4K">4K Ultra HD</option>
                            <option value="1080p">1080p Full HD</option>
                            <option value="720p">720p HD</option>
                            <option value="480p">480p SD (Data Saver)</option>
                          </select>
                        </div>

                        {/* Subtitles */}
                        <div className="flex items-center justify-between p-5 bg-zinc-800/40 border border-zinc-800 rounded-2xl">
                          <div>
                            <h5 className="font-semibold text-sm">Always Display Subtitles</h5>
                            <p className="text-zinc-400 text-xs">Show English closed captions automatically</p>
                          </div>
                          <button
                            onClick={() => {
                              const updated = {
                                ...activeProfile,
                                preferences: {
                                  ...activeProfile.preferences,
                                  subtitlesEnabled: !activeProfile.preferences.subtitlesEnabled,
                                }
                              };
                              updateProfile(activeProfile.id, updated);
                              setActiveProfile(updated);
                              triggerToast(
                                updated.preferences.subtitlesEnabled
                                  ? 'Subtitles enabled by default.'
                                  : 'Subtitles disabled.'
                              );
                            }}
                            className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors ${
                              activeProfile.preferences.subtitlesEnabled ? 'bg-red-600' : 'bg-zinc-700'
                            }`}
                          >
                            <div
                              className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                                activeProfile.preferences.subtitlesEnabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="pt-8 border-t border-zinc-800">
                      <h3 className="text-lg font-bold text-red-500 mb-2">Danger Zone</h3>
                      <p className="text-zinc-400 text-xs mb-4">
                        Actions here permanently wipe your profile, history, and preferences.
                      </p>
                      <div className="p-5 bg-red-950/20 border border-red-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h5 className="font-bold text-sm text-white">Delete Account</h5>
                          <p className="text-zinc-400 text-xs">
                            Permanently delete your account and all associated playlists and profiles.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowDeleteAccountModal(true)}
                          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors self-start"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Change Plan Modal */}
                  {showPlanModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold">Select Subscription Plan</h3>
                          <button onClick={() => setShowPlanModal(false)} className="p-1 text-zinc-400 hover:text-white">
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="space-y-4">
                          {[
                            { name: 'Free', price: '$0 / mo', desc: 'Standard definition with occasional promos' },
                            { name: 'Premium', price: '$9.99 / mo', desc: 'Full HD 1080p, ad-free, 2 simultaneous streams' },
                            { name: 'VIP', price: '$14.99 / mo', desc: '4K Ultra HD + HDR, spatial audio, 4 streams' },
                            { name: 'Family', price: '$19.99 / mo', desc: 'All VIP perks + 6 customizable profiles' },
                          ].map((plan) => (
                            <div
                              key={plan.name}
                              onClick={() => handleUpdateSubscriptionPlan(plan.name as any)}
                              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                                userProfile.subscription?.plan === plan.name
                                  ? 'bg-red-600/10 border-red-500'
                                  : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-500'
                              }`}
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-white text-base">{plan.name}</h4>
                                  <span className="text-xs font-semibold text-red-400">{plan.price}</span>
                                </div>
                                <p className="text-zinc-400 text-xs mt-1">{plan.desc}</p>
                              </div>
                              {userProfile.subscription?.plan === plan.name ? (
                                <CheckCircle2 className="w-5 h-5 text-red-500 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-zinc-500 flex-shrink-0" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delete Account Modal */}
                  {showDeleteAccountModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                      <div className="bg-zinc-900 border border-red-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
                        <div className="flex items-center gap-3 text-red-500 mb-4">
                          <AlertTriangle className="w-6 h-6" />
                          <h3 className="text-xl font-bold">Confirm Account Deletion</h3>
                        </div>
                        <p className="text-zinc-300 text-sm mb-6 leading-relaxed">
                          Are you sure you want to permanently delete your account for{' '}
                          <span className="font-bold text-white">{userProfile.email}</span>? All profiles, watch history,
                          and favorites will be permanently erased.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={handleDeleteAccountConfirm}
                            className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-bold text-white transition-colors"
                          >
                            Yes, Delete My Account
                          </button>
                          <button
                            onClick={() => setShowDeleteAccountModal(false)}
                            className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 9: PARENTAL CONTROLS */}
              {/* ========================================================= */}
              {activeTab === 'parental' && (
                <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-4 border-b border-zinc-800">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold">Parental Controls</h2>
                      <p className="text-zinc-400 text-sm mt-1">
                        Protect your family with PIN lock restrictions and age-based maturity limits.
                      </p>
                    </div>
                    {parentalSettings.kidsModeEnabled && (
                      <Link
                        href="/kids"
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-xl font-bold text-sm hover:from-yellow-300 hover:to-orange-400 transition-all shadow-lg self-start"
                      >
                        <Play className="w-4 h-4" fill="currentColor" />
                        Enter Kids Mode
                      </Link>
                    )}
                  </div>

                  <div className="space-y-8">
                    {/* Kids Mode Toggle */}
                    <div className="p-6 bg-zinc-800/40 border border-zinc-800 rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-base text-white">Kids Mode Portal</h4>
                          <p className="text-zinc-400 text-xs mt-0.5">
                            Filter the catalog to only show animation, cartoons, and child-safe content.
                          </p>
                        </div>
                        <button
                          onClick={handleToggleKidsMode}
                          className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors ${
                            parentalSettings.kidsModeEnabled ? 'bg-yellow-500' : 'bg-zinc-700'
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                              parentalSettings.kidsModeEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {parentalSettings.kidsModeEnabled && (
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center justify-between">
                          <span className="text-xs text-yellow-300 font-medium">
                            Kids Mode is currently active. Navigation shows family-friendly channels.
                          </span>
                          <Link
                            href="/kids"
                            className="text-xs font-bold text-yellow-400 hover:underline flex items-center gap-1"
                          >
                            Go to Kids Home <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* PIN Protection */}
                    <div className="p-6 bg-zinc-800/40 border border-zinc-800 rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-base text-white">4-Digit Security PIN</h4>
                          <p className="text-zinc-400 text-xs mt-0.5">
                            Require this PIN before switching out of Kids Mode or viewing adult ratings.
                          </p>
                        </div>
                        {parentalSettings.pin && (
                          <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5" />
                            PIN Active
                          </span>
                        )}
                      </div>

                      {parentalSettings.pin ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-zinc-900/60 rounded-xl border border-zinc-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-green-400">
                              <Lock className="w-5 h-5" />
                            </div>
                            <div>
                              <h5 className="font-bold text-sm text-white">PIN Protection is Active</h5>
                              <p className="text-zinc-500 text-xs">PIN is required for restricted content</p>
                            </div>
                          </div>
                          <button
                            onClick={handleRemovePin}
                            className="px-4 py-2 bg-zinc-800 hover:bg-red-900/30 hover:text-red-400 rounded-xl text-xs font-semibold text-zinc-300 transition-colors"
                          >
                            Remove PIN
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4 max-w-md pt-2">
                          <label className="block text-zinc-400 text-xs font-medium">
                            Set New 4-Digit Parental PIN
                          </label>
                          <div className="flex gap-3">
                            <input
                              type="password"
                              maxLength={4}
                              placeholder="PIN"
                              value={pinInput}
                              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                              className="w-1/2 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center text-xl font-bold tracking-widest focus:outline-none focus:border-red-500"
                            />
                            <input
                              type="password"
                              maxLength={4}
                              placeholder="Confirm"
                              value={confirmPinInput}
                              onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                              className="w-1/2 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center text-xl font-bold tracking-widest focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <button
                            onClick={handleSavePin}
                            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-xs font-bold text-white transition-colors shadow"
                          >
                            Save Security PIN
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Content Rating Restriction */}
                    <div className="p-6 bg-zinc-800/40 border border-zinc-800 rounded-2xl">
                      <h4 className="font-bold text-base text-white mb-1">Maturity Rating Ceiling</h4>
                      <p className="text-zinc-400 text-xs mb-5">
                        Titles above this rating will require PIN authorization to stream.
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {(['G', 'PG', 'PG-13', 'R', 'NC-17'] as const).map((rating) => {
                          const isSelected = parentalSettings.maxAllowedRating === rating;
                          return (
                            <button
                              key={rating}
                              onClick={() => handleSetRatingRestriction(rating)}
                              className={`p-4 rounded-2xl border text-center transition-all ${
                                isSelected
                                  ? 'bg-red-600 text-white border-red-500 font-bold shadow-lg shadow-red-600/30'
                                  : 'bg-zinc-800/70 text-zinc-300 border-zinc-700 hover:border-zinc-500 font-semibold'
                              }`}
                            >
                              <div className="text-lg">{rating}</div>
                              <span className="text-[10px] opacity-75 mt-1 block">
                                {rating === 'G'
                                  ? 'All Ages'
                                  : rating === 'PG'
                                  ? 'Parental Guide'
                                  : rating === 'PG-13'
                                  ? 'Teens 13+'
                                  : rating === 'R'
                                  ? 'Mature 17+'
                                  : 'Adults Only'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
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
