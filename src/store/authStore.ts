import { create } from 'zustand';
import { User } from '@/types';

// واجهة حالة المصادقة
interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  
  /** تحديث حالة المصادقة عند تسجيل الدخول أو التهيئة */
  setAuth: (data: { token: string; user: User }) => void;
  
  /** تحديث بيانات المستخدم (مثلاً بعد تعديل الملف الشخصي) */
  setUser: (user: User) => void;
  
  /** تسجيل الخروج ومسح الحالة */
  logout: () => void;
}

/**
 * مخزن Zustand لإدارة حالة المصادقة العالمية.
 */
export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  setAuth: ({ token, user }) => {
    set({
      token,
      user,
      isAuthenticated: !!token && !!user,
    });
  },

  setUser: (user) => {
    set({ user });
    // تحديث التخزين المحلي أيضاً
    if (typeof window !== 'undefined') {
        localStorage.setItem('ehgzly_user', JSON.stringify(user));
    }
  },

  logout: () => {
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
    // مسح التخزين المحلي
    if (typeof window !== 'undefined') {
        localStorage.removeItem('ehgzly_token');
        localStorage.removeItem('ehgzly_user');
    }
  },
}));
