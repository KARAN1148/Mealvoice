import React, { useState } from 'react';
import { Play, PhoneCall, Sparkles, User, RefreshCw, X, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDemoMode } from '../../context/DemoModeContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useNavigate } from 'react-router-dom';

export const DemoToolbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [switchingRole, setSwitchingRole] = useState<string | null>(null);
  const { user, switchRoleDemo } = useAuth();
  const { triggerIncomingCall, showNotification } = useDemoMode();
  const { isEasyMode, toggleEasyMode } = useAccessibility();
  const navigate = useNavigate();

  const handleRoleSwitch = async (email: string, roleName: string, redirectPath: string) => {
    setSwitchingRole(roleName);
    try {
      await switchRoleDemo(email);
      showNotification(`Switched role to ${roleName}`);
      setIsOpen(false);
      navigate(redirectPath);
    } catch (e: any) {
      console.error('Role switch failed', e);
      alert(`Role switch failed: ${e.message || 'Server unavailable'}`);
    } finally {
      setSwitchingRole(null);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] pointer-events-auto">
      {isOpen ? (
        <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-2xl border-2 border-amber-400/80 w-80 sm:w-96 animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
              <span className="font-extrabold text-sm tracking-wide text-amber-400 uppercase">
                Demo Developer Control Panel
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close Demo Controls"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-3 font-medium">
            Quickly test the entire MealVoice food ordering ecosystem across roles:
          </p>

          {/* Quick Role Switcher */}
          <div className="space-y-2 mb-4">
            <label className="text-xs font-bold text-slate-300 uppercase block">Switch Active Role:</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                disabled={switchingRole !== null}
                onClick={() => handleRoleSwitch('customer@mealvoice.demo', 'Customer', '/')}
                className={`p-2.5 rounded-xl border text-left font-extrabold transition-all flex items-center justify-between ${
                  user?.role === 'CUSTOMER'
                    ? 'bg-brand-600 border-brand-500 text-white shadow-lg'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600'
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
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600'
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
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600'
                }`}
              >
                <span>🍳 Kitchen Admin</span>
                {switchingRole === 'Kitchen Admin' && <Loader2 className="w-4 h-4 animate-spin text-amber-400" />}
              </button>

              <button
                type="button"
                disabled={switchingRole !== null}
                onClick={() => handleRoleSwitch('rider@mealvoice.demo', 'Delivery Rider', '/rider')}
                className={`p-2.5 rounded-xl border text-left font-extrabold transition-all flex items-center justify-between ${
                  user?.role === 'RIDER'
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600'
                }`}
              >
                <span>🛵 Delivery Rider</span>
                {switchingRole === 'Delivery Rider' && <Loader2 className="w-4 h-4 animate-spin text-amber-400" />}
              </button>

              <button
                type="button"
                disabled={switchingRole !== null}
                onClick={() => handleRoleSwitch('admin@mealvoice.demo', 'Ops Admin', '/admin')}
                className={`p-2.5 rounded-xl border text-left font-extrabold transition-all col-span-2 flex items-center justify-between ${
                  user?.role === 'OPERATIONS_ADMIN'
                    ? 'bg-amber-600 border-amber-500 text-white shadow-lg'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600'
                }`}
              >
                <span>📊 Ops & Accessibility Admin</span>
                {switchingRole === 'Ops Admin' && <Loader2 className="w-4 h-4 animate-spin text-amber-400" />}
              </button>
            </div>
          </div>

          {/* Quick Simulation Trigger Actions */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              type="button"
              onClick={async () => {
                await handleRoleSwitch('agent@mealvoice.demo', 'Call Agent', '/agent');
                setTimeout(() => triggerIncomingCall(), 400);
              }}
              className="w-full py-3 px-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span>Simulate Incoming Phone Call</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/easy-order');
                }}
                className="flex-1 py-2.5 px-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-extrabold hover:bg-amber-500/30 flex items-center justify-center gap-1 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Easy Order Mode</span>
              </button>

              <button
                type="button"
                onClick={toggleEasyMode}
                className="py-2.5 px-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-extrabold hover:bg-slate-700 hover:text-white transition-colors"
              >
                {isEasyMode ? 'Disable Easy UI' : 'Enable Easy UI'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 text-white px-5 py-3.5 rounded-full font-black text-xs shadow-2xl border-2 border-amber-400 flex items-center gap-2.5 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
          <span>Demo Controls</span>
          <ChevronUp className="w-4 h-4 text-amber-400" />
        </button>
      )}
    </div>
  );
};

export default DemoToolbar;
