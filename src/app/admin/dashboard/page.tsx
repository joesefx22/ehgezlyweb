// src/app/admin/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  totalStadiums: number;
  totalBookings: number;
  pendingManagers: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getSystemLogs()
      ]);
      
      setStats(statsResponse.data);
      setRecentActivity(activityResponse.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم الأدمن</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي المستخدمين</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalUsers}</p>
            </div>
            <div className="text-2xl text-blue-500">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي الملاعب</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalStadiums}</p>
            </div>
            <div className="text-2xl text-green-500">⚽</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي الحجوزات</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalBookings}</p>
            </div>
            <div className="text-2xl text-purple-500">📅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">طلبات الانتظار</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.pendingManagers}</p>
            </div>
            <div className="text-2xl text-yellow-500">⏳</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/users"
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
        >
          <div className="flex items-center">
            <div className="text-2xl text-blue-500 mr-4">👥</div>
            <div>
              <h3 className="font-semibold text-gray-900">إدارة المستخدمين</h3>
              <p className="text-sm text-gray-600 mt-1">عرض وإدارة جميع المستخدمين</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/stadiums"
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-green-500 hover:shadow-md transition-all"
        >
          <div className="flex items-center">
            <div className="text-2xl text-green-500 mr-4">⚽</div>
            <div>
              <h3 className="font-semibold text-gray-900">الملاعب</h3>
              <p className="text-sm text-gray-600 mt-1">عرض وإدارة جميع الملاعب</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/codes"
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all"
        >
          <div className="flex items-center">
            <div className="text-2xl text-purple-500 mr-4">🎫</div>
            <div>
              <h3 className="font-semibold text-gray-900">الأكواد</h3>
              <p className="text-sm text-gray-600 mt-1">توليد وإدارة أكواد الخصم</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">النشاط الأخير</h2>
        <div className="space-y-3">
          {recentActivity.slice(0, 5).map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-blue-500 text-lg mr-3">📝</span>
                <div>
                  <p className="font-medium text-sm">{activity.description}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    بواسطة: {activity.user_name || 'النظام'}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(activity.created_at).toLocaleDateString('ar-EG')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
