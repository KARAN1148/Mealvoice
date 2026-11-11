import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiRequest } from '../api/client';
import {
  supabase,
  getSupabaseConfig,
  signInWithOAuth as supabaseOAuth,
  signInWithSupabaseEmail,
  signUpWithSupabaseEmail,
  signOutSupabase,
  formatSupabaseUser,
  saveSupabaseCredentials,
  clearSupabaseCredentials
} from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { name: string; email: string; password: string; phone: string; role?: string }) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
  switchRoleDemo: (roleEmail: string) => Promise<User>;
  // Supabase specific additions
  loginWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  isSupabaseConfigured: boolean;
  saveSupabaseKeys: (url: string, anonKey: string) => void;
  clearSupabaseKeys: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('gc_auth_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(getSupabaseConfig().isConfigured);

  // Check auth status on mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const config = getSupabaseConfig();
      setIsSupabaseConfigured(config.isConfigured);

      // 1. Check Supabase Auth session first if configured
      if (config.isConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && isMounted) {
            const formattedUser = formatSupabaseUser(session.user);
            setUser(formattedUser);
            setToken(session.access_token);
            localStorage.setItem('gc_auth_token', session.access_token);
            setIsLoading(false);
            return;
          }
        } catch (sbErr) {
          console.warn('Supabase session restore check failed:', sbErr);
        }
      }

      // 2. Check Backend JWT Token session if present
      const storedToken = localStorage.getItem('gc_auth_token');
      if (storedToken) {
        try {
          const res = await apiRequest<{ user: User }>('/auth/me');
          if (isMounted) {
            setUser(res.user);
          }
        } catch (err) {
          console.warn('Backend session expired or unreachable:', err);
          if (isMounted) {
            localStorage.removeItem('gc_auth_token');
            setToken(null);
            setUser(null);
          }
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    initAuth();

    // 3. Listen for Supabase auth state changes (OAuth redirects, logins, logouts)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        const formattedUser = formatSupabaseUser(session.user);
        setUser(formattedUser);
        setToken(session.access_token);
        localStorage.setItem('gc_auth_token', session.access_token);
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setToken(null);
        localStorage.removeItem('gc_auth_token');
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const loginWithOAuth = async (provider: 'google' | 'github') => {
    await supabaseOAuth(provider);
  };

  const login = async (email: string, password: string): Promise<User> => {
    const normalizedEmail = email.toLowerCase().trim();
    const isDemoEmail = normalizedEmail.includes('@mealvoice.demo');
    const { isConfigured } = getSupabaseConfig();

    // If Supabase is configured and it is NOT a built-in demo account, try Supabase Auth first
    if (isConfigured && !isDemoEmail) {
      try {
        const sbRes = await signInWithSupabaseEmail(normalizedEmail, password);
        if (sbRes.user && sbRes.session) {
          const formattedUser = formatSupabaseUser(sbRes.user);
          localStorage.setItem('gc_auth_token', sbRes.session.access_token);
          setToken(sbRes.session.access_token);
          setUser(formattedUser);
          return formattedUser;
        }
      } catch (sbErr: any) {
        console.warn('Supabase email login failed, falling back to backend API:', sbErr.message);
      }
    }

    // Backend REST API login (standard for demo accounts & local backend)
    const res = await apiRequest<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: normalizedEmail, password })
    });

    localStorage.setItem('gc_auth_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (data: { name: string; email: string; password: string; phone: string; role?: string }): Promise<User> => {
    const { isConfigured } = getSupabaseConfig();

    // If Supabase is configured, create the user in Supabase Auth as well
    if (isConfigured) {
      try {
        const sbRes = await signUpWithSupabaseEmail(data.email, data.password, {
          name: data.name,
          phone: data.phone,
          role: data.role || 'CUSTOMER'
        });

        if (sbRes.user && sbRes.session) {
          const formattedUser = formatSupabaseUser(sbRes.user);
          localStorage.setItem('gc_auth_token', sbRes.session.access_token);
          setToken(sbRes.session.access_token);
          setUser(formattedUser);
          return formattedUser;
        }
      } catch (sbErr: any) {
        console.warn('Supabase registration failed, falling back to backend API:', sbErr.message);
      }
    }

    // Backend REST API registration
    const res = await apiRequest<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    localStorage.setItem('gc_auth_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    await signOutSupabase();
    localStorage.removeItem('gc_auth_token');
    setToken(null);
    setUser(null);
  };

  const switchRoleDemo = async (roleEmail: string) => {
    return await login(roleEmail, 'demo1234');
  };

  const saveSupabaseKeys = (url: string, anonKey: string) => {
    saveSupabaseCredentials(url, anonKey);
    setIsSupabaseConfigured(getSupabaseConfig().isConfigured);
  };

  const clearSupabaseKeys = () => {
    clearSupabaseCredentials();
    setIsSupabaseConfigured(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isLoading,
        switchRoleDemo,
        loginWithOAuth,
        isSupabaseConfigured,
        saveSupabaseKeys,
        clearSupabaseKeys
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
