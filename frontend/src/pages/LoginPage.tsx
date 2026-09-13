import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, PhoneCall, Sparkles, Shield, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('customer@mealvoice.demo');
  const [password, setPassword] = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      // Route based on role
      if (user.role === 'CALL_AGENT') navigate('/agent');
      else if (user.role === 'RESTAURANT_ADMIN') navigate('/restaurant');
      else if (user.role === 'RIDER') navigate('/rider');
      else if (user.role === 'OPERATIONS_ADMIN' || user.role === 'SUPER_ADMIN') navigate('/admin');
      else navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please check email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { label: 'Customer', email: 'customer@mealvoice.demo', icon: '👤', color: 'text-brand-700 bg-brand-50 border-brand-200 hover:bg-brand-100' },
    { label: 'Call Agent', email: 'agent@mealvoice.demo', icon: '📞', color: 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100' },
    { label: 'Restaurant Admin', email: 'restaurant@mealvoice.demo', icon: '🍳', color: 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' },
    { label: 'Rider', email: 'rider@mealvoice.demo', icon: '🛵', color: 'text-purple-700 bg-purple-50 border-purple-200 hover:bg-purple-100' },
    { label: 'Ops Admin', email: 'admin@mealvoice.demo', icon: '📊', color: 'text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-navy-900 to-slate-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white font-black text-3xl flex items-center justify-center mx-auto shadow-2xl mb-4">
            MV
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            MEAL<span className="text-brand-500">VOICE</span> Food
          </h1>
          <p className="text-slate-400 font-medium text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-400/30 text-red-300 text-sm font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-extrabold text-slate-300 uppercase mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-500 font-semibold focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-300 uppercase mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-500 font-semibold focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-base shadow-xl flex items-center justify-center gap-2 transition-all"
            >
              <LogIn className="w-5 h-5" />
              <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>
        </div>

        {/* Demo Credentials */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-extrabold uppercase text-amber-400 tracking-wider">Demo Login Shortcuts (Password: demo1234)</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => { setEmail(acc.email); setPassword('demo1234'); }}
                className={`w-full px-4 py-2.5 rounded-xl border font-extrabold text-xs flex items-center justify-between transition-all ${acc.color}`}
              >
                <span className="flex items-center gap-2">
                  <span>{acc.icon}</span>
                  <span>{acc.label}</span>
                </span>
                <span className="text-[10px] opacity-70 font-mono">{acc.email}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Easy Order / Call Option */}
        <div className="flex items-center justify-center gap-4">
          <Link to="/easy-order" className="text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center gap-1">
            <Sparkles className="w-4 h-4" /> Easy Order (No Login Needed)
          </Link>
          <span className="text-slate-600">|</span>
          <a href="tel:1800-472-6326" className="text-emerald-400 hover:text-emerald-300 font-bold text-xs flex items-center gap-1">
            <PhoneCall className="w-4 h-4" /> Call to Order
          </a>
        </div>

        <div className="text-center">
          <Link to="/" className="text-slate-500 hover:text-slate-300 text-xs font-semibold">← Back to Homepage</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
