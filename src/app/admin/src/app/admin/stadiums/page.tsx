'use client';

import DashboardLayout from '@/components/dashboard/Layout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useApi } from '@/hooks/useApi';
import { Stadium } from '@/types';
import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, MapPin, DollarSign, Trash2, Edit } from 'lucide-react';

/**
 * صفحة إدارة الملاعب (لـ Admin)
 */
const AdminStadiumsPage: React.FC = () => {
  const { data: stadiums, isLoading, error, execute } = useApi<Stadium[]>(true);

  useEffect(() => {
    execute('/stadiums'); // جلب جميع الملاعب (الـ API العام)
  }, [execute]);

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold dark:text-white">إدارة جميع الملاعب</h1>

        {isLoading && (
          <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        )}

        {error && (
          <Card className="bg-red-50 border-red-200 text-red-600 p-4 flex items-center">
            <AlertCircle className="h-5 w-5 rtl:ml-2 ltr:mr-2" />
            <span>خطأ في تحميل الملاعب: {error}</span>
          </Card>
        )}

        {stadiums && stadiums.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {stadiums.map((stadium) => (
              <Card key={stadium.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold dark:text-white">{stadium.name}</h2>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center"><MapPin className="h-4 w-4 rtl:ml-1 ltr:mr-1" /> {stadium.location}</span>
                    <span className="flex items-center"><DollarSign className="h-4 w-4 rtl:ml-1 ltr:mr-1" /> {stadium.price_per_hour} د.ع / ساعة</span>
                  </div>
                  <Badge variant="success">معتمد</Badge>
                  <p className="text-xs text-gray-500">المالك ID: {stadium.owner_id.substring(0, 8)}...</p>
                </div>
                
                <div className="mt-4 md:mt-0 flex space-x-3 rtl:space-x-reverse">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    // Mocked Action
                    onClick={() => alert(`تعديل الملعب: ${stadium.name}`)}
                  >
                    <Edit className="h-4 w-4" /> تعديل
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => alert(`حذف الملعب: ${stadium.name}`)}
                  >
                    <Trash2 className="h-4 w-4" /> حذف
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          !isLoading && <Card className="text-center p-8 text-gray-500">لا يوجد ملاعب مُسجلة في النظام.</Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminStadiumsPage;
