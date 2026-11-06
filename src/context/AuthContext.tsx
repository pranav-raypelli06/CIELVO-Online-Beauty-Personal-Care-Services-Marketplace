'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface UserSession {
  id: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'SALON_OWNER' | 'SALON_STAFF' | 'ADMIN';
  name?: string;
  customerProfile?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    defaultCity?: string;
    defaultState?: string;
  };
  salon?: {
    id: string;
    businessName: string;
    slug: string;
    status: string;
    logoUrl?: string;
  };
  staff?: {
    id: string;
    fullName: string;
    roleTitle: string;
    locationId: string;
  };
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching auth session:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refreshUser,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
