import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, Shield, LogIn, UserPlus, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

  // UI state
  const [showDemoLogins, setShowDemoLogins] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

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

        {/* Auth Box */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
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
    </div>
  );
};

export default LoginPage;
