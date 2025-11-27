'use client';

import DashboardLayout from '@/components/dashboard/Layout';
import Stats from '@/components/dashboard/Stats';
import Card from '@/components/ui/Card';
import { useApi } from '@/hooks/useApi';
import { DashboardStats, UserRole } from '@/types';
import { useEffect } from 'react';
import { Loader2, AlertCircle, BarChart3, Clock, SoccerBall } from 'lucide-react';

const MockStats: DashboardStats = {
  total_bookings: 45,
  total_revenue: 12500,
  new_users: 2,
  available_stadiums: 3,
  pending_managers: 0,
};

/**
 * لوحة تحكم مالك/مدير الملعب
 */
const OwnerDashboardPage: React.FC = () => {
  const { data: stats, isLoading, error, execute } = useApi<DashboardStats>(true);

  useEffect(() => {
    execute('/owner/dashboard/stats'); // جلب إحصائيات لوحة المالك
  }, [execute]);

  return (
    <DashboardLayout allowedRoles={['owner', 'manager']}>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold dark:text-white">لوحة تحكم الملعب</h1>
        
        {/* Statistics Section */}
        {isLoading && <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
        
        {error && (
            <Card className="bg-red-50 border-red-200 text-red-600 p-4 flex items-center">
              <AlertCircle className="h-5 w-5 rtl:ml-2 ltr:mr-2" />
              <span>خطأ في تحميل الإحصائيات: {error}</span>
            </Card>
          )}

        {!isLoading && (
            <Stats stats={stats || MockStats} />
        )}

        {/* Quick Actions & Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="الحجوزات القادمة (Mocked)">
            <ul className="space-y-3">
              <li className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                <span className="flex items-center"><Clock className="h-4 w-4 rtl:ml-2 ltr:mr-2 text-primary" /> 18:00 اليوم</span>
                <span className="font-semibold">فريق الأمل</span>
              </li>
              <li className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                <span className="flex items-center"><Clock className="h-4 w-4 rtl:ml-2 ltr:mr-2 text-primary" /> 20:00 غداً</span>
                <span className="font-semibold">فريق النجوم</span>
              </li>
            </ul>
          </Card>
          <Card title="ملخص الملاعب">
            <p className="text-3xl font-bold text-primary dark:text-secondary">
                <SoccerBall className="h-6 w-6 inline-block rtl:ml-2 ltr:mr-2" />
                {MockStats.available_stadiums} ملاعب مُدارة
            </p>
            <p className="text-sm text-gray-500 mt-2">انقر على ملاعبي لإدارة الجداول.</p>
          </Card>
          <Card title="إشعارات النظام (Mocked)">
            <div className="p-3 bg-yellow-100 rounded-lg text-yellow-800 text-sm">
                <AlertCircle className="h-4 w-4 inline-block rtl:ml-2 ltr:mr-2" />
                تذكر أن تنشئ مواعيد للأسابيع القادمة!
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerDashboardPage;
