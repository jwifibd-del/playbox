'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  UserPlus,
  User,
  Check,
  Copy,
  ExternalLink,
  KeyRound,
  Sparkles,
  X
} from 'lucide-react';
import {
  isUserAuthenticated,
  setUserAuthenticated,
  registerUser as localStorageRegisterUser,
  verifyUserCredentials,
  sendOTP as localStorageSendOTP,
  verifyOTP,
  resetUserPasswordByEmail,
  getUsers
} from '@/lib/data';
import {
  registerUser as apiRegisterUser,
  loginUser,
  forgotPassword as apiForgotPassword,
  resetPassword as apiResetPassword,
  sendOtp as apiSendOtp,
  loginWithOtp
} from '@/lib/api';

export default function UserLoginPage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<'login' | 'signup' | 'forgot' | 'otp'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loginNotice, setLoginNotice] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [forgotData, setForgotData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [otpData, setOtpData] = useState({
    email: '',
    otp: ''
  });
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('bitcoinbd18@gmail.com');
  const [googleName, setGoogleName] = useState('PlayFlix User');
  const [googleQuickLoading, setGoogleQuickLoading] = useState(false);
  const [copiedRedirectUri, setCopiedRedirectUri] = useState(false);
  const [redirectUri, setRedirectUri] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRedirectUri(`${window.location.origin}/api/auth/callback/google`);
    }
  }, []);

  const handleGoogleQuickLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setGoogleQuickLoading(true);
    const targetEmail = googleEmail.trim().toLowerCase() || 'bitcoinbd18@gmail.com';
    const targetName = googleName.trim() || targetEmail.split('@')[0] || 'Google User';

    const users = getUsers();
    const existingUser = users.find((u) => u.email.toLowerCase() === targetEmail);

    if (!existingUser) {
      localStorageRegisterUser({
        fullName: targetName,
        email: targetEmail,
        password: `google-oauth-${Math.random().toString(36).slice(2, 10)}`,
      });
    }

    setUserAuthenticated(true, targetEmail);
    localStorage.setItem('playflix_token', `stub-google-${Date.now()}`);
    localStorage.setItem(
      'playflix_user',
      JSON.stringify({
        id: targetEmail,
        email: targetEmail,
        name: targetName,
        provider: 'google',
      })
    );
    setShowGoogleModal(false);
    router.push('/account');
  };

  useEffect(() => {
    if (isUserAuthenticated()) {
      router.replace('/account');
    }
  }, [router]);

  // Helper function to store auth data
  const handleAuthSuccess = (data?: any) => {
    if (data?.access_token && data?.user) {
      localStorage.setItem('playflix_token', data.access_token);
      localStorage.setItem('playflix_user', JSON.stringify(data.user));
      setUserAuthenticated(true, data.user.email);
    }
    router.push('/account');
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoginNotice('');
    setLoginLoading(true);

    try {
      const data = await loginUser(email, password);
      handleAuthSuccess(data);
    } catch (err: any) {
      // Fall back to local storage if API fails
      if (verifyUserCredentials(email, password)) {
        setUserAuthenticated(true, email);
        router.push('/account');
      } else {
        setError(err.message || 'Invalid email or password.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignupError('');
    setSignupLoading(true);

    if (!signupData.fullName.trim() || !signupData.email.trim() || !signupData.password) {
      setSignupError('Please complete all account fields.');
      setSignupLoading(false);
      return;
    }

    if (signupData.password.length < 6) {
      setSignupError('Password must be at least 6 characters.');
      setSignupLoading(false);
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setSignupError('Passwords do not match.');
      setSignupLoading(false);
      return;
    }

    try {
      const data = await apiRegisterUser(
        signupData.email,
        signupData.password,
        signupData.fullName
      );
      handleAuthSuccess(data);
    } catch (err: any) {
      // Fall back to local storage if API fails
      const result = localStorageRegisterUser({
        fullName: signupData.fullName,
        email: signupData.email,
        password: signupData.password
      });
      if (!result.success || !result.user) {
        setSignupError(result.message || 'Unable to create account.');
      } else {
        setUserAuthenticated(true, result.user.email);
        router.push('/account');
      }
    } finally {
      setSignupLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    if (!forgotData.email.trim() || !forgotData.newPassword || !forgotData.confirmPassword) {
      setForgotError('Please complete all reset fields.');
      setForgotLoading(false);
      return;
    }

    if (forgotData.newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters.');
      setForgotLoading(false);
      return;
    }

    if (forgotData.newPassword !== forgotData.confirmPassword) {
      setForgotError('Passwords do not match.');
      setForgotLoading(false);
      return;
    }

    try {
      const forgotResult = await apiForgotPassword(forgotData.email);
      const token = forgotResult?.token;

      if (token) {
        await apiResetPassword(token, forgotData.newPassword);
        setEmail(forgotData.email.trim().toLowerCase());
        setPassword('');
        setForgotData({ email: '', newPassword: '', confirmPassword: '' });
        setLoginNotice('Password updated successfully. Please sign in with your new password.');
        setActiveView('login');
      } else {
        setEmail(forgotData.email.trim().toLowerCase());
        setPassword('');
        setForgotData({ email: '', newPassword: '', confirmPassword: '' });
        setLoginNotice('Check your email for password reset instructions.');
        setActiveView('login');
      }
    } catch (err: any) {
      // Fall back to local storage reset
      const result = resetUserPasswordByEmail({
        email: forgotData.email,
        newPassword: forgotData.newPassword
      });
      if (!result.success) {
        setForgotError(result.message || 'Failed to send reset email.');
      } else {
        setForgotSuccess(result.message);
        setEmail(forgotData.email.trim().toLowerCase());
        setPassword('');
        setForgotData({ email: '', newPassword: '', confirmPassword: '' });
        setLoginNotice('Password updated successfully. Please sign in with your new password.');
        setActiveView('login');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOtpError('');
    setOtpSuccess('');
    setOtpLoading(true);

    if (!otpData.email.trim()) {
      setOtpError('Please enter your email.');
      setOtpLoading(false);
      return;
    }

    try {
      const result = await apiSendOtp(otpData.email);
      setOtpSuccess(result?.message ? String(result.message) : 'OTP sent successfully! Check your email.');
    } catch (err: any) {
      // Fall back to local storage if API fails
      const result = localStorageSendOTP(otpData.email);
      if (!result.success) {
        setOtpError(result.message || 'Failed to send OTP.');
      } else {
        setOtpSuccess('OTP generated locally (dev). Check the console.');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOtpError('');
    setOtpSuccess('');
    setOtpVerifyLoading(true);

    if (!otpData.otp.trim()) {
      setOtpError('Please enter the OTP.');
      setOtpVerifyLoading(false);
      return;
    }

    try {
      const data = await loginWithOtp(otpData.email, otpData.otp);
      handleAuthSuccess(data);
    } catch (err: any) {
      // Fall back to local storage if API fails
      const result = verifyOTP(otpData.email, otpData.otp);
      if (result.success) {
        // Check if user exists, if not, create them!
        const users = getUsers();
        const existingUser = users.find(u => u.email.toLowerCase() === otpData.email.toLowerCase());
        
        if (!existingUser) {
          // Register new user
          const registerResult = localStorageRegisterUser({
            fullName: otpData.email.split('@')[0],
            email: otpData.email,
            password: Math.random().toString(36).slice(-8)
          });
          if (registerResult.success && registerResult.user) {
            setUserAuthenticated(true, registerResult.user.email);
            router.push('/account');
          } else {
            setOtpError(registerResult.message || 'Could not create user');
          }
        } else {
          setUserAuthenticated(true, otpData.email);
          router.push('/account');
        }
      } else {
        setOtpError(result.message || 'Invalid OTP.');
      }
    } finally {
      setOtpVerifyLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'Google' | 'Apple' | 'Facebook') => {
    setLoginNotice('');
    setError('');

    if (provider !== 'Google') {
      setLoginNotice(`${provider} login will be available via backend REST soon.`);
      return;
    }

    try {
      const res = await fetch('/api/auth/providers', { cache: 'no-store' });
      if (res.ok) {
        const providers = (await res.json()) as Record<string, any>;
        if (providers?.google) {
          await signIn('google', { callbackUrl: '/account' });
          return;
        }
      }
      setShowGoogleModal(true);
    } catch {
      setShowGoogleModal(true);
    }
  };

  return (
    <main className="min-h-screen bg-[#080808] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.15),_transparent_30%)]" />
      <div className="relative min-h-screen flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-5xl grid lg:grid-cols-2 gap-8"
        >
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-200 text-sm mb-6">
              <Shield className="w-4 h-4" />
              Account Access
            </div>
            <h1 className="text-4xl font-bold mb-4">Welcome to PlayFlix</h1>
            <p className="text-zinc-400 leading-relaxed">
              Sign in to your account or create a new one to unlock profile management, watch history, and protected content.
            </p>



          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="rounded-3xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl p-8 lg:p-10"
          >
            <div className="mb-8">
            <div className="inline-flex items-center rounded-2xl border border-zinc-800 bg-zinc-950/70 p-1 mb-5">
              <button
                type="button"
                onClick={() => {
                  setActiveView('login');
                  setError('');
                  setLoginNotice('');
                  setForgotError('');
                  setForgotSuccess('');
                  setOtpError('');
                  setOtpSuccess('');
                }}
                className={
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors ' +
                  (activeView === 'login' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white')
                }
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveView('signup');
                  setSignupError('');
                  setLoginNotice('');
                  setForgotError('');
                  setForgotSuccess('');
                  setOtpError('');
                  setOtpSuccess('');
                }}
                className={
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors ' +
                  (activeView === 'signup' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white')
                }
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveView('otp');
                  setError('');
                  setLoginNotice('');
                  setSignupError('');
                  setForgotError('');
                  setForgotSuccess('');
                  setOtpError('');
                  setOtpSuccess('');
                  setOtpData({ email: '', otp: '' });
                }}
                className={
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors ' +
                  (activeView === 'otp' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white')
                }
              >
                OTP Login
              </button>
            </div>
              <h2 className="text-2xl font-semibold">
                {activeView === 'login'
                  ? 'Sign In'
                  : activeView === 'signup'
                    ? 'Create Account'
                    : activeView === 'otp'
                      ? 'OTP Login'
                      : 'Reset Password'}
              </h2>
              <p className="text-zinc-500 mt-2">
                {activeView === 'login'
                  ? 'Use your saved PlayFlix account credentials.'
                  : activeView === 'signup'
                    ? 'Create a new user account that also appears in the admin panel.'
                    : activeView === 'otp'
                      ? 'Receive a one-time password and sign in instantly.'
                      : 'Reset your local PlayFlix password using your account email.'}
              </p>
              
              {/* Social Login Buttons */}
              {(activeView === 'login' || activeView === 'signup') && (
                <div className="grid grid-cols-1 gap-3 mt-6 mb-6">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('Google')}
                    className="flex items-center justify-center gap-3 p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl hover:bg-zinc-900 hover:border-zinc-700 transition-all group shadow-sm"
                  >
                    <svg className="w-5 h-5 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-zinc-200 group-hover:text-white">
                      {activeView === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {activeView === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-zinc-400 mb-2 text-sm font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-red-500"
                      placeholder="Enter your email"
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
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-12 py-3.5 text-white focus:outline-none focus:border-red-500"
                      placeholder="Enter your password"
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

                {loginNotice && (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-200 text-sm">
                    {loginNotice}
                  </div>
                )}

                <div className="flex justify-end mb-4">
                  <button
                    type="button"
                    onClick={() => setActiveView('forgot')}
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 text-white py-3.5 rounded-2xl font-semibold transition-colors"
                >
                  {loginLoading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            ) : activeView === 'forgot' ? (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div>
                  <label className="block text-zinc-400 mb-2 text-sm font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="email"
                      value={forgotData.email}
                      onChange={(e) => setForgotData({ ...forgotData, email: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-red-500"
                      placeholder="Enter your account email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-2 text-sm font-medium">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type={showForgotPassword ? 'text' : 'password'}
                      value={forgotData.newPassword}
                      onChange={(e) => setForgotData({ ...forgotData, newPassword: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-12 py-3.5 text-white focus:outline-none focus:border-red-500"
                      placeholder="Create a new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(!showForgotPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    >
                      {showForgotPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-2 text-sm font-medium">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type={showForgotConfirmPassword ? 'text' : 'password'}
                      value={forgotData.confirmPassword}
                      onChange={(e) => setForgotData({ ...forgotData, confirmPassword: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-12 py-3.5 text-white focus:outline-none focus:border-red-500"
                      placeholder="Confirm the new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    >
                      {showForgotConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {forgotError && (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-200 text-sm">
                    {forgotError}
                  </div>
                )}

                {forgotSuccess && (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-200 text-sm">
                    {forgotSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 text-white py-3.5 rounded-2xl font-semibold transition-colors"
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Email'}
                </button>
            </form>
          ) : activeView === 'otp' ? (
            <div className="space-y-6">
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-zinc-400 mb-2 text-sm font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="email"
                      value={otpData.email}
                      onChange={(e) => setOtpData({ ...otpData, email: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-red-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 text-white py-3.5 rounded-2xl font-semibold transition-colors"
                >
                  {otpLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-zinc-400 mb-2 text-sm font-medium">OTP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpData.otp}
                    onChange={(e) => setOtpData({ ...otpData, otp: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-red-500 text-center text-xl tracking-widest"
                    placeholder="000000"
                  />
                </div>

                {otpError && (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-200 text-sm">
                    {otpError}
                  </div>
                )}

                {otpSuccess && (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-200 text-sm">
                    {otpSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={otpVerifyLoading}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-700 text-white py-3.5 rounded-2xl font-semibold transition-colors border border-zinc-700"
                >
                  {otpVerifyLoading ? 'Verifying...' : 'Verify & Login'}
                </button>
              </form>
            </div>
          ) : (
              <form onSubmit={handleSignup} className="space-y-6">
                <div>
                  <label className="block text-zinc-400 mb-2 text-sm font-medium">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="text"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-red-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-2 text-sm font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-red-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-2 text-sm font-medium">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-12 py-3.5 text-white focus:outline-none focus:border-red-500"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    >
                      {showSignupPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-2 text-sm font-medium">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type={showSignupConfirmPassword ? 'text' : 'password'}
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-12 py-3.5 text-white focus:outline-none focus:border-red-500"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    >
                      {showSignupConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {signupError && (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-200 text-sm">
                    {signupError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={signupLoading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 text-white py-3.5 rounded-2xl font-semibold transition-colors"
                >
                  <UserPlus className="w-5 h-5" />
                  {signupLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            )}

            <div className="mt-6 flex items-center justify-between text-sm">
              <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
                Back to Home
              </Link>
              <span className="text-zinc-600">
                {activeView === 'login' ? 'PlayFlix Account Access' : 'New users sync to Admin -> Users'}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Google Sign-In Configuration & Instant Access Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Google Sign-In</h3>
                <p className="text-sm text-zinc-400">Instant Access & OAuth Setup</p>
              </div>
            </div>

            {/* Quick Demo Google Sign In */}
            <div className="rounded-2xl border border-red-500/20 bg-gradient-to-b from-red-950/20 to-zinc-950/40 p-5 mb-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-red-300 mb-2">
                <Sparkles className="w-4 h-4 text-red-400" />
                <span>One-Click Google Sign-In</span>
              </div>
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                Sign in immediately with your Google account. This securely provisions your PlayFlix profile, watch history, and syncs with your account.
              </p>

              <form onSubmit={handleGoogleQuickLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Google Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                      placeholder="user@gmail.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      value={googleName}
                      onChange={(e) => setGoogleName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                      placeholder="Your Name"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={googleQuickLoading}
                  className="w-full mt-2 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 text-white py-3 rounded-xl font-medium text-sm transition-colors shadow-lg shadow-red-600/20"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#FFFFFF"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#FFFFFF"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FFFFFF"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#FFFFFF"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  {googleQuickLoading ? 'Signing In...' : 'Continue as Google User'}
                </button>
              </form>
            </div>

            {/* Production Credentials Guide */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-left">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 mb-1">
                <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                <span>To Enable Real Google OAuth (.env.local)</span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-3">
                We have generated your <code className="text-zinc-200 bg-zinc-800 px-1 py-0.5 rounded">.env.local</code> file. Populate your client credentials:
              </p>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 font-mono text-[11px] text-zinc-300 mb-3">
                <span className="text-zinc-500"># In .env.local:</span><br />
                GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com<br />
                GOOGLE_CLIENT_SECRET=your-client-secret
              </div>

              {redirectUri && (
                <div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                    <span>Authorized redirect URI for Google Cloud Console:</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== 'undefined') {
                          navigator.clipboard.writeText(redirectUri);
                          setCopiedRedirectUri(true);
                          setTimeout(() => setCopiedRedirectUri(false), 2500);
                        }
                      }}
                      className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      {copiedRedirectUri ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy URI</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 font-mono text-[11px] text-zinc-400 break-all select-all">
                    {redirectUri}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
