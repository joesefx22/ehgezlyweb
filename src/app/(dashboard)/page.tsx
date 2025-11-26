// src/app/(dashboard)/page.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  const getDashboardStats = () => {
    switch (user?.role) {
      case 'player':
        return [
          { name: 'الحجوزات النشطة', value: '3', color: 'blue', icon: '📅' },
          { name: 'الحجوزات السابقة', value: '12', color: 'green', icon: '✅' },
          { name: 'طلبات اللاعبين', value: '2', color: 'yellow', icon: '👥' },
        ];
      case 'owner':
        return [
          { name: 'الملاعب', value: '5', color: 'blue', icon: '⚽' },
          { name: 'الحجوزات اليوم', value: '8', color: 'green', icon: '📅' },
          { name: 'الإيرادات', value: '2,450', color: 'purple', icon: '💰' },
        ];
      case 'admin':
        return [
          { name: 'المستخدمين', value: '150', color: 'blue', icon: '👥' },
          { name: 'الملاعب', value: '25', color: 'green', icon: '⚽' },
          { name: 'الحجوزات', value: '320', color: 'purple', icon: '📅' },
        ];
      default:
        return [];
    }
  };

  const getQuickActions = () => {
    switch (user?.role) {
      case 'player':
        return [
          { name: 'حجز ملعب جديد', href: '/', icon: '➕', color: 'blue' },
          { name: 'عرض حجوزاتي', href: '/dashboard/bookings', icon: '📅', color: 'green' },
          { name: 'طلبات اللاعبين', href: '/dashboard/player-requests', icon: '👥', color: 'yellow' },
        ];
      case 'owner':
        return [
          { name: 'إضافة ملعب', href: '/owner/stadiums/new', icon: '➕', color: 'blue' },
          { name: 'إدارة الحجوزات', href: '/owner/bookings', icon: '📅', color: 'green' },
          { name: 'التقارير', href: '/owner/reports', icon: '📊', color: 'purple' },
        ];
      case 'admin':
        return [
          { name: 'إدارة المستخدمين', href: '/admin/users', icon: '👥', color: 'blue' },
          { name: 'الملاعب', href: '/admin/stadiums', icon: '⚽', color: 'green' },
          { name: 'توليد الأكواد', href: '/admin/codes', icon: '🎫', color: 'purple' },
        ];
      default:
        return [];
    }
  };

  const stats = getDashboardStats();
  const quickActions = getQuickActions();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          مرحباً بعودتك، {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          هذه نظرة عامة على نشاطك في النظام.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className="text-2xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <span className="text-2xl mr-3">{action.icon}</span>
              <span className="font-medium text-gray-900">{action.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">النشاط الأخير</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <span className="text-green-500 text-lg mr-3">✅</span>
              <div>
                <p className="font-medium">تم تأكيد حجزك</p>
                <p className="text-sm text-gray-600">ملعب النصر - 20:00</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">منذ ساعتين</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <span className="text-blue-500 text-lg mr-3">🎫</span>
              <div>
                <p className="font-medium">تم إنشاء كود تعويض</p>
                <p className="text-sm text-gray-600">قيمة: 50 ج.س</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">منذ يوم</span>
          </div>
        </div>
      </div>
    </div>
  );
}
