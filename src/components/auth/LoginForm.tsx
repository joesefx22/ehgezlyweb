'use client';

import React, { useState } from 'react';
import Button from '../ui/Button';
import { apiRequest } from '@/lib/api';
import { setAuthData, getDashboardPath } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { User } from '@/types';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiRequest<{ token: string; user: User }>('/login', 'POST', { email, password });
      
      if (response && response.token && response.user) {
        setAuthData(response.token, response.user);
        router.push(getDashboardPath(response.user.role));
      } else {
        setError('بيانات غير صالحة.');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-3xl font-bold text-center text-primary dark:text-secondary">تسجيل الدخول</h2>
      
      {error && <p className="text-red-600 bg-red-100 p-3 rounded-lg text-center">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">
          البريد الإلكتروني
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">
          كلمة المرور
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">
        تسجيل الدخول
      </Button>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        ليس لديك حساب؟{' '}
        <button type="button" onClick={() => router.push('/signup')} className="text-primary hover:underline font-semibold">
          إنشاء حساب جديد
        </button>
      </p>
    </form>
  );
};

export default LoginForm;
