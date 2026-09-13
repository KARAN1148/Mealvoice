import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, PhoneCall, Sparkles, User as UserIcon, ShieldAlert, LogOut, HeartHandshake } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import AccessibilityToggle from './AccessibilityToggle';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { isEasyMode } = useAccessibility();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-md group-hover:scale-105 transition-transform">
              MV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-gray-900">
                  MEAL<span className="text-brand-600">VOICE</span>
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 border border-brand-200">
                  Food
                </span>
              </div>
              <p className="text-xs font-medium text-gray-500 hidden sm:block">
                Food delivery for everyone — App or Call.
              </p>
            </div>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-5">
            <Link
              to="/restaurants"
              className="text-gray-700 hover:text-brand-600 font-semibold transition-colors flex items-center gap-1.5 text-sm"
            >
              Restaurants
            </Link>

            {/* Dashboards Direct Navigation Menu */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-gray-700 hover:text-brand-600 font-semibold transition-colors text-sm py-2">
                <span>Dashboards</span>
                <span className="text-xs">▾</span>
              </button>
              <div className="absolute top-full left-0 hidden group-hover:block w-52 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <Link
                  to="/agent"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-blue-50 text-blue-900 text-xs font-bold transition-colors"
                >
                  <span>📞 Call Agent Dashboard</span>
                </Link>
                <Link
                  to="/restaurant"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-emerald-50 text-emerald-900 text-xs font-bold transition-colors"
                >
                  <span>🍳 Kitchen Admin</span>
                </Link>
                <Link
                  to="/rider"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-purple-50 text-purple-900 text-xs font-bold transition-colors"
                >
                  <span>🛵 Rider App</span>
                </Link>
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-900 text-xs font-bold transition-colors"
                >
                  <span>📊 Ops & Accessibility Admin</span>
                </Link>
              </div>
            </div>

            {/* Easy Order Mode Link */}
            <Link
              to="/easy-order"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 border-2 border-amber-300 font-bold hover:bg-amber-100 transition-all text-xs shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Easy Order</span>
            </Link>

            {/* Call to Order Direct Link */}
            <a
              href="tel:1800-472-6326"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-green-50 text-green-800 border border-green-200 font-bold hover:bg-green-100 transition-all text-xs"
            >
              <PhoneCall className="w-4 h-4 text-green-600 animate-pulse" />
              <span>Call: 1800-MEAL</span>
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <AccessibilityToggle />

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
              aria-label={`View Cart with ${itemCount} items`}
            >
              <ShoppingBag className="w-6 h-6 text-gray-800" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Account / Role Quick Navigation */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden lg:block text-right">
                  <div className="text-sm font-bold text-gray-900">{user.name}</div>
                  <div className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600 inline-block uppercase">
                    {user.role.replace('_', ' ')}
                  </div>
                </div>

                {/* Direct Dashboard Link Based On Role */}
                {user.role === 'CALL_AGENT' && (
                  <Link
                    to="/agent"
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs shadow hover:bg-blue-700"
                  >
                    📞 Agent Dashboard
                  </Link>
                )}

                {user.role === 'RESTAURANT_ADMIN' && (
                  <Link
                    to="/restaurant"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow hover:bg-emerald-700"
                  >
                    🍳 Kitchen Admin
                  </Link>
                )}

                {user.role === 'RIDER' && (
                  <Link
                    to="/rider"
                    className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs shadow hover:bg-purple-700"
                  >
                    🛵 Rider App
                  </Link>
                )}

                {user.role === 'OPERATIONS_ADMIN' && (
                  <Link
                    to="/admin"
                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs shadow hover:bg-slate-800"
                  >
                    📊 Ops Admin
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-colors shadow-md flex items-center gap-2 text-sm"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
