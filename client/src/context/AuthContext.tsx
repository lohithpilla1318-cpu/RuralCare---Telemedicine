import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../utils/fetchHelper';

export interface User {
  id: string;
  name: string;
  phone: string;
  language: string;
  subscription: 'none' | 'basic' | 'family' | 'village';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (name: string, phone: string) => Promise<boolean>;
  logout: () => void;
  updateSubscription: (sub: User['subscription']) => Promise<void>;
  updateLanguage: (lang: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem('rc_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser) as User;
          // Verify with server
          const res = await apiFetch(`/api/auth/me/${parsed.id}`);
          if (res.ok) {
            const serverUser = await res.json();
            setUser(serverUser);
            localStorage.setItem('rc_user', JSON.stringify(serverUser));
          } else {
            // If server rejects, clean up session
            localStorage.removeItem('rc_user');
            setUser(null);
          }
        } catch {
          localStorage.removeItem('rc_user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (name: string, phone: string): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('rc_user', JSON.stringify(data.user));
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rc_user');
  };

  const updateSubscription = async (subscription: User['subscription']) => {
    if (!user) return;
    try {
      const res = await apiFetch('/api/auth/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, subscription }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('rc_user', JSON.stringify(data.user));
        }
      }
    } catch (err) {
      console.error('Subscription update error:', err);
    }
  };

  const updateLanguage = async (language: string) => {
    if (!user) return;
    try {
      const res = await apiFetch('/api/auth/update-lang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, language }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('rc_user', JSON.stringify(data.user));
        }
      }
    } catch (err) {
      console.error('Language update error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateSubscription, updateLanguage }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
