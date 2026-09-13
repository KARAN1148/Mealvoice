import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, Heart, Shield, Sparkles, Accessibility } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Vision */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white font-extrabold text-xl">
                MV
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                MEAL<span className="text-brand-500">VOICE</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              An inclusive, independent food delivery network. Serving customers across all technology comforts — via smartphone app, simplified interface, or direct phone call.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold bg-amber-950/60 p-2.5 rounded-xl border border-amber-800/60">
              <Accessibility className="w-4 h-4 text-amber-400" />
              <span>Accessibility First Platform</span>
            </div>
          </div>

          {/* Quick Ordering Methods */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>How To Order</span>
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/restaurants" className="hover:text-white transition-colors">
                  Full Online Menu
                </Link>
              </li>
              <li>
                <Link to="/easy-order" className="text-amber-300 font-semibold hover:text-amber-200 transition-colors">
                  Easy Order Mode (Simplified)
                </Link>
              </li>
              <li>
                <a href="tel:1800-472-6326" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
                  Phone Order: 1800-MEAL
                </a>
              </li>
              <li>
                <Link to="/voice-order" className="hover:text-white transition-colors">
                  Voice Speech Ordering
                </Link>
              </li>
            </ul>
          </div>

          {/* Portal Portals */}
          <div>
            <h4 className="text-white font-bold text-base mb-4">Portals & Workflows</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/agent" className="hover:text-white transition-colors">
                  Call Agent Portal
                </Link>
              </li>
              <li>
                <Link to="/restaurant" className="hover:text-white transition-colors">
                  Restaurant Kitchen Admin
                </Link>
              </li>
              <li>
                <Link to="/rider" className="hover:text-white transition-colors">
                  Rider Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">
                  Operations Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-white font-bold text-base mb-4">Dedicated Support</h4>
            <p className="text-sm text-slate-400 mb-3">
              Need assistance placing an order or tracking a live delivery?
            </p>
            <a
              href="tel:1800-472-6326"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition-all shadow-lg mb-3"
            >
              <PhoneCall className="w-4 h-4 animate-pulse" />
              <span>Call 1800-MEALVOICE</span>
            </a>
            <p className="text-xs text-slate-500">Toll-free 24/7 Human Phone Support</p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 MealVoice Food Technologies. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <Link to="/support" className="hover:text-slate-400">
              Support Center
            </Link>
            <a href="#faq" className="hover:text-slate-400">
              FAQ
            </a>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-semibold">Independent Delivery Ecosystem</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
