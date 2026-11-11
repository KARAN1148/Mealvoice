import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  LogIn,
  UserPlus,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Database,
  ExternalLink,
  Settings,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSupabaseConfig } from '../lib/supabase';

export const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Sign In fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'CUSTOMER' | 'RESTAURANT_ADMIN' | 'RIDER'>('CUSTOMER');

  // Supabase Config Modal state
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(getSupabaseConfig().url || '');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(getSupabaseConfig().anonKey || '');
  const [configSuccess, setConfigSuccess] = useState('');

  // UI state
  const [showDemoLogins, setShowDemoLogins] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    login,
    register,
    loginWithOAuth,
    isSupabaseConfigured,
    saveSupabaseKeys,
    clearSupabaseKeys
  } = useAuth();
  const navigate = useNavigate();

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setError('');
    if (!isSupabaseConfigured) {
      setShowConfigModal(true);
      setError('Please connect your Supabase project keys to enable Google & GitHub OAuth.');
      return;
    }

    setOauthLoading(provider);
    try {
      await loginWithOAuth(provider);
    } catch (err: any) {
      setError(err.message || `Failed to initiate ${provider} OAuth.`);
      setOauthLoading(null);
    }
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrlInput.trim() || !supabaseKeyInput.trim()) {
      setError('Both Supabase URL and Anon Key are required.');
      return;
    }

    saveSupabaseKeys(supabaseUrlInput.trim(), supabaseKeyInput.trim());
    setConfigSuccess('Supabase keys saved successfully!');
    setError('');
    setTimeout(() => {
      setConfigSuccess('');
      setShowConfigModal(false);
    }, 1200);
  };

  const handleClearConfig = () => {
    clearSupabaseKeys();
    setSupabaseUrlInput('');
    setSupabaseKeyInput('');
    setConfigSuccess('Supabase configuration cleared.');
    setTimeout(() => setConfigSuccess(''), 1500);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const user = await login(loginEmail, loginPassword);
      routeByUserRole(user.role);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const user = await register({
        name,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        role: regRole
      });
      setSuccessMsg('Account created successfully! Redirecting...');
      setTimeout(() => {
        routeByUserRole(user.role);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
      setIsLoading(false);
    }
  };

  const handleQuickDemoFill = async (email: string) => {
    setIsLoading(true);
    setError('');
    try {
      const user = await login(email, 'demo1234');
      routeByUserRole(user.role);
    } catch (err: any) {
      setError(err.message || 'Could not sign in with demo credentials.');
      setIsLoading(false);
    }
  };

  const routeByUserRole = (role: string) => {
    if (role === 'CALL_AGENT') navigate('/agent');
    else if (role === 'RESTAURANT_ADMIN') navigate('/restaurant');
    else if (role === 'RIDER') navigate('/rider');
    else if (role === 'OPERATIONS_ADMIN' || role === 'SUPER_ADMIN') navigate('/admin');
    else navigate('/');
  };

  const demoAccounts = [
    { label: 'Customer', email: 'customer@mealvoice.demo', role: 'Online & Voice Ordering', icon: '👤', color: 'bg-brand-50 border-brand-200 text-brand-900 hover:bg-brand-100' },
    { label: 'Call Agent', email: 'agent@mealvoice.demo', role: 'Inbound Phone Ordering & Softphone', icon: '📞', color: 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100' },
    { label: 'Kitchen Admin', email: 'restaurant@mealvoice.demo', role: 'Restaurant KDS & Menu Controls', icon: '🍳', color: 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100' },
    { label: 'Delivery Rider', email: 'rider@mealvoice.demo', role: 'Dispatch, GPS Map & Delivery Run', icon: '🛵', color: 'bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100' },
    { label: 'Operations Admin', email: 'admin@mealvoice.demo', role: 'Fleet & Analytics Command Center', icon: '📊', color: 'bg-slate-100 border-slate-300 text-slate-900 hover:bg-slate-200' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-3 mb-2 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white font-black text-2xl flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform">
              MV
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black text-white tracking-tight">
                MEAL<span className="text-brand-500">VOICE</span>
              </h1>
              <p className="text-xs font-semibold text-slate-400">Accessible Food Delivery Platform</p>
            </div>
          </Link>
        </div>

        {/* Supabase Status Pill */}
        <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="font-semibold text-slate-300">
              {isSupabaseConfigured ? 'Supabase Connected' : 'Supabase (Setup Ready)'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1 text-brand-400 hover:text-brand-300 font-bold transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Config</span>
          </button>
        </div>

        {/* Auth Box */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          
          {/* OAuth Buttons Section */}
          <div className="space-y-3 mb-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
              Sign In with Single Sign-On (OAuth)
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                disabled={Boolean(oauthLoading)}
                className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 active:scale-[0.98] text-white font-bold text-xs transition-all shadow-md group disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>{oauthLoading === 'google' ? 'Connecting...' : 'Google'}</span>
              </button>

              {/* GitHub OAuth Button */}
              <button
                type="button"
                onClick={() => handleOAuthLogin('github')}
                disabled={Boolean(oauthLoading)}
                className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 active:scale-[0.98] text-white font-bold text-xs transition-all shadow-md group disabled:opacity-50"
              >
                <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>{oauthLoading === 'github' ? 'Connecting...' : 'GitHub'}</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-slate-800" />
            <span className="flex-shrink mx-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Or with credentials
            </span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-950/60 p-1 rounded-2xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab('LOGIN'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === 'LOGIN'
                  ? 'bg-brand-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('REGISTER'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === 'REGISTER'
                  ? 'bg-brand-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-medium mb-4 animate-in fade-in">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-4 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {activeTab === 'LOGIN' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 font-medium text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-extrabold text-slate-300 uppercase">Password</label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to your registered email or phone.'); }} className="text-xs text-brand-400 hover:text-brand-300 font-semibold">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-11 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 font-medium text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 active:scale-[0.99] text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{isLoading ? 'Signing In...' : 'Sign In to MealVoice'}</span>
              </button>
            </form>
          ) : (
            /* CREATE ACCOUNT FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 font-medium text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="e.g. Ramesh Kumar"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 font-medium text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="ramesh@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 font-medium text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase mb-1.5">Account Role</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="CUSTOMER">Customer (Order Food & Track)</option>
                  <option value="RESTAURANT_ADMIN">Restaurant Partner (Kitchen KDS)</option>
                  <option value="RIDER">Delivery Partner (Rider App)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase mb-1.5">Create Password</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 font-medium text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="At least 6 characters"
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 active:scale-[0.99] text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isLoading ? 'Creating Account...' : 'Complete Registration'}</span>
              </button>
            </form>
          )}

          {/* Quick Staff & Evaluator Access Accordion */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowDemoLogins(!showDemoLogins)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors py-1"
            >
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Staff & Testing Quick-Access Accounts</span>
              </span>
              {showDemoLogins ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showDemoLogins && (
              <div className="mt-3 space-y-2 animate-in fade-in duration-200">
                <p className="text-[11px] text-slate-400">
                  Click any role to sign in instantly with pre-configured verified credentials:
                </p>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {demoAccounts.map((d) => (
                    <button
                      key={d.label}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleQuickDemoFill(d.email)}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between text-xs font-semibold ${d.color}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{d.icon}</span>
                        <div>
                          <div className="font-extrabold text-gray-900">{d.label}</div>
                          <div className="text-[10px] text-gray-600 font-medium">{d.role}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-black/10 text-gray-800">
                        Sign In →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400 font-medium">
          Protected by MealVoice 256-bit Secure TLS encryption.
          <br />
          <Link to="/" className="text-brand-400 hover:underline mt-1 inline-block">
            ← Return to Homepage
          </Link>
        </div>
      </div>

      {/* Supabase Connection & Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowConfigModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Connect Supabase to MealVoice</h3>
                <p className="text-xs text-slate-400">Database & OAuth Authentication Provider</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Enter your Supabase project credentials to activate Google/GitHub OAuth and direct database synchronization.
              You can get these from your{' '}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-brand-400 underline font-semibold inline-flex items-center gap-1"
              >
                Supabase Dashboard <ExternalLink className="w-3 h-3 inline" />
              </a>{' '}
              → <b>Project Settings → API</b>.
            </p>

            {configSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{configSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveSupabaseConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Project URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Anon / Public API Key
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p className="font-bold text-slate-300">💡 OAuth Setup Checklist:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>In Supabase: Go to <b>Authentication → Providers</b> and enable Google or GitHub.</li>
                  <li>In Google/GitHub Developer Console: Set Redirect URL to <code className="text-amber-300">{window.location.origin}/auth/callback</code> (or your Supabase Auth Callback URL).</li>
                  <li>Keys are stored securely in browser storage and can also be saved in <code className="text-amber-300">frontend/.env.local</code>.</li>
                </ul>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-all shadow-lg"
                >
                  Save & Connect Supabase
                </button>
                {isSupabaseConfigured && (
                  <button
                    type="button"
                    onClick={handleClearConfig}
                    className="px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs border border-red-500/20 transition-all"
                  >
                    Clear Keys
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
