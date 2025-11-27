'use client';

import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getDashboardPath } from '@/lib/auth';
import { UserRole } from '@/types';

interface DashboardLayoutProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user, role } = useAuth();
  const router = useRouter();

  // 1. حالة التحميل
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-dark-bg">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="rtl:mr-3 ltr:ml-3 text-lg font-medium dark:text-white">جاري التحميل...</span>
      </div>
    );
  }

  // 2. عدم المصادقة
  if (!isAuthenticated) {
    router.replace('/login');
    return null;
  }

  // 3. عدم الصلاحية
  if (role && !allowedRoles.includes(role)) {
    // توجيه إلى لوحة تحكم الدور الصحيح أو الصفحة الرئيسية
    router.replace(getDashboardPath(role));
    return null;
  }
  
  // 4. للمالك والمدير: التحقق من الموافقة
  if (role && (role === 'owner' || role === 'manager') && !user?.is_approved) {
    return (
      <div className="flex items-center justify-center h-screen bg-yellow-50 dark:bg-dark-bg p-4">
        <div className="text-center p-8 bg-white dark:bg-dark-card rounded-xl shadow-xl max-w-md">
          <AlertCircle className="h-12 w-12 text-accent mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-3 dark:text-white">حسابك قيد المراجعة</h1>
          <p className="text-gray-600 dark:text-gray-400">
            شكراً لتسجيلك كـ <span className="font-bold">{role === 'owner' ? 'مالك ملعب' : 'مدير'}.</span> يرجى الانتظار حتى يقوم الإداري بمراجعة وتفعيل حسابك. سيتم إخطارك عبر البريد الإلكتروني.
          </p>
          <button onClick={clearAuthData} className="mt-6 text-sm text-red-500 hover:text-red-700">تسجيل الخروج</button>
        </div>
      </div>
    );
  }

  // 5. عرض لوحة التحكم
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-bg">
      <Sidebar role={role} user={user} />
      <div className="flex-1 flex flex-col ltr:lg:ml-64 rtl:lg:mr-64">
        {/* يمكن إضافة شريط علوي هنا */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
