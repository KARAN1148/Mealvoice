import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { apiRequest } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
  switchRoleDemo: (roleEmail: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('gc_auth_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await apiRequest<{ user: User }>('/auth/me');
        setUser(res.user);
      } catch (err) {
        console.error('Session expired', err);
        logout();
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await apiRequest<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('gc_auth_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('gc_auth_token');
    setToken(null);
    setUser(null);
  };

  const switchRoleDemo = async (roleEmail: string) => {
    return await login(roleEmail, 'demo1234');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, switchRoleDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
