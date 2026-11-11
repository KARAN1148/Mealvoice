import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, formatSupabaseUser, getSupabaseConfig } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { switchRoleDemo } = useAuth();
  const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'ERROR'>('LOADING');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function handleAuthRedirect() {
      try {
        const { isConfigured } = getSupabaseConfig();
        if (!isConfigured) {
          throw new Error('Supabase client is not fully configured.');
        }

        // Wait for Supabase to parse the URL hash and store the session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (session && session.user) {
          if (!isMounted) return;
          setStatus('SUCCESS');
          
          // Store token for API requests
          localStorage.setItem('gc_auth_token', session.access_token);

          // Brief delay for visual confirmation before redirecting
          setTimeout(() => {
            if (isMounted) {
              navigate('/');
            }
          }, 1200);
          return;
        }

        // Fallback: Check if hash contains error
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const hashError = hashParams.get('error_description') || hashParams.get('error');
        if (hashError) {
          throw new Error(decodeURIComponent(hashError));
        }

        // Wait a tick in case session is being restored asynchronously
        const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
          if (newSession?.user && isMounted) {
            setStatus('SUCCESS');
            localStorage.setItem('gc_auth_token', newSession.access_token);
            setTimeout(() => navigate('/'), 1200);
          }
        });

        // Set a timeout to prevent infinite hang if user cancelled
        setTimeout(() => {
          if (isMounted && status === 'LOADING') {
            setStatus('SUCCESS');
            navigate('/');
          }
        }, 3000);

        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (err: any) {
        if (!isMounted) return;
        setStatus('ERROR');
        setErrorMessage(err.message || 'OAuth authentication failed. Please try again.');
      }
    }

    handleAuthRedirect();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative z-10">
        {status === 'LOADING' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-xl font-black text-white">Verifying OAuth Authentication...</h2>
            <p className="text-xs text-slate-400">
              Connecting with Supabase and establishing your secure session.
            </p>
          </div>
        )}

        {status === 'SUCCESS' && (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-white">Authentication Successful!</h2>
            <p className="text-xs text-slate-400">
              Welcome to MealVoice. Redirecting you to the platform...
            </p>
          </div>
        )}

        {status === 'ERROR' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-white">OAuth Verification Failed</h2>
            <p className="text-xs text-red-300 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
              {errorMessage}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <span>Back to Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
