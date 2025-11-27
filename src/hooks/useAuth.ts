// src/hooks/useAuth.ts
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '@/types';
import { authAPI } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const response = await authAPI.getMe();
        setUser(response.data.user);
      }
    } catch (error) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    const { token, user, redirect } = response.data;
    
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);

    // Redirect based on role and approval status
    if (redirect) {
      window.location.href = redirect.path;
    }
  };

  const signup = async (data: any) => {
    const response = await authAPI.signup(data);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    authAPI.logout().catch(console.error);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { clearAuthData, setAuthData } from '@/lib/auth';
import { apiRequest } from '@/lib/api';
import { User, UserRole } from '@/types';

/**
 * خطاف (Hook) مخصص لإدارة حالة المصادقة والتحقق من الصلاحيات.
 */
export function useAuth() {
  const { token, user, isAuthenticated, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // تحميل الحالة من التخزين المحلي عند التهيئة
  useEffect(() => {
    const storedToken = localStorage.getItem('ehgzly_token');
    const storedUser = localStorage.getItem('ehgzly_user');

    if (storedToken && storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setAuthData(storedToken, parsedUser);
        
        // التحقق من صلاحية التوكن عبر API (اختياري لكن موصى به)
        checkTokenValidity(storedToken);

      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        clearAuthData();
      }
    } else {
        setIsLoading(false);
    }
  }, []);

  // دالة للتحقق من التوكن
  const checkTokenValidity = async (t: string) => {
    try {
        const userData: User = await apiRequest('/me');
        if (userData) {
            setUser(userData);
        } else {
            clearAuthData();
        }
    } catch (e) {
        console.error("Token validation failed", e);
        clearAuthData();
    } finally {
        setIsLoading(false);
    }
  };

  /**
   * للتحقق من دور المستخدم.
   * @param roles الأدوار المطلوبة.
   */
  const checkRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return {
    isAuthenticated,
    user,
    role: user?.role,
    isLoading,
    checkRole,
    logout: clearAuthData,
    login: setAuthData,
  };
}
