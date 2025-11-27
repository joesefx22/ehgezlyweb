'use client';

import React, { useState } from 'react';
import Button from '../ui/Button';
import { apiRequest } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types';

const SignupForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('player');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      setIsLoading(false);
      return;
    }

    try {
      await apiRequest('/signup', 'POST', { name, email, password, role });
      
      setSuccess('تم إنشاء الحساب بنجاح. يمكنك الآن تسجيل الدخول.');
      router.push('/login?message=signup_success');

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-3xl font-bold text-center text-primary dark:text-secondary">إنشاء حساب</h2>
      
      {error && <p className="text-red-600 bg-red-100 p-3 rounded-lg text-center">{error}</p>}
      {success && <p className="text-green-600 bg-green-100 p-3 rounded-lg text-center">{success}</p>}

      {/* Name Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="name">
          الاسم الكامل
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      {/* Email Input */}
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

      {/* Role Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="role">
          نوع الحساب
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="player">لاعب/مستخدم عادي</option>
          <option value="owner">مالك ملعب (يحتاج موافقة)</option>
        </select>
      </div>

      {/* Password Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">
          كلمة المرور (6 أحرف على الأقل)
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

      {/* Confirm Password Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="confirmPassword">
          تأكيد كلمة المرور
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">
        إنشاء حساب
      </Button>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        هل لديك حساب بالفعل؟{' '}
        <button type="button" onClick={() => router.push('/login')} className="text-primary hover:underline font-semibold">
          تسجيل الدخول
        </button>
      </p>
    </form>
  );
};

export default SignupForm;
