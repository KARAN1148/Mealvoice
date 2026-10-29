import React, { useState, useEffect } from 'react';
import { Play, PhoneCall, Sparkles, User, RefreshCw, X, ChevronUp, ChevronDown, Loader2, Shield, Wrench, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDemoMode } from '../../context/DemoModeContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useNavigate } from 'react-router-dom';

export const DemoToolbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [switchingRole, setSwitchingRole] = useState<string | null>(null);
  const { user, switchRoleDemo } = useAuth();
  const { triggerIncomingCall, showNotification } = useDemoMode();
  const { isEasyMode, toggleEasyMode } = useAccessibility();
  const navigate = useNavigate();

  // Keyboard shortcut Ctrl+Shift+D to toggle panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        setIsHidden((h) => !h);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRoleSwitch = async (email: string, roleName: string, redirectPath: string) => {
    setSwitchingRole(roleName);
    try {
      await switchRoleDemo(email);
      showNotification(`Switched role session to ${roleName}`);
      setIsOpen(false);
      navigate(redirectPath);
    } catch (e: any) {
      console.error('Role switch failed', e);
      alert(`Role switch failed: ${e.message || 'Server unavailable'}`);
    } finally {
      setSwitchingRole(null);
    }
  };

  if (isHidden) {
    return (
      <button
        onClick={() => setIsHidden(false)}
        className="fixed bottom-3 right-3 z-[9999] w-8 h-8 rounded-full bg-slate-900/40 hover:bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center text-[10px] font-mono transition-all backdrop-blur shadow"
        title="Show Staff Console (Ctrl+Shift+D)"
      >
        <Wrench className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] pointer-events-auto">
      {isOpen ? (
        <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-2xl border-2 border-slate-700 w-80 sm:w-96 animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-black text-xs tracking-wider text-slate-200 uppercase">
                Staff Operations & Testing Console
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsHidden(true)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Hide Console (Press Ctrl+Shift+D to restore)"
              >
                <EyeOff className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-3 font-medium">
            Seamlessly inspect and operate all 5 stakeholder portals across the MealVoice ecosystem:
          </p>

          {/* Quick Role Switcher */}
          <div className="space-y-2 mb-4">
            <label className="text-[11px] font-bold text-slate-400 uppercase block tracking-wider">
              Switch Active Role:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                disabled={switchingRole !== null}
                onClick={() => handleRoleSwitch('customer@mealvoice.demo', 'Customer', '/')}
                className={`p-2.5 rounded-xl border text-left font-extrabold transition-all flex items-center justify-between ${
                  user?.role === 'CUSTOMER'
                    ? 'bg-brand-600 border-brand-500 text-white shadow-lg'
                    : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600'
                }`}
              >
                <span>👤 Customer</span>
                {switchingRole === 'Customer' && <Loader2 className="w-4 h-4 animate-spin text-amber-400" />}
              </button>

              <button
                type="button"
                disabled={switchingRole !== null}
                onClick={() => handleRoleSwitch('agent@mealvoice.demo', 'Call Agent', '/agent')}
                className={`p-2.5 rounded-xl border text-left font-extrabold transition-all flex items-center justify-between ${
                  user?.role === 'CALL_AGENT'
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                    : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600'
                }`}
              >
                <span>📞 Call Agent</span>
                {switchingRole === 'Call Agent' && <Loader2 className="w-4 h-4 animate-spin text-amber-400" />}
              </button>

              <button
                type="button"
                disabled={switchingRole !== null}
                onClick={() => handleRoleSwitch('restaurant@mealvoice.demo', 'Kitchen Admin', '/restaurant')}
                className={`p-2.5 rounded-xl border text-left font-extrabold transition-all flex items-center justify-between ${
                  user?.role === 'RESTAURANT_ADMIN'
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg'
                    : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600'
                }`}
              >
                <span>🍳 Kitchen Admin</span>
                {switchingRole === 'Kitchen Admin' && <Loader2 className="w-4 h-4 animate-spin text-amber-400" />}
              </button>

              <button
                type="button"
                disabled={switchingRole !== null}
                onClick={() => handleRoleSwitch('rider@mealvoice.demo', 'Delivery Partner', '/rider')}
                className={`p-2.5 rounded-xl border text-left font-extrabold transition-all flex items-center justify-between ${
                  user?.role === 'RIDER'
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg'
                    : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600'
                }`}
              >
                <span>🛵 Delivery Partner</span>
                {switchingRole === 'Delivery Partner' && <Loader2 className="w-4 h-4 animate-spin text-amber-400" />}
              </button>

              <button
                type="button"
                disabled={switchingRole !== null}
                onClick={() => handleRoleSwitch('admin@mealvoice.demo', 'Ops Admin', '/admin')}
                className={`p-2.5 rounded-xl border text-left font-extrabold transition-all col-span-2 flex items-center justify-between ${
                  user?.role === 'OPERATIONS_ADMIN'
                    ? 'bg-amber-600 border-amber-500 text-white shadow-lg'
                    : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600'
                }`}
              >
                <span>📊 Operations & Fleet Command</span>
                {switchingRole === 'Ops Admin' && <Loader2 className="w-4 h-4 animate-spin text-amber-400" />}
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              type="button"
              onClick={async () => {
                await handleRoleSwitch('agent@mealvoice.demo', 'Call Agent', '/agent');
                setTimeout(() => triggerIncomingCall(), 400);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Simulate Inbound Customer Call</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/easy-order');
                }}
                className="flex-1 py-2 px-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 flex items-center justify-center gap-1 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Easy Voice Mode</span>
              </button>

              <button
                type="button"
                onClick={toggleEasyMode}
                className="py-2 px-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 hover:text-white transition-colors"
              >
                {isEasyMode ? 'Standard UI' : 'High Contrast UI'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-slate-900/90 backdrop-blur text-white px-4 py-2.5 rounded-full font-bold text-xs shadow-2xl border border-slate-700 flex items-center gap-2 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Staff Console</span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        </button>
      )}
    </div>
  );
};

export default DemoToolbar;
