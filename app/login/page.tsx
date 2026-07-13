'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Shield, UserPlus, User } from 'lucide-react';
import { isUserAuthenticated, registerUser, resetUserPasswordByEmail, setUserAuthenticated, verifyUserCredentials } from '@/lib/data';

export default function UserLoginPage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loginNotice, setLoginNotice] = useState('');
  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [forgotData, setForgotData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  useEffect(() => {
    if (isUserAuthenticated()) {
      router.replace('/account');
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoginNotice('');

    if (!verifyUserCredentials(email, password)) {
      setError('Invalid email or password.');
      return;
    }

    setUserAuthenticated(true, email);
    router.push('/account');
  };

  const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignupError('');

    if (!signupData.fullName.trim() || !signupData.email.trim() || !signupData.password) {
      setSignupError('Please complete all account fields.');
      return;
    }

    if (signupData.password.length < 6) {
      setSignupError('Password must be at least 6 characters.');
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setSignupError('Passwords do not match.');
      return;
    }

    const result = registerUser({
      fullName: signupData.fullName,
      email: signupData.email,
      password: signupData.password
    });

    if (!result.success || !result.user) {
      setSignupError(result.message || 'Unable to create account.');
      return;
    }

    setUserAuthenticated(true, result.user.email);
    router.push('/account');
  };

  const handleForgotPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotData.email.trim() || !forgotData.newPassword || !forgotData.confirmPassword) {
      setForgotError('Please complete all reset fields.');
      return;
    }

    if (forgotData.newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters.');
      return;
    }

    if (forgotData.newPassword !== forgotData.confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    const result = resetUserPasswordByEmail({
      email: forgotData.email,
      newPassword: forgotData.newPassword
    });

    if (!result.success) {
      setForgotError(result.message);
      return;
    }

    setForgotSuccess(result.message);
    setEmail(forgotData.email.trim().toLowerCase());
    setPassword('');
    setForgotData({ email: '', newPassword: '', confirmPassword: '' });
    setLoginNotice('Password updated successfully. Please sign in with your new password.');
    setActiveView('login');
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
                    setActiveView('forgot');
                    setError('');
                    setSignupError('');
                    setLoginNotice('');
                    setForgotError('');
                    setForgotSuccess('');
                    setForgotData((current) => ({ ...current, email }));
                  }}
                  className={
                    'px-4 py-2 rounded-xl text-sm font-medium transition-colors ' +
                    (activeView === 'forgot' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white')
                  }
                >
                  Forgot Password
                </button>
              </div>
              <h2 className="text-2xl font-semibold">
                {activeView === 'login' ? 'Sign In' : activeView === 'signup' ? 'Create Account' : 'Reset Password'}
              </h2>
              <p className="text-zinc-500 mt-2">
                {activeView === 'login'
                  ? 'Use your saved PlayFlix account credentials.'
                  : activeView === 'signup'
                    ? 'Create a new user account that also appears in the admin panel.'
                    : 'Reset your local PlayFlix password using your account email.'}
              </p>
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

                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-2xl font-semibold transition-colors"
                >
                  Login
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
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-2xl font-semibold transition-colors"
                >
                  Update Password
                </button>
              </form>
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
                  className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-2xl font-semibold transition-colors"
                >
                  <UserPlus className="w-5 h-5" />
                  Create Account
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
    </main>
  );
}
