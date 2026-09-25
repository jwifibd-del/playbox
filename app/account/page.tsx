'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  LogOut,
  Film,
  Tv,
  Search,
  RotateCcw,
  CheckCircle2,
  Plus,
  Users,
  Check,
  Smartphone,
  AlertCircle,
  FolderDown,
  HardDrive,
  RefreshCw,
  Sliders,
  Eye,
  EyeOff,
  Volume2,
  Wifi,
  Layers,
  FileText,
  Sparkles,
  Radio,
  Pause,
  DownloadCloud,
  CheckCheck,
  CreditCard,
  Globe,
  SlidersHorizontal,
  ShieldAlert,
  HelpCircle,
  KeyRound,
  Trash
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
  Profile,
  getProfileWatchHistory,
  saveProfileWatchHistory,
  removeFromWatchHistory,
  clearWatchHistory,
  resetWatchHistoryToDefault,
  buildResumeUrl,
  ContinueWatchingItem,
  FavoriteItem,
  getProfileFavorites,
  removeFavorite,
  clearProfileFavorites,
  resetProfileFavorites,
  toggleFavorite,
  type Download as DownloadItem,
  getDownloads,
  deleteDownload,
  toggleDownloadStatus,
  clearAllDownloads,
  resetDownloadsToDefault,
  addDownload,
  getStorageStats,
  StorageStats,
  UserNotification,
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
  addUserNotification,
  verifyParentalPin
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
  const { data: session, status } = useSession();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const syncedSessionEmailRef = useRef<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isAccessReady, setIsAccessReady] = useState(false);
  const [parentalSettings, setParentalSettings] = useState<ParentalControlSettings | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
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
  const [watchHistory, setWatchHistory] = useState<ContinueWatchingItem[]>([]);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'movies' | 'tv' | 'in_progress' | 'completed'>('all');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showNewProfileModal, setShowNewProfileModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileIsKids, setNewProfileIsKids] = useState(false);

  // Favorites state
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favFilter, setFavFilter] = useState<'all' | 'movies' | 'tv'>('all');
  const [favSearchQuery, setFavSearchQuery] = useState('');
  const [showClearFavModal, setShowClearFavModal] = useState(false);

  // Downloads state
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [dlFilter, setDlFilter] = useState<'all' | 'completed' | 'downloading'>('all');
  const [dlSearchQuery, setDlSearchQuery] = useState('');
  const [storageStats, setStorageStats] = useState<StorageStats>(getStorageStats);
  const [showClearDownloadsModal, setShowClearDownloadsModal] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');
  const [showClearNotifsModal, setShowClearNotifsModal] = useState(false);

  // Movie Requests filters
  const [requestFilter, setRequestFilter] = useState<'all' | 'Pending' | 'Approved' | 'Reviewing'>('all');
  const [requestSearch, setRequestSearch] = useState('');

  // Settings modals
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Parental controls PIN states
  const [pinError, setPinError] = useState<string | null>(null);
  const [showVerifyPinModal, setShowVerifyPinModal] = useState(false);
  const [verifyPinInput, setVerifyPinInput] = useState('');
  const [verifyPinError, setVerifyPinError] = useState<string | null>(null);
  const [pendingPinAction, setPendingPinAction] = useState<(() => void) | null>(null);
  
  // Language options
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ja', name: '日本語' }
  ];

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (status === 'loading') return;

    const isAuthenticatedLocally = isUserAuthenticated();
    const isAuthenticatedSession = status === 'authenticated';

    if (!isAuthenticatedLocally && !isAuthenticatedSession) {
      router.replace('/login');
      return;
    }

    // If we have a Google session, sync it into local storage for profile management
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

        // Preserve any existing custom dataURL avatar the user uploaded previously (don't overwrite with Google's URL on every sync)
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

        const accessToken = (session as any)?.accessToken;
        const backendUser = (session as any)?.backendUser;
        if (accessToken) {
          localStorage.setItem('playflix_token', String(accessToken));
        }
        if (backendUser) {
          const refreshed = getUserProfile();
          localStorage.setItem(
            'playflix_user',
            JSON.stringify({
              ...backendUser,
              avatar: refreshed?.avatar || backendUser.avatar,
              fullName: refreshed?.fullName || backendUser.fullName || fullName,
              profiles: refreshed?.profiles || backendUser.profiles,
              activeProfileId: refreshed?.activeProfileId || backendUser.activeProfileId,
            })
          );
        } else {
          const refreshed = getUserProfile();
          localStorage.setItem(
            'playflix_user',
            JSON.stringify({
              email,
              name: fullName,
              fullName: refreshed?.fullName || fullName,
              avatar: refreshed?.avatar,
              profiles: refreshed?.profiles,
              activeProfileId: refreshed?.activeProfileId,
            }),
          );
        }
      }
    }

    setIsAccessReady(true);
  }, [status, session, router]);

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

      setUserProfile((currentProfile) => {
        if (!currentProfile) return currentProfile;
        return {
          ...currentProfile,
          avatar: imageDataUrl
        };
      });
      setEditMode(true);
    };
    reader.onerror = () => {
      alert('Unable to upload the selected image.');
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const unreadNotifsCount = useMemo(() => notifications.filter((n) => n.unread).length, [notifications]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'history', label: 'Watch History', icon: Clock, count: watchHistory.length },
    { id: 'favorites', label: 'Favorites', icon: Heart, count: favorites.length },
    { id: 'downloads', label: 'Downloads', icon: Download, count: downloads.length },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadNotifsCount },
    { id: 'requests', label: 'Movie Requests', icon: MessageSquare, count: movieRequests.length },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'parental', label: 'Parental Controls', icon: Shield }
  ];

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  }, []);

  const refreshWatchHistory = useCallback(() => {
    const currentActive = getActiveProfile();
    const items = getProfileWatchHistory(currentActive?.id);
    setWatchHistory(items);
  }, []);

  const refreshFavorites = useCallback(() => {
    const currentActive = getActiveProfile();
    setFavorites(getProfileFavorites(currentActive?.id));
  }, []);

  const refreshDownloads = useCallback(() => {
    setDownloads(getDownloads());
    setStorageStats(getStorageStats());
  }, []);

  const refreshNotifications = useCallback(() => {
    const prof = getUserProfile();
    setNotifications(getUserNotifications(prof?.email));
  }, []);

  const refreshMovieRequests = useCallback(() => {
    const profileEmail = getUserProfile()?.email || '';
    const all = getMovieRequests();
    const userReqs = all.filter(
      (r) =>
        !r.requesterEmail ||
        r.requesterEmail.toLowerCase() === profileEmail.toLowerCase() ||
        r.requesterEmail.toLowerCase() === 'alex.morgan@playflix.com'
    );
    setMovieRequests(userReqs);
  }, []);

  useEffect(() => {
    if (!isAccessReady || !hydrated) {
      return;
    }

    setUserProfile(getUserProfile());
    setActiveProfile(getActiveProfile());
    setParentalSettings(getParentalControlSettings());
    refreshWatchHistory();
    refreshFavorites();
    refreshDownloads();
    refreshNotifications();
    refreshMovieRequests();
  }, [
    isAccessReady,
    hydrated,
    refreshWatchHistory,
    refreshFavorites,
    refreshDownloads,
    refreshNotifications,
    refreshMovieRequests
  ]);

  useEffect(() => {
    if (!hydrated || !isAccessReady) return;

    const onWatchHistoryUpdated = () => refreshWatchHistory();
    const onFavoritesUpdated = () => refreshFavorites();
    const onDownloadsUpdated = () => refreshDownloads();
    const onNotifsUpdated = () => refreshNotifications();
    const onRequestsUpdated = () => refreshMovieRequests();
    const onParentalUpdated = () => setParentalSettings(getParentalControlSettings());

    window.addEventListener('playflix_watch_history_updated', onWatchHistoryUpdated);
    window.addEventListener('playflix_favorites_updated', onFavoritesUpdated);
    window.addEventListener('playflix-downloads-updated', onDownloadsUpdated);
    window.addEventListener('playflix_notifications_updated', onNotifsUpdated);
    window.addEventListener('playflix-movie-requests-updated', onRequestsUpdated);
    window.addEventListener('playflix-parental-settings-updated', onParentalUpdated);
    window.addEventListener('storage', () => {
      refreshWatchHistory();
      refreshFavorites();
      refreshDownloads();
      refreshNotifications();
      refreshMovieRequests();
      setParentalSettings(getParentalControlSettings());
    });

    return () => {
      window.removeEventListener('playflix_watch_history_updated', onWatchHistoryUpdated);
      window.removeEventListener('playflix_favorites_updated', onFavoritesUpdated);
      window.removeEventListener('playflix-downloads-updated', onDownloadsUpdated);
      window.removeEventListener('playflix_notifications_updated', onNotifsUpdated);
      window.removeEventListener('playflix-movie-requests-updated', onRequestsUpdated);
      window.removeEventListener('playflix-parental-settings-updated', onParentalUpdated);
    };
  }, [
    hydrated,
    isAccessReady,
    refreshWatchHistory,
    refreshFavorites,
    refreshDownloads,
    refreshNotifications,
    refreshMovieRequests
  ]);

  // Watch history actions
  const handleClearAllHistory = () => {
    clearWatchHistory(activeProfile?.id);
    setWatchHistory([]);
    setShowClearConfirmModal(false);
    showToast('Watch history cleared');
  };

  const handleRemoveHistoryItem = (itemId: string | number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const updated = removeFromWatchHistory(itemId, activeProfile?.id);
    setWatchHistory(updated);
    showToast('Removed from watch history');
  };

  const handleResetDefaultHistory = () => {
    const defaults = resetWatchHistoryToDefault(activeProfile?.id);
    setWatchHistory(defaults);
    showToast('Sample watch history loaded');
  };

  // Favorites actions
  const handleRemoveFavorite = (favId: string | number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const updated = removeFavorite(favId, activeProfile?.id);
    setFavorites(updated);
    showToast('Removed from favorites');
  };

  const handleClearAllFavorites = () => {
    clearProfileFavorites(activeProfile?.id);
    setFavorites([]);
    setShowClearFavModal(false);
    showToast('All favorites cleared');
  };

  const handleResetDefaultFavorites = () => {
    const defaults = resetProfileFavorites(activeProfile?.id);
    setFavorites(defaults);
    showToast('Sample favorites restored');
  };

  // Downloads actions
  const handleToggleDownload = (dlId: string) => {
    const updated = toggleDownloadStatus(dlId);
    setDownloads(updated);
    setStorageStats(getStorageStats());
    const item = updated.find((d) => d.id === dlId);
    if (item?.status === 'downloading') {
      showToast(`Resumed download: ${item.title}`);
    } else if (item?.status === 'paused') {
      showToast(`Paused download: ${item.title}`);
    }
  };

  const handleDeleteDownload = (dlId: string) => {
    const updated = deleteDownload(dlId);
    setDownloads(updated);
    setStorageStats(getStorageStats());
    showToast('Download deleted from device');
  };

  const handleClearAllDownloads = () => {
    clearAllDownloads();
    setDownloads([]);
    setStorageStats(getStorageStats());
    setShowClearDownloadsModal(false);
    showToast('All downloads cleared');
  };

  const handleAddSampleDownload = () => {
    const sample = sampleMovies[Math.floor(Math.random() * sampleMovies.length)];
    const added = addDownload({
      contentId: sample.id,
      title: sample.title,
      posterPath: sample.posterPath,
      backdropPath: sample.backdropPath,
      contentType: 'movie',
      quality: '1080p',
      size: '2.4 GB',
      progress: 100,
      status: 'completed',
    });
    setDownloads(added);
    setStorageStats(getStorageStats());
    showToast(`Added "${sample.title}" to downloads`);
  };

  const handleResetDownloads = () => {
    const defs = resetDownloadsToDefault();
    setDownloads(defs);
    setStorageStats(getStorageStats());
    showToast('Default downloads restored');
  };

  // Notifications actions
  const handleMarkAsRead = (notifId: string) => {
    const updated = markNotificationRead(notifId, userProfile?.email);
    setNotifications(updated);
  };

  const handleMarkAllRead = () => {
    const updated = markAllNotificationsRead(userProfile?.email);
    setNotifications(updated);
    showToast('All notifications marked as read');
  };

  const handleDeleteNotification = (notifId: string) => {
    const updated = deleteNotification(notifId, userProfile?.email);
    setNotifications(updated);
    showToast('Notification deleted');
  };

  const handleClearAllNotifications = () => {
    clearAllNotifications(userProfile?.email);
    setNotifications([]);
    setShowClearNotifsModal(false);
    showToast('All notifications cleared');
  };

  // Movie Requests actions
  const handleSubmitMovieRequest = () => {
    if (!requestForm.title.trim()) {
      showToast('Please enter a movie or TV show title');
      return;
    }
    const result = submitMovieRequest({
      title: requestForm.title.trim(),
      type: requestForm.type,
      notes: requestForm.notes.trim(),
      requesterEmail: userProfile?.email || 'alex.morgan@playflix.com',
      requesterName: userProfile?.fullName || 'Alex Morgan',
    });

    if (!result.success) {
      showToast(result.message || 'Unable to submit your request.');
      return;
    }

    setRequestForm({ title: '', type: 'Movie', notes: '' });
    refreshMovieRequests();
    refreshNotifications();
    showToast('Movie request submitted! Our curation team has been notified.');
  };

  const handleDeleteMovieRequest = (reqId: string) => {
    const updated = deleteMovieRequest(reqId);
    setMovieRequests(updated);
    showToast('Movie request canceled');
  };

  // Parental PIN actions
  const handleSetPin = () => {
    setPinError(null);
    if (pinInput.length !== 4 || !/^\d{4}$/.test(pinInput)) {
      setPinError('PIN must be exactly 4 digits (0-9)');
      return;
    }
    if (pinInput !== confirmPinInput) {
      setPinError('PINs do not match. Please verify.');
      return;
    }
    if (!parentalSettings) return;
    const updated = {
      ...parentalSettings,
      pin: pinInput,
      pinEnabled: true,
    };
    setParentalSettings(updated);
    saveParentalControlSettings(updated);
    setPinInput('');
    setConfirmPinInput('');
    showToast('4-digit PIN configured and enabled!');
  };

  const handleRemovePin = () => {
    if (!parentalSettings) return;
    const updated = {
      ...parentalSettings,
      pin: '',
      pinEnabled: false,
    };
    setParentalSettings(updated);
    saveParentalControlSettings(updated);
    showToast('Parental PIN disabled');
  };

  const handleToggleKidsMode = () => {
    if (!parentalSettings) return;
    if (parentalSettings.kidsModeEnabled && parentalSettings.pinEnabled && parentalSettings.pin) {
      setPendingPinAction(() => () => {
        const next = { ...parentalSettings, kidsModeEnabled: false };
        setParentalSettings(next);
        saveParentalControlSettings(next);
        showToast('Kids Mode disabled');
      });
      setShowVerifyPinModal(true);
      return;
    }

    const nextState = !parentalSettings.kidsModeEnabled;
    const updated = { ...parentalSettings, kidsModeEnabled: nextState };
    setParentalSettings(updated);
    saveParentalControlSettings(updated);
    showToast(nextState ? 'Kids Mode enabled' : 'Kids Mode disabled');
  };

  const handleSwitchProfile = (profileId: string | number) => {
    switchProfile(profileId);
    const refreshedActive = getActiveProfile();
    setActiveProfile(refreshedActive);
    const refreshedUser = getUserProfile();
    setUserProfile(refreshedUser);
    const history = getProfileWatchHistory(refreshedActive?.id);
    setWatchHistory(history);
    refreshFavorites();
    showToast(`Switched profile to ${refreshedActive?.name || 'Profile'}`);
  };

  const handleAddProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    const added = addProfile({
      name: newProfileName.trim(),
      isKids: newProfileIsKids,
      avatar: newProfileIsKids 
        ? 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&h=100&fit=crop&crop=faces'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
      pin: '',
      preferences: {
        language: 'en',
        subtitlesEnabled: true,
        defaultQuality: '1080p'
      }
    });
    setNewProfileName('');
    setNewProfileIsKids(false);
    setShowNewProfileModal(false);
    const refreshedUser = getUserProfile();
    setUserProfile(refreshedUser);
    if (added) {
      handleSwitchProfile(added.id);
    }
  };

  const filteredWatchHistory = useMemo(() => {
    return watchHistory.filter((item) => {
      if (historyFilter === 'movies' && item.kind !== 'movie') return false;
      if (historyFilter === 'tv' && item.kind !== 'episode') return false;
      if (historyFilter === 'in_progress' && (item.progress >= 95 || item.completed)) return false;
      if (historyFilter === 'completed' && item.progress < 95 && !item.completed) return false;

      if (historySearchQuery.trim()) {
        const q = historySearchQuery.trim().toLowerCase();
        const t = (item.title || '').toLowerCase();
        const s = (item.showName || '').toLowerCase();
        return t.includes(q) || s.includes(q);
      }
      return true;
    });
  }, [watchHistory, historyFilter, historySearchQuery]);

  const handleSaveProfile = () => {
    if (userProfile) {
      saveUserProfile(userProfile);
      setEditMode(false);
      showToast('Profile saved successfully!');
    }
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

  const handleLogout = async () => {
    // Log out of both NextAuth session and local storage
    await signOut({ redirect: false });
    logoutUser();
    setIsAccessReady(false);
    router.replace('/login');
  };

  const handleUpdatePreferences = (changes: Partial<Profile['preferences']>) => {
    if (!activeProfile) return;
    const updated: Profile = {
      ...activeProfile,
      preferences: {
        ...activeProfile.preferences,
        ...changes,
      },
    };
    updateProfile(activeProfile.id, updated);
    setActiveProfile(updated);
    showToast('Preferences updated');
  };

  const handleChangePlan = (plan: string) => {
    if (!userProfile) return;
    const updatedUser: UserProfile = {
      ...userProfile,
      subscription: userProfile.subscription
        ? { ...userProfile.subscription, plan }
        : {
            plan,
            status: 'active',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
            autoRenew: true,
          },
    };
    saveUserProfile(updatedUser);
    setUserProfile(updatedUser);
    setShowPlanModal(false);
    showToast(`Switched plan to ${plan}`);
  };

  const handleToggleAutoRenew = () => {
    if (!userProfile || !userProfile.subscription) return;
    const nextVal = !userProfile.subscription.autoRenew;
    const updatedUser: UserProfile = {
      ...userProfile,
      subscription: {
        ...userProfile.subscription,
        autoRenew: nextVal,
      },
    };
    saveUserProfile(updatedUser);
    setUserProfile(updatedUser);
    showToast(nextVal ? 'Auto-renew enabled' : 'Auto-renew disabled');
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      showToast('Please type "DELETE" in the confirmation box');
      return;
    }
    logoutUser();
    localStorage.clear();
    router.replace('/login');
  };

  const filteredFavorites = useMemo(() => {
    return favorites.filter((fav) => {
      if (favFilter === 'movies' && fav.kind !== 'movie') return false;
      if (favFilter === 'tv' && fav.kind !== 'tv') return false;
      if (favSearchQuery.trim()) {
        const q = favSearchQuery.trim().toLowerCase();
        return (fav.title || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [favorites, favFilter, favSearchQuery]);

  const filteredDownloads = useMemo(() => {
    return downloads.filter((dl) => {
      if (dlFilter === 'completed' && dl.status !== 'completed') return false;
      if (dlFilter === 'downloading' && dl.status === 'completed') return false;
      if (dlSearchQuery.trim()) {
        const q = dlSearchQuery.trim().toLowerCase();
        return (dl.title || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [downloads, dlFilter, dlSearchQuery]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      if (notifFilter === 'unread' && !notif.unread) return false;
      return true;
    });
  }, [notifications, notifFilter]);

  const filteredMovieRequests = useMemo(() => {
    return movieRequests.filter((req) => {
      if (requestFilter !== 'all' && req.status.toLowerCase() !== requestFilter.toLowerCase()) return false;
      if (requestSearch.trim()) {
        const q = requestSearch.trim().toLowerCase();
        return (req.title || '').toLowerCase().includes(q) || (req.notes || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [movieRequests, requestFilter, requestSearch]);

  if (!hydrated || !isAccessReady || !userProfile || !parentalSettings || !activeProfile) {
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
              {/* User Avatar & Profile Switcher */}
              <div className="flex items-center gap-4 mb-4">
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
              


              {/* Active Profile Quick Switcher */}
              <div className="mb-5 p-3 bg-zinc-800/40 border border-zinc-800/80 rounded-xl">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={activeProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'}
                      alt={activeProfile.name}
                      className="w-7 h-7 rounded-full object-cover border border-zinc-700"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{activeProfile.name}</p>
                      <p className="text-[10px] text-zinc-400">Active Profile</p>
                    </div>
                  </div>
                  {userProfile.profiles.length > 1 && (
                    <select
                      value={activeProfile.id}
                      onChange={(e) => handleSwitchProfile(e.target.value)}
                      className="bg-zinc-800 text-[11px] text-red-400 font-medium rounded px-1.5 py-1 border border-zinc-700/60 outline-none hover:text-red-300"
                    >
                      {userProfile.profiles.map((p) => (
                        <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                          {p.name}
                        </option>
                      ))}
                    </select>
                  )}
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
                        'w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ' +
                        (activeTab === tab.id
                          ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                          : 'text-zinc-400 hover:bg-zinc-800 hover:text-white')
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </div>
                      {typeof tab.count === 'number' && tab.count > 0 && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            activeTab === tab.id
                              ? 'bg-white/20 text-white'
                              : 'bg-zinc-800 text-zinc-300 border border-zinc-700/60'
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
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
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 sm:p-8">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white">Watch History</h2>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                          {watchHistory.length} {watchHistory.length === 1 ? 'title' : 'titles'}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-sm mt-1">
                        Resume movies & shows you&apos;ve started watching on any device.
                      </p>
                    </div>

                    <div className="flex items-center flex-wrap gap-2.5">
                      {/* Active Profile Indicator / Quick Switcher */}
                      {userProfile && userProfile.profiles && userProfile.profiles.length > 0 && (
                        <div className="flex items-center gap-2 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl px-3 py-1.5 transition-colors">
                          <img
                            src={activeProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'}
                            alt={activeProfile?.name || 'Profile'}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="text-xs text-zinc-300 font-medium">
                            {activeProfile?.name || 'Profile'}
                          </span>
                          {userProfile.profiles.length > 1 && (
                            <select
                              value={activeProfile?.id || ''}
                              onChange={(e) => handleSwitchProfile(e.target.value)}
                              className="bg-zinc-900 text-xs text-red-400 font-medium cursor-pointer outline-none hover:text-red-300 rounded px-1"
                              title="Switch Profile"
                            >
                              {userProfile.profiles.map((p) => (
                                <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                                  {p.name} {p.id === activeProfile?.id ? '(active)' : ''}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      )}

                      {/* Clear History Button */}
                      {watchHistory.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowClearConfirmModal(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-all"
                        >
                          <Trash2 size={14} />
                          <span>Clear All</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter & Search Bar */}
                  {watchHistory.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-6 mb-6">
                      {/* Filter tabs */}
                      <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-zinc-800/80 overflow-x-auto">
                        <button
                          type="button"
                          onClick={() => setHistoryFilter('all')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                            historyFilter === 'all'
                              ? 'bg-red-600 text-white shadow-sm'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          All ({watchHistory.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setHistoryFilter('movies')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                            historyFilter === 'movies'
                              ? 'bg-red-600 text-white shadow-sm'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          <Film size={12} />
                          Movies
                        </button>
                        <button
                          type="button"
                          onClick={() => setHistoryFilter('tv')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                            historyFilter === 'tv'
                              ? 'bg-red-600 text-white shadow-sm'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          <Tv size={12} />
                          TV Shows
                        </button>
                        <button
                          type="button"
                          onClick={() => setHistoryFilter('in_progress')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                            historyFilter === 'in_progress'
                              ? 'bg-red-600 text-white shadow-sm'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          In Progress
                        </button>
                        <button
                          type="button"
                          onClick={() => setHistoryFilter('completed')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                            historyFilter === 'completed'
                              ? 'bg-red-600 text-white shadow-sm'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          Completed
                        </button>
                      </div>

                      {/* Search box */}
                      <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-3.5 h-3.5" />
                        <input
                          type="text"
                          value={historySearchQuery}
                          onChange={(e) => setHistorySearchQuery(e.target.value)}
                          placeholder="Search in history..."
                          className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                        />
                        {historySearchQuery && (
                          <button
                            type="button"
                            onClick={() => setHistorySearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* List / Grid of History Items */}
                  {filteredWatchHistory.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                      {filteredWatchHistory.map((item) => {
                        const resumeUrl = buildResumeUrl(item);
                        const isCompleted = item.progress >= 95 || item.completed;

                        return (
                          <div
                            key={item.id}
                            className="group relative bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/40 flex flex-col cursor-pointer"
                            onClick={() => {
                              if (resumeUrl && resumeUrl !== '#') router.push(resumeUrl);
                            }}
                          >
                            {/* Visual Thumbnail */}
                            <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
                              <img
                                src={item.backdropPath || item.posterPath}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                                onError={(ev) => {
                                  if (item.posterPath) (ev.currentTarget as HTMLImageElement).src = item.posterPath;
                                }}
                              />

                              {/* Badges Overlay */}
                              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-black/75 backdrop-blur-sm text-zinc-300 border border-white/10 uppercase">
                                  {item.kind === 'episode' ? 'Episode' : 'Movie'}
                                </span>
                                {item.lastDevice && item.lastDevice.startsWith('mobile') && (
                                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/80 text-black">
                                    <Smartphone size={10} /> Mobile
                                  </span>
                                )}
                              </div>

                              {/* Remove Single Item Button */}
                              <button
                                type="button"
                                title="Remove from watch history"
                                onClick={(e) => handleRemoveHistoryItem(item.id, e)}
                                className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/75 hover:bg-red-600 text-zinc-300 hover:text-white flex items-center justify-center opacity-80 hover:opacity-100 transition-all z-10"
                              >
                                <X size={14} />
                              </button>

                              {/* Hover Play Button Overlay */}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg transition-transform transform group-hover:scale-110">
                                  <Play size={20} fill="white" className="ml-0.5" />
                                </div>
                              </div>

                              {/* Progress bar */}
                              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800">
                                <div
                                  className={`h-full ${isCompleted ? 'bg-emerald-500' : 'bg-red-600'} transition-all`}
                                  style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }}
                                />
                              </div>
                            </div>

                            {/* Content Info */}
                            <div className="p-4 flex-1 flex flex-col justify-between">
                              <div>
                                <h3 className="font-semibold text-white text-base line-clamp-1 group-hover:text-red-400 transition-colors">
                                  {item.title}
                                </h3>
                                {item.showName && (
                                  <p className="text-zinc-400 text-xs mt-0.5 line-clamp-1">
                                    {item.showName}
                                  </p>
                                )}
                              </div>

                              <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
                                <div className="flex items-center gap-1.5">
                                  <Clock size={12} className="text-zinc-500" />
                                  <span>{item.currentTime} / {item.duration}</span>
                                </div>
                                <span className={`font-medium ${isCompleted ? 'text-emerald-400' : 'text-zinc-300'}`}>
                                  {isCompleted ? 'Watched' : `${Math.round(item.progress)}%`}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : watchHistory.length > 0 ? (
                    /* Filter empty state */
                    <div className="py-16 text-center">
                      <p className="text-zinc-400 text-sm mb-3">
                        No watch history items matched your filter or search query.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setHistoryFilter('all');
                          setHistorySearchQuery('');
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    /* Zero-state empty history */
                    <div className="py-16 px-4 text-center max-w-md mx-auto">
                      <div className="w-16 h-16 rounded-full bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center mx-auto mb-4 text-zinc-400">
                        <Clock size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No Watch History Yet</h3>
                      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                        Movies and TV show episodes you watch will appear here so you can easily resume watching from where you stopped across any device.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <Link
                          href="/movies"
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-xs transition-colors shadow-sm"
                        >
                          <Film size={14} />
                          <span>Browse Movies</span>
                        </Link>
                        <Link
                          href="/tv"
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors"
                        >
                          <Tv size={14} />
                          <span>Browse TV Shows</span>
                        </Link>
                        <button
                          type="button"
                          onClick={handleResetDefaultHistory}
                          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 text-xs transition-colors"
                        >
                          <RotateCcw size={13} />
                          <span>Load Sample History</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Favorites/Watchlist Tab */}
              {activeTab === 'favorites' && (
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 lg:p-8">
                  {/* Header & Controls */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl lg:text-3xl font-bold text-white">My Favorites</h2>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-600/20 text-red-400 border border-red-500/30">
                          {favorites.length} {favorites.length === 1 ? 'Title' : 'Titles'}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-sm mt-1">
                        Titles saved to {activeProfile?.name || 'this profile'}'s watchlist
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetDefaultFavorites}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 transition-colors"
                        title="Load sample favorites"
                      >
                        <RotateCcw size={14} />
                        <span className="hidden sm:inline">Load Samples</span>
                      </button>
                      {favorites.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowClearFavModal(true)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-900/40 border border-red-900/50 transition-colors"
                        >
                          <Trash size={14} />
                          <span>Clear All</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter tabs & Search Bar */}
                  {favorites.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-zinc-800">
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                        {(['all', 'movies', 'tv'] as const).map((filter) => {
                          const count =
                            filter === 'all'
                              ? favorites.length
                              : filter === 'movies'
                              ? favorites.filter((f) => f.kind === 'movie').length
                              : favorites.filter((f) => f.kind === 'tv').length;
                          return (
                            <button
                              key={filter}
                              type="button"
                              onClick={() => setFavFilter(filter)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                favFilter === filter
                                  ? 'bg-red-600 text-white shadow-sm'
                                  : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-750'
                              }`}
                            >
                              {filter === 'all' ? 'All' : filter === 'movies' ? 'Movies' : 'TV Shows'} ({count})
                            </button>
                          );
                        })}
                      </div>

                      <div className="relative min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                          type="text"
                          value={favSearchQuery}
                          onChange={(e) => setFavSearchQuery(e.target.value)}
                          placeholder="Search favorites..."
                          className="w-full bg-zinc-800/80 border border-zinc-700/60 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {/* Favorites Grid */}
                  {filteredFavorites.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {filteredFavorites.map((fav) => (
                        <div
                          key={fav.id}
                          className="group relative bg-zinc-950/60 rounded-2xl border border-zinc-800 overflow-hidden hover:border-zinc-700 hover:shadow-xl transition-all duration-300 flex flex-col"
                        >
                          {/* Poster Image */}
                          <div className="relative aspect-[16/10] sm:aspect-[2/3] w-full bg-zinc-900 overflow-hidden">
                            <img
                              src={fav.posterPath || fav.backdropPath || sampleMovies[0].posterPath}
                              alt={fav.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            {/* Badge */}
                            <div className="absolute top-3 left-3 flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/10">
                                {fav.kind === 'tv' ? 'TV Series' : 'Movie'}
                              </span>
                              {fav.rating ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/80 backdrop-blur-md text-black">
                                  ★ {fav.rating.toFixed(1)}
                                </span>
                              ) : null}
                            </div>

                            {/* Action overlay */}
                            <button
                              type="button"
                              onClick={(e) => handleRemoveFavorite(fav.id, e)}
                              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-red-600/90 text-zinc-300 hover:text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md"
                              title="Remove from favorites"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {/* Details & Watch Button */}
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-red-400 transition-colors">
                                {fav.title}
                              </h3>
                              <p className="text-zinc-500 text-xs mt-1">
                                {fav.releaseDate ? fav.releaseDate.split('-')[0] : (fav.year ? String(fav.year) : 'Feature')}
                                {fav.genres?.length ? ` • ${fav.genres.slice(0, 2).join(', ')}` : ''}
                              </p>
                            </div>

                            <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                              <Link
                                href={fav.kind === 'tv' ? `/watch/tv/${fav.contentId || fav.id}/1/1` : `/watch/movie/${fav.contentId || fav.id}`}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors"
                              >
                                <Play size={12} fill="white" />
                                <span>Watch Now</span>
                              </Link>
                              <button
                                type="button"
                                onClick={(e) => handleRemoveFavorite(fav.id, e)}
                                className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-zinc-800/80 transition-colors"
                                title="Remove"
                              >
                                <Heart size={16} className="fill-red-500 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : favorites.length > 0 ? (
                    <div className="py-12 text-center">
                      <Search className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                      <p className="text-zinc-400 text-sm">No favorites matched your filter or search query.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setFavFilter('all');
                          setFavSearchQuery('');
                        }}
                        className="mt-3 px-4 py-1.5 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
                      >
                        Reset Filter
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-16 px-4 max-w-md mx-auto">
                      <div className="w-16 h-16 rounded-full bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center mx-auto mb-4 text-zinc-400">
                        <Heart className="w-8 h-8 text-zinc-500" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No Favorites Yet</h3>
                      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                        Click the heart or plus icon on any movie or TV show to save it to your personal watchlist here.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <Link
                          href="/movies"
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-xs transition-colors shadow-sm"
                        >
                          <Film size={14} />
                          <span>Browse Movies</span>
                        </Link>
                        <Link
                          href="/tv"
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors"
                        >
                          <Tv size={14} />
                          <span>Browse TV Shows</span>
                        </Link>
                        <button
                          type="button"
                          onClick={handleResetDefaultFavorites}
                          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 text-xs transition-colors"
                        >
                          <RotateCcw size={13} />
                          <span>Load Samples</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Downloads Tab */}
              {activeTab === 'downloads' && (
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 lg:p-8">
                  {/* Header & Storage Meter */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl lg:text-3xl font-bold text-white">Downloads</h2>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/30">
                          {downloads.length} {downloads.length === 1 ? 'Item' : 'Items'}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-sm mt-1">
                        Watch your favorite shows and movies offline anytime
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddSampleDownload}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 transition-colors"
                        title="Simulate adding a download"
                      >
                        <DownloadCloud size={14} />
                        <span className="hidden sm:inline">Add Download</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleResetDownloads}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 transition-colors"
                        title="Reset downloads to default"
                      >
                        <RotateCcw size={14} />
                        <span className="hidden sm:inline">Reset Defaults</span>
                      </button>
                      {downloads.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowClearDownloadsModal(true)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-900/40 border border-red-900/50 transition-colors"
                        >
                          <Trash size={14} />
                          <span>Clear All</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Device Storage Status Card */}
                  <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 mb-6">
                    <div className="flex items-center justify-between text-xs text-zinc-300 mb-2">
                      <div className="flex items-center gap-2 font-medium">
                        <HardDrive size={15} className="text-blue-400" />
                        <span>Device Storage (PlayFlix Offline Cache)</span>
                      </div>
                      <span className="text-zinc-400">
                        {storageStats.usedFormatted} used of {storageStats.totalFormatted} ({storageStats.usedPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(storageStats.usedPercent, 2)}%` }}
                      />
                    </div>
                  </div>

                  {/* Filter tabs & Search */}
                  {downloads.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-zinc-800">
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                        {(['all', 'completed', 'downloading'] as const).map((filter) => {
                          const count =
                            filter === 'all'
                              ? downloads.length
                              : filter === 'completed'
                              ? downloads.filter((d) => d.status === 'completed').length
                              : downloads.filter((d) => d.status !== 'completed').length;
                          return (
                            <button
                              key={filter}
                              type="button"
                              onClick={() => setDlFilter(filter)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                dlFilter === filter
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-750'
                              }`}
                            >
                              {filter === 'all'
                                ? 'All'
                                : filter === 'completed'
                                ? 'Downloaded'
                                : 'In Progress'}{' '}
                              ({count})
                            </button>
                          );
                        })}
                      </div>

                      <div className="relative min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                          type="text"
                          value={dlSearchQuery}
                          onChange={(e) => setDlSearchQuery(e.target.value)}
                          placeholder="Search downloads..."
                          className="w-full bg-zinc-800/80 border border-zinc-700/60 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {/* Downloads list */}
                  {filteredDownloads.length > 0 ? (
                    <div className="space-y-3">
                      {filteredDownloads.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-zinc-950/60 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative flex-shrink-0 w-20 h-14 sm:w-24 sm:h-16 rounded-lg bg-zinc-800 overflow-hidden">
                              <img
                                src={item.backdropPath || item.posterPath || sampleMovies[0].backdropPath}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                              {item.status === 'completed' && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                </div>
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-white text-base line-clamp-1">{item.title}</h3>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                                  {item.quality}
                                </span>
                              </div>
                              <p className="text-zinc-500 text-xs mt-0.5">
                                {item.size} • {item.downloadedDate || item.completedAt || item.addedAt || 'Downloaded'}
                                {item.contentType === 'tv' && item.episodeInfo
                                  ? ` • S${item.episodeInfo.season} E${item.episodeInfo.episode}`
                                  : ''}
                              </p>

                              {/* Progress bar if downloading or paused */}
                              {item.status !== 'completed' && (
                                <div className="w-48 max-w-full mt-2">
                                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                                    <span>{item.status === 'paused' ? 'Paused' : 'Downloading...'}</span>
                                    <span>{item.progress}%</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full transition-all duration-300 ${
                                        item.status === 'paused' ? 'bg-amber-500' : 'bg-blue-500'
                                      }`}
                                      style={{ width: `${item.progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 sm:self-center self-end">
                            {item.status === 'completed' ? (
                              <Link
                                href={
                                  item.contentType === 'tv' && item.episodeInfo
                                    ? `/watch/tv/${item.contentId || item.id}/${item.episodeInfo.season}/${item.episodeInfo.episode}`
                                    : `/watch/movie/${item.contentId || item.id}`
                                }
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors"
                              >
                                <Play size={13} fill="white" />
                                <span>Watch Offline</span>
                              </Link>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleDownload(item.id)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium transition-colors"
                              >
                                {item.status === 'downloading' ? (
                                  <>
                                    <Pause size={13} />
                                    <span>Pause</span>
                                  </>
                                ) : (
                                  <>
                                    <Play size={13} />
                                    <span>Resume</span>
                                  </>
                                )}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteDownload(item.id)}
                              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800/80 rounded-xl transition-colors"
                              title="Delete download"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : downloads.length > 0 ? (
                    <div className="py-12 text-center">
                      <Search className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                      <p className="text-zinc-400 text-sm">No downloads matched your search or filter.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setDlFilter('all');
                          setDlSearchQuery('');
                        }}
                        className="mt-3 px-4 py-1.5 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
                      >
                        Reset Filter
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-16 px-4 max-w-md mx-auto">
                      <div className="w-16 h-16 rounded-full bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center mx-auto mb-4 text-zinc-400">
                        <FolderDown className="w-8 h-8 text-zinc-500" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No Downloads Yet</h3>
                      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                        Download movies and episodes to watch while traveling or offline without consuming mobile data.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={handleAddSampleDownload}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow-sm"
                        >
                          <DownloadCloud size={14} />
                          <span>Download Sample Content</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleResetDownloads}
                          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 text-xs transition-colors"
                        >
                          <RotateCcw size={13} />
                          <span>Restore Defaults</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 lg:p-8">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl lg:text-3xl font-bold text-white">Notifications</h2>
                        {unreadNotifsCount > 0 && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-600 text-white">
                            {unreadNotifsCount} New
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-400 text-sm mt-1">
                        Updates on new releases, requests, and account alerts
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {unreadNotifsCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 transition-colors"
                        >
                          <CheckCheck size={14} />
                          <span>Mark All Read</span>
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowClearNotifsModal(true)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-900/40 border border-red-900/50 transition-colors"
                        >
                          <Trash size={14} />
                          <span>Clear All</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter tabs */}
                  {notifications.length > 0 && (
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setNotifFilter('all')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          notifFilter === 'all'
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        All ({notifications.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotifFilter('unread')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          notifFilter === 'unread'
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        Unread ({unreadNotifsCount})
                      </button>
                    </div>
                  )}

                  {/* Notifications list */}
                  {filteredNotifications.length > 0 ? (
                    <div className="space-y-3">
                      {filteredNotifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (item.unread) handleMarkAsRead(item.id);
                          }}
                          className={`group relative flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                            item.unread
                              ? 'bg-red-950/20 border-red-500/30 hover:border-red-500/50'
                              : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          {/* Left icon badge */}
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                              item.unread
                                ? 'bg-red-600 text-white shadow-md'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {item.type === 'release' ? (
                              <Film size={18} />
                            ) : item.type === 'reminder' ? (
                              <Clock size={18} />
                            ) : item.type === 'request' ? (
                              <MessageSquare size={18} />
                            ) : (
                              <Bell size={18} />
                            )}
                          </div>

                          {/* Notification Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2">
                              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                                {item.title}
                                {item.unread && (
                                  <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                                )}
                              </h3>
                              <span className="text-zinc-500 text-xs whitespace-nowrap">{item.date}</span>
                            </div>
                            <p className="text-zinc-400 text-xs mt-1 leading-relaxed">{item.message}</p>

                            {(item.actionUrl || item.link) && (
                              <Link
                                href={item.actionUrl || item.link || '#'}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium mt-2 transition-colors"
                              >
                                <span>View details</span>
                                <span>→</span>
                              </Link>
                            )}
                          </div>

                          {/* Delete icon */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(item.id);
                            }}
                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800/80 rounded-lg transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 px-4 max-w-md mx-auto">
                      <div className="w-16 h-16 rounded-full bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center mx-auto mb-4 text-zinc-400">
                        <CheckCheck className="w-8 h-8 text-zinc-500" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">You're All Caught Up!</h3>
                      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                        There are no new notifications. We'll alert you whenever new movies drop or your requests get updated.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Movie Requests Tab */}
              {activeTab === 'requests' && (
                <div className="space-y-8">
                  {/* Submit Card */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 lg:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                      <div>
                        <h2 className="text-2xl lg:text-3xl font-bold text-white">Movie Requests</h2>
                        <p className="text-zinc-400 text-sm mt-1">
                          Can't find what you're looking for? Request titles directly to our curation team.
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-300 text-xs">
                        <MessageSquare className="w-4 h-4 text-red-400" />
                        <span>{movieRequests.length} Total Requests</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-zinc-300 mb-1.5 text-xs font-medium">Title *</label>
                        <input
                          type="text"
                          value={requestForm.title}
                          onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                          placeholder="e.g., Inception, Breaking Bad Season 2..."
                          className="w-full bg-zinc-800/90 border border-zinc-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-300 mb-1.5 text-xs font-medium">Type</label>
                        <select
                          value={requestForm.type}
                          onChange={(e) =>
                            setRequestForm({ ...requestForm, type: e.target.value as MovieRequest['type'] })
                          }
                          className="w-full bg-zinc-800/90 border border-zinc-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                        >
                          <option value="Movie">Movie</option>
                          <option value="TV Show">TV Show</option>
                        </select>
                      </div>
                      <div className="lg:col-span-2">
                        <label className="block text-zinc-300 mb-1.5 text-xs font-medium">
                          Notes / Release Year / Language (Optional)
                        </label>
                        <textarea
                          value={requestForm.notes}
                          onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                          placeholder="Provide any helpful details like director, release year, or specific language dub/subtitles desired."
                          rows={3}
                          className="w-full bg-zinc-800/90 border border-zinc-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <p className="text-zinc-500 text-xs">
                        Requesting as: <span className="text-zinc-300">{userProfile?.email || 'Active User'}</span>
                      </p>
                      <button
                        type="button"
                        onClick={handleSubmitMovieRequest}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-semibold text-white transition-colors shadow-sm"
                      >
                        <Plus size={15} />
                        <span>Submit Request</span>
                      </button>
                    </div>
                  </div>

                  {/* Request History Card */}
                  <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <h3 className="text-xl font-bold text-white">Your Request History</h3>

                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                          <input
                            type="text"
                            value={requestSearch}
                            onChange={(e) => setRequestSearch(e.target.value)}
                            placeholder="Filter requests..."
                            className="bg-zinc-800 border border-zinc-700 rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                          />
                        </div>

                        <select
                          value={requestFilter}
                          onChange={(e) => setRequestFilter(e.target.value as any)}
                          className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-1 text-xs text-white focus:outline-none"
                        >
                          <option value="all">All Statuses</option>
                          <option value="Pending">Pending</option>
                          <option value="Reviewing">Reviewing</option>
                          <option value="Approved">Approved</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {filteredMovieRequests.map((request) => {
                        const statusColor =
                          request.status === 'Approved'
                            ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
                            : request.status === 'Reviewing'
                            ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                            : request.status === 'Rejected'
                            ? 'bg-red-600/20 text-red-400 border-red-500/30'
                            : 'bg-amber-600/20 text-amber-400 border-amber-500/30';

                        return (
                          <div
                            key={request.id}
                            className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 hover:border-zinc-700 transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2.5">
                                  <h4 className="text-base font-semibold text-white">{request.title}</h4>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                                    {request.type}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColor}`}
                                  >
                                    {request.status}
                                  </span>
                                </div>
                                <p className="text-zinc-500 text-xs mt-1">
                                  Requested on {request.createdAt}
                                  {request.requesterEmail ? ` by ${request.requesterEmail}` : ''}
                                </p>
                                {request.notes && (
                                  <p className="text-zinc-300 text-xs mt-2 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                                    "{request.notes}"
                                  </p>
                                )}
                                {request.adminNotes && (
                                  <p className="text-emerald-300 text-xs mt-2 flex items-center gap-1">
                                    <Sparkles size={12} />
                                    <span>Team response: {request.adminNotes}</span>
                                  </p>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteMovieRequest(request.id)}
                                className="self-end sm:self-start p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800/80 rounded-lg transition-colors"
                                title="Cancel request"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {filteredMovieRequests.length === 0 && (
                        <div className="text-center py-12 text-zinc-500">
                          <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                          <h4 className="text-base font-semibold text-white mb-1">No Requests Found</h4>
                          <p className="text-xs">Use the form above to submit your desired titles.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Account Settings Tab */}
              {activeTab === 'settings' && (
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 lg:p-8">
                  <h2 className="text-2xl lg:text-3xl font-bold text-white mb-6">Account Settings</h2>

                  <div className="space-y-8">
                    {/* Subscription Settings */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <CreditCard size={18} className="text-red-400" />
                        <span>Membership & Billing</span>
                      </h3>
                      <div className="p-5 bg-zinc-950/60 rounded-xl border border-zinc-800">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-lg text-white">
                                {userProfile.subscription?.plan || 'Premium 4K'} Plan
                              </h4>
                              <span className="px-2.5 py-0.5 bg-emerald-600/20 text-emerald-400 rounded-full border border-emerald-600/30 text-xs font-semibold">
                                Active
                              </span>
                            </div>
                            <p className="text-zinc-400 text-xs mt-1">
                              Billing period: {userProfile.subscription?.startDate || '2026-01-01'} to{' '}
                              {userProfile.subscription?.endDate || '2026-12-31'}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setShowPlanModal(true)}
                              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold transition-colors"
                            >
                              Change Plan
                            </button>
                            <button
                              type="button"
                              onClick={handleToggleAutoRenew}
                              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-medium border border-zinc-700 transition-colors"
                            >
                              {userProfile.subscription?.autoRenew ? 'Disable Auto-Renew' : 'Enable Auto-Renew'}
                            </button>
                          </div>
                        </div>

                        <div className="text-xs text-zinc-500 pt-3 border-t border-zinc-800 flex items-center justify-between">
                          <span>
                            Auto-Renew status:{' '}
                            <strong className={userProfile.subscription?.autoRenew ? 'text-emerald-400' : 'text-amber-400'}>
                              {userProfile.subscription?.autoRenew ? 'Enabled (Renews automatically)' : 'Disabled (Expires at period end)'}
                            </strong>
                          </span>
                          <span>Next invoice: $19.99/mo</span>
                        </div>
                      </div>
                    </div>

                    {/* Language & Region Settings */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Globe size={18} className="text-blue-400" />
                        <span>Language & Region</span>
                      </h3>
                      <div className="p-5 bg-zinc-950/60 rounded-xl border border-zinc-800">
                        <div className="max-w-md">
                          <label className="block text-zinc-400 mb-2 text-xs font-medium">Display Language</label>
                          <select
                            value={activeProfile.preferences.language || 'English'}
                            onChange={(e) => handleUpdatePreferences({ language: e.target.value })}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                          >
                            {languages.map((lang) => (
                              <option key={lang.code} value={lang.name}>
                                {lang.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Playback Settings */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <SlidersHorizontal size={18} className="text-indigo-400" />
                        <span>Playback & Streaming</span>
                      </h3>
                      <div className="space-y-3">
                        {/* Auto-Play */}
                        <div className="flex items-center justify-between p-4 bg-zinc-950/60 rounded-xl border border-zinc-800">
                          <div>
                            <h4 className="font-medium text-sm text-white">Auto-Play Next Episode</h4>
                            <p className="text-zinc-500 text-xs">Play the next episode automatically while watching a TV show</p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdatePreferences({
                                autoPlayNext:
                                  activeProfile.preferences.autoPlayNext === undefined
                                    ? false
                                    : !activeProfile.preferences.autoPlayNext,
                              })
                            }
                            className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${
                              activeProfile.preferences.autoPlayNext !== false ? 'bg-red-600' : 'bg-zinc-700'
                            }`}
                          >
                            <div
                              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                activeProfile.preferences.autoPlayNext !== false ? 'right-0.5' : 'left-0.5'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Default Video Quality */}
                        <div className="flex items-center justify-between p-4 bg-zinc-950/60 rounded-xl border border-zinc-800">
                          <div>
                            <h4 className="font-medium text-sm text-white">Default Video Quality</h4>
                            <p className="text-zinc-500 text-xs">Preferred playback resolution on this profile</p>
                          </div>
                          <select
                            value={activeProfile.preferences.defaultQuality || 'Auto'}
                            onChange={(e) => handleUpdatePreferences({ defaultQuality: e.target.value })}
                            className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                          >
                            <option value="Auto">Auto (Recommended)</option>
                            <option value="4K">4K Ultra HD</option>
                            <option value="1080p">1080p Full HD</option>
                            <option value="720p">720p HD</option>
                            <option value="480p">480p SD</option>
                          </select>
                        </div>

                        {/* Subtitles */}
                        <div className="flex items-center justify-between p-4 bg-zinc-950/60 rounded-xl border border-zinc-800">
                          <div>
                            <h4 className="font-medium text-sm text-white">Closed Captions & Subtitles</h4>
                            <p className="text-zinc-500 text-xs">Display closed captions or subtitles whenever available</p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdatePreferences({
                                subtitlesEnabled: !activeProfile.preferences.subtitlesEnabled,
                              })
                            }
                            className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${
                              activeProfile.preferences.subtitlesEnabled ? 'bg-red-600' : 'bg-zinc-700'
                            }`}
                          >
                            <div
                              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                activeProfile.preferences.subtitlesEnabled ? 'right-0.5' : 'left-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Privacy Settings */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Shield size={18} className="text-emerald-400" />
                        <span>Privacy & Activity</span>
                      </h3>
                      <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800 flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm text-white">Share Watch Activity</h4>
                          <p className="text-zinc-500 text-xs">
                            Allow recommendation engine to use watch history for personalized feeds
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdatePreferences({
                              showWatchActivity: !activeProfile.preferences.showWatchActivity,
                            })
                          }
                          className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${
                            activeProfile.preferences.showWatchActivity ? 'bg-red-600' : 'bg-zinc-700'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                              activeProfile.preferences.showWatchActivity ? 'right-0.5' : 'left-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="border-t border-zinc-800 pt-6">
                      <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                        <AlertCircle size={18} />
                        <span>Danger Zone</span>
                      </h3>
                      <div className="p-5 bg-red-950/20 border border-red-900/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-sm text-white">Delete Account & Data</h4>
                          <p className="text-zinc-400 text-xs mt-1">
                            Permanently delete your profile, watch history, saved favorites, and subscription data.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowDeleteAccountModal(true)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Parental Controls Tab */}
              {activeTab === 'parental' && (
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 lg:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl lg:text-3xl font-bold text-white">Parental Controls</h2>
                        {parentalSettings.kidsModeEnabled && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-600 text-white">
                            Kids Mode Active
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-400 text-sm mt-1">
                        Configure 4-digit PIN protection, age ratings, and child-safe browsing
                      </p>
                    </div>

                    {parentalSettings.kidsModeEnabled && (
                      <button
                        type="button"
                        onClick={() => router.push('/kids')}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-xl font-bold text-xs hover:from-yellow-300 hover:to-orange-400 transition-all shadow-md"
                      >
                        <Play fill="black" size={14} />
                        <span>Launch Kids Portal</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* PIN Protection */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <KeyRound size={18} className="text-amber-400" />
                        <span>4-Digit PIN Lock</span>
                      </h3>

                      <div className="p-5 bg-zinc-950/60 rounded-xl border border-zinc-800">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-medium text-sm text-white">Enable Master PIN</h4>
                            <p className="text-zinc-400 text-xs">
                              Require a 4-digit code to play mature content or exit kids mode
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (parentalSettings.pinEnabled && parentalSettings.pin) {
                                // Confirm disable
                                handleRemovePin();
                              } else {
                                const updated = { ...parentalSettings, pinEnabled: true };
                                setParentalSettings(updated);
                                saveParentalControlSettings(updated);
                              }
                            }}
                            className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${
                              parentalSettings.pinEnabled ? 'bg-red-600' : 'bg-zinc-700'
                            }`}
                          >
                            <div
                              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                parentalSettings.pinEnabled ? 'right-0.5' : 'left-0.5'
                              }`}
                            />
                          </button>
                        </div>

                        {parentalSettings.pinEnabled && (
                          <div className="pt-4 border-t border-zinc-800">
                            {parentalSettings.pin ? (
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-emerald-950/20 border border-emerald-900/40 rounded-xl">
                                <div className="flex items-center gap-3">
                                  <Lock className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                  <div>
                                    <h5 className="font-semibold text-xs text-white">
                                      PIN Protection is Configured (••••)
                                    </h5>
                                    <p className="text-zinc-400 text-[11px]">
                                      PIN is required to view content rated higher than{' '}
                                      {parentalSettings.maxAllowedRating}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = { ...parentalSettings, pin: '' };
                                      setParentalSettings(updated);
                                    }}
                                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-medium transition-colors"
                                  >
                                    Change PIN
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleRemovePin}
                                    className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/50 text-red-300 rounded-lg text-xs font-medium transition-colors"
                                  >
                                    Disable
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <p className="text-zinc-300 text-xs font-medium">
                                  Enter a 4-digit code to protect parental controls:
                                </p>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                  <input
                                    type="password"
                                    maxLength={4}
                                    placeholder="PIN (4 digits)"
                                    value={pinInput}
                                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-center text-lg font-bold tracking-widest text-white focus:outline-none focus:border-red-500 w-full sm:w-36"
                                  />
                                  <input
                                    type="password"
                                    maxLength={4}
                                    placeholder="Confirm PIN"
                                    value={confirmPinInput}
                                    onChange={(e) =>
                                      setConfirmPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))
                                    }
                                    className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-center text-lg font-bold tracking-widest text-white focus:outline-none focus:border-red-500 w-full sm:w-36"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleSetPin}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl transition-colors whitespace-nowrap"
                                  >
                                    Save PIN
                                  </button>
                                </div>
                                {pinError && <p className="text-red-400 text-xs font-medium">{pinError}</p>}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content Rating Restrictions */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <ShieldAlert size={18} className="text-red-400" />
                        <span>Maximum Content Rating Allowed</span>
                      </h3>
                      <div className="p-5 bg-zinc-950/60 rounded-xl border border-zinc-800">
                        <p className="text-zinc-400 text-xs mb-3">
                          Select the maximum maturity rating accessible without entering parental PIN:
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                          {(['G', 'PG', 'PG-13', 'R', 'NC-17'] as const).map((rating) => {
                            const isSelected = parentalSettings.maxAllowedRating === rating;
                            return (
                              <button
                                key={rating}
                                type="button"
                                onClick={() => {
                                  const updated = {
                                    ...parentalSettings,
                                    maxAllowedRating: rating,
                                  };
                                  setParentalSettings(updated);
                                  saveParentalControlSettings(updated);
                                  showToast(`Maximum rating set to ${rating}`);
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                  isSelected
                                    ? 'bg-red-600 text-white shadow-md scale-105'
                                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                                }`}
                              >
                                {rating}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-zinc-500 text-[11px] mt-3">
                          Current restriction:{' '}
                          <strong className="text-zinc-300">{parentalSettings.maxAllowedRating}</strong> and below will
                          play freely. Higher ratings require PIN authorization.
                        </p>
                      </div>
                    </div>

                    {/* Kids Profile Mode Toggle */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Sparkles size={18} className="text-yellow-400" />
                        <span>Dedicated Kids Experience</span>
                      </h3>
                      <div className="p-5 bg-zinc-950/60 rounded-xl border border-zinc-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-sm text-white">Enable Kids Mode Environment</h4>
                            <p className="text-zinc-400 text-xs">
                              Curates friendly animations, family titles, and blocks mature metadata
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleToggleKidsMode}
                            className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${
                              parentalSettings.kidsModeEnabled ? 'bg-red-600' : 'bg-zinc-700'
                            }`}
                          >
                            <div
                              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                parentalSettings.kidsModeEnabled ? 'right-0.5' : 'left-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Save Changes Button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          saveParentalControlSettings(parentalSettings);
                          showToast('Parental controls saved successfully!');
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                      >
                        <Save size={15} />
                        <span>Save All Changes</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Clear Watch History Confirmation Modal */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Clear Watch History?</h3>
                <p className="text-zinc-400 text-xs mt-0.5">
                  For {activeProfile?.name || 'this profile'}
                </p>
              </div>
            </div>
            <p className="text-zinc-300 text-sm mb-6 leading-relaxed">
              This will remove all titles and progress from your continue watching list and watch history. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAllHistory}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Favorites Confirmation Modal */}
      {showClearFavModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
                <Heart size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Clear All Favorites?</h3>
                <p className="text-zinc-400 text-xs mt-0.5">
                  For {activeProfile?.name || 'this profile'}
                </p>
              </div>
            </div>
            <p className="text-zinc-300 text-sm mb-6 leading-relaxed">
              This will remove all {favorites.length} saved movies and TV shows from your watchlist.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowClearFavModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAllFavorites}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
              >
                Clear Favorites
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Downloads Confirmation Modal */}
      {showClearDownloadsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
                <FolderDown size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Clear All Downloads?</h3>
                <p className="text-zinc-400 text-xs mt-0.5">Free up {storageStats.usedFormatted} of storage</p>
              </div>
            </div>
            <p className="text-zinc-300 text-sm mb-6 leading-relaxed">
              This will remove all downloaded media from this device. You will need an internet connection to watch these titles again.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowClearDownloadsModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAllDownloads}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
              >
                Delete All Downloads
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Notifications Confirmation Modal */}
      {showClearNotifsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Clear All Notifications?</h3>
                <p className="text-zinc-400 text-xs mt-0.5">{notifications.length} notification items</p>
              </div>
            </div>
            <p className="text-zinc-300 text-sm mb-6 leading-relaxed">
              Are you sure you want to dismiss all notifications in your inbox?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowClearNotifsModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAllNotifications}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Choose Your Plan</h3>
                <p className="text-zinc-400 text-xs mt-0.5">Switch anytime. Changes apply immediately.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPlanModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { name: 'Basic', price: '$8.99/mo', res: '720p HD', devices: '1 Device' },
                { name: 'Standard', price: '$13.99/mo', res: '1080p Full HD', devices: '2 Devices simultaneously' },
                { name: 'Premium 4K', price: '$19.99/mo', res: '4K Ultra HD + HDR', devices: '4 Devices + Spatial Audio' },
                { name: 'Family Plus', price: '$24.99/mo', res: '4K Ultra HD + HDR', devices: '6 Devices + Kids Safe Controls' },
              ].map((plan) => {
                const isCurrent = (userProfile.subscription?.plan || 'Premium 4K').toLowerCase().includes(plan.name.toLowerCase().split(' ')[0]);
                return (
                  <div
                    key={plan.name}
                    onClick={() => handleChangePlan(plan.name)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isCurrent
                        ? 'border-red-500 bg-red-950/20'
                        : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{plan.name}</span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-400 text-xs mt-0.5">
                        {plan.res} • {plan.devices}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-white">{plan.price}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowPlanModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-red-900/50 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Permanently Delete Account?</h3>
                <p className="text-red-400 text-xs mt-0.5">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-zinc-300 text-xs mb-4 leading-relaxed">
              All profile preferences, watch histories, downloads, favorites, and saved metadata for{' '}
              <strong className="text-white">{userProfile?.email}</strong> will be permanently wiped.
            </p>
            <div className="mb-4">
              <label className="block text-zinc-400 text-xs mb-1.5 font-medium">
                Type <span className="text-red-400 font-bold">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteAccountModal(false);
                  setDeleteConfirmText('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== 'DELETE'}
                onClick={handleDeleteAccount}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition-colors ${
                  deleteConfirmText === 'DELETE'
                    ? 'bg-red-600 hover:bg-red-700 cursor-pointer shadow-sm'
                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-zinc-900 border border-zinc-700 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-2xl animate-slideUp">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </main>
  );
}
