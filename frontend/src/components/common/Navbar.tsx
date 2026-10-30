import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag, PhoneCall, Sparkles, User as UserIcon, LogOut,
  Menu, X, ChevronDown, LayoutDashboard, Bike, Store, HeadphonesIcon,
  BarChart3, HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import AccessibilityToggle from './AccessibilityToggle';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { isEasyMode } = useAccessibility();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dashOpen, setDashOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const dashRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dashRef.current && !dashRef.current.contains(e.target as Node)) setDashOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const dashLinks = [
    { to: '/agent', icon: '📞', label: 'Call Agent', color: 'blue' },
    { to: '/restaurant', icon: '🍳', label: 'Kitchen Admin', color: 'emerald' },
    { to: '/rider', icon: '🛵', label: 'Rider App', color: 'purple' },
    { to: '/admin', icon: '📊', label: 'Operations Admin', color: 'slate' }
  ];

  const roleLink: Record<string, { to: string; label: string; cls: string }> = {
    CALL_AGENT: { to: '/agent', label: '📞 My Dashboard', cls: 'bg-blue-600 hover:bg-blue-700' },
    RESTAURANT_ADMIN: { to: '/restaurant', label: '🍳 Kitchen Panel', cls: 'bg-emerald-600 hover:bg-emerald-700' },
    RIDER: { to: '/rider', label: '🛵 Rider Panel', cls: 'bg-purple-600 hover:bg-purple-700' },
    OPERATIONS_ADMIN: { to: '/admin', label: '📊 Ops Admin', cls: 'bg-slate-900 hover:bg-slate-800' },
    SUPER_ADMIN: { to: '/admin', label: '🔐 Super Admin', cls: 'bg-rose-700 hover:bg-rose-800' }
  };

  const myDash = user ? roleLink[user.role] : null;
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* ── Brand ─────────────────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform">
              MV
            </div>
            <div>
              <div className="font-extrabold text-xl tracking-tight text-gray-900">
                MEAL<span className="text-brand-600">VOICE</span>
              </div>
              <p className="text-[10px] font-medium text-gray-500 hidden sm:block">
                Food delivery for everyone
              </p>
            </div>
          </Link>

          {/* ── Desktop Nav ───────────────────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-4">
            <Link
              to="/restaurants"
              className={`text-sm font-semibold transition-colors px-3 py-1.5 rounded-xl ${isActive('/restaurants') ? 'text-brand-600 bg-brand-50' : 'text-gray-700 hover:text-brand-600 hover:bg-gray-50'}`}
            >
              Restaurants
            </Link>

            {/* Dashboards dropdown */}
            <div ref={dashRef} className="relative">
              <button
                onClick={() => setDashOpen(v => !v)}
                className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-brand-600 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboards</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dashOpen ? 'rotate-180' : ''}`} />
              </button>

              {dashOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 z-50">
                  {dashLinks.map(d => (
                    <Link
                      key={d.to}
                      to={d.to}
                      onClick={() => setDashOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors hover:bg-${d.color}-50 text-${d.color}-900`}
                    >
                      <span className="text-base">{d.icon}</span>
                      <span>{d.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Easy Order */}
            <Link
              to="/easy-order"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border-2 border-amber-300 font-bold hover:bg-amber-100 transition-all text-xs shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Easy Order
            </Link>

            {/* Call CTA */}
            <a
              href="tel:18004726326"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-800 border border-green-200 font-bold hover:bg-green-100 transition-all text-xs"
            >
              <PhoneCall className="w-3.5 h-3.5 text-green-600 animate-pulse" />
              1800-MEAL
            </a>
          </nav>

          {/* ── Right Actions ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-2 sm:gap-3">
            <AccessibilityToggle />

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label={`Cart — ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
            >
              <ShoppingBag className="w-6 h-6 text-gray-700" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* User section */}
            {user ? (
              <div ref={userRef} className="relative">
                <button
                  onClick={() => setUserOpen(v => !v)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                  aria-label="Account menu"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-amber-400 flex items-center justify-center text-white font-extrabold text-xs shadow">
                    {initials}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-bold text-gray-900 leading-tight">{user.name.split(' ')[0]}</div>
                    <div className="text-[10px] text-gray-500 font-semibold">{user.role.replace(/_/g, ' ')}</div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${userOpen ? 'rotate-180' : ''}`} />
                </button>

                {userOpen && (
                  <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 z-50">
                    <div className="px-3 py-2 border-b border-gray-100 mb-1">
                      <div className="text-sm font-extrabold text-gray-900">{user.name}</div>
                      <div className="text-[11px] text-gray-500">{user.email || ''}</div>
                    </div>

                    {user.role === 'CUSTOMER' && (
                      <Link
                        to="/profile"
                        onClick={() => setUserOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        My Orders & Profile
                      </Link>
                    )}

                    {myDash && (
                      <Link
                        to={myDash.to}
                        onClick={() => setUserOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-white mt-1 ${myDash.cls} transition-colors`}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        {myDash.label}
                      </Link>
                    )}

                    <Link
                      to="/support"
                      onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors mt-1"
                    >
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                      Help & Support
                    </Link>

                    <button
                      onClick={() => { logout(); setUserOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-colors shadow-md flex items-center gap-1.5 text-sm"
              >
                <UserIcon className="w-4 h-4" />
                Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ────────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pb-5 pt-3 space-y-1 shadow-xl animate-in slide-in-from-top-2">
          <Link to="/restaurants" className="flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm text-gray-800 hover:bg-gray-50">
            🍽️ Restaurants
          </Link>
          <Link to="/easy-order" className="flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm text-amber-900 bg-amber-50 border border-amber-200">
            <Sparkles className="w-4 h-4 text-amber-500" /> Easy Order Mode
          </Link>
          <a href="tel:18004726326" className="flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm text-green-800 hover:bg-green-50">
            <PhoneCall className="w-4 h-4 text-green-600 animate-pulse" /> Call 1800-MEALVOICE
          </a>
          <Link to="/support" className="flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm text-gray-800 hover:bg-gray-50">
            <HelpCircle className="w-4 h-4 text-gray-400" /> Support
          </Link>

          <div className="border-t border-gray-100 pt-2 mt-2 space-y-1">
            <p className="text-[10px] font-extrabold text-gray-400 uppercase px-3 pb-1">Staff Dashboards</p>
            {dashLinks.map(d => (
              <Link key={d.to} to={d.to} className="flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-xs text-gray-700 hover:bg-gray-50">
                <span>{d.icon}</span> {d.label}
              </Link>
            ))}
          </div>

          {user && (
            <div className="border-t border-gray-100 pt-2 mt-2">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" /> Sign Out ({user.name})
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
