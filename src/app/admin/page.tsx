'use client';

import DashboardLayout from '@/components/dashboard/Layout';
import Stats from '@/components/dashboard/Stats';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useApi } from '@/hooks/useApi';
import { DashboardStats, User } from '@/types';
import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, BarChart3, UserCheck, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const MockStats: DashboardStats = {
  total_bookings: 1200,
  total_revenue: 95000,
  new_users: 50,
  available_stadiums: 25,
  pending_managers: 5,
};

/**
 * لوحة تحكم الأدمن الرئيسي
 */
const AdminDashboardPage: React.FC = () => {
  const { data: stats, isLoading, error, execute } = useApi<DashboardStats>(true);
  const { data: pendingManagers, isLoading: isManagersLoading, execute: fetchPendingManagers, setData: setPendingManagers } = useApi<User[]>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    execute('/admin/dashboard/stats'); // جلب الإحصائيات العامة
    fetchPendingManagers('/admin/users/pending-managers'); // جلب المديرين بانتظار الموافقة
  }, [execute, fetchPendingManagers]);

  const handleApproveManager = async (managerId: string) => {
    setActionLoading(managerId);
    try {
      await execute('/admin/users/approve-manager', 'PATCH', { userId: managerId });
      alert('تمت الموافقة على المدير بنجاح.');
      // إزالة المدير من القائمة
      setPendingManagers(prev => prev ? prev.filter(u => u.id !== managerId) : null);
      execute('/admin/dashboard/stats'); // تحديث الإحصائيات
    } catch (err) {
      alert(`فشل الموافقة: ${(err as Error).message}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold dark:text-white">نظرة عامة على النظام</h1>
        
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

        {/* Pending Managers */}
        <Card title="المديرين والمالكين بانتظار الموافقة">
            {isManagersLoading && <div className="text-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
            
            {pendingManagers?.length === 0 && !isManagersLoading && (
                <p className="text-green-600 font-semibold flex items-center">
                    <CheckCircle className="h-5 w-5 rtl:ml-2 ltr:mr-2" />
                    لا يوجد حالياً أي طلبات معلقة للموافقة.
                </p>
            )}

            {pendingManagers && pendingManagers.length > 0 && (
                <ul className="space-y-3">
                    {pendingManagers.map(manager => (
                        <li key={manager.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-card/50 rounded-lg">
                            <div>
                                <p className="font-semibold dark:text-white">{manager.name}</p>
                                <p className="text-sm text-gray-500">{manager.email} | الدور: {manager.role}</p>
                            </div>
                            <Button 
                                variant="primary" 
                                size="sm" 
                                isLoading={actionLoading === manager.id}
                                onClick={() => handleApproveManager(manager.id)}
                                className="flex items-center"
                            >
                                <UserCheck className="h-4 w-4 rtl:ml-1 ltr:mr-1" /> موافقة
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
            
            <Button 
                variant="ghost" 
                className="mt-4 w-full"
                onClick={() => router.push('/admin/users')}
            >
                عرض جميع المستخدمين
            </Button>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
