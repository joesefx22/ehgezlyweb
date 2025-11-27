// src/app/owner/stadiums/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Stadium } from '@/types';
import { stadiumsAPI } from '@/lib/api';
import Link from 'next/link';

export default function OwnerStadiumsPage() {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStadiums();
  }, []);

  const loadStadiums = async () => {
    try {
      const response = await stadiumsAPI.getOwnerStadiums();
      setStadiums(response.data);
    } catch (error) {
      console.error('Error loading stadiums:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (stadiumId: string, currentStatus: boolean) => {
    try {
      await stadiumsAPI.update(stadiumId, { is_active: !currentStatus });
      alert(`تم ${!currentStatus ? 'تفعيل' : 'إيقاف'} الملعب بنجاح`);
      loadStadiums();
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ أثناء التحديث');
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
        <h1 className="text-2xl font-bold text-gray-900">ملاعبى</h1>
        <Link
          href="/owner/stadiums/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          إضافة ملعب جديد
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stadiums.map((stadium) => (
          <div key={stadium.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-48 bg-gray-200 relative">
              {stadium.images && stadium.images.length > 0 ? (
                <img
                  src={stadium.images[0]}
                  alt={stadium.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400">لا توجد صورة</span>
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  stadium.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {stadium.is_active ? 'نشط' : 'متوقف'}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{stadium.name}</h3>
              <p className="text-gray-600 mb-2">{stadium.location}</p>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{stadium.type}</span>
                <div className="text-lg font-bold text-blue-600">
                  {stadium.price_per_hour} ج.س
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">
                  عربون: {stadium.deposit_amount} ج.س
                </span>
                <div className="flex items-center">
                  <span className="text-yellow-400 text-sm">⭐</span>
                  <span className="text-sm text-gray-600 mr-1">
                    {stadium.average_rating || '0.0'}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2 space-x-reverse">
                <Link
                  href={`/owner/stadiums/${stadium.id}`}
                  className="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded-lg hover:bg-blue-700 text-sm"
                >
                  تعديل
                </Link>
                <Link
                  href={`/owner/stadiums/${stadium.id}/bookings`}
                  className="flex-1 bg-green-600 text-white text-center py-2 px-3 rounded-lg hover:bg-green-700 text-sm"
                >
                  الحجوزات
                </Link>
                <button
                  onClick={() => handleToggleStatus(stadium.id, stadium.is_active)}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    stadium.is_active
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {stadium.is_active ? 'إيقاف' : 'تفعيل'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {stadiums.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500 text-lg mb-4">لا توجد ملاعب</p>
          <Link
            href="/owner/stadiums/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            إضافة أول ملعب
          </Link>
        </div>
      )}
    </div>
  );
}

'use client';

import DashboardLayout from '@/components/dashboard/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useApi } from '@/hooks/useApi';
import { Stadium } from '@/types';
import { useEffect } from 'react';
import { Loader2, AlertCircle, MapPin, DollarSign, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * صفحة إدارة ملاعب المالك
 */
const OwnerStadiumsPage: React.FC = () => {
  const { data: stadiums, isLoading, error, execute } = useApi<Stadium[]>(true);
  const router = useRouter();

  useEffect(() => {
    execute('/owner/stadiums'); // جلب ملاعب المالك
  }, [execute]);

  return (
    <DashboardLayout allowedRoles={['owner', 'manager']}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold dark:text-white">ملاعبك المُدارة</h1>
          <Button onClick={() => router.push('/owner/stadiums/new')} variant="primary" className="flex items-center">
            <Plus className="h-5 w-5 rtl:ml-2 ltr:mr-2" />
            إضافة ملعب جديد
          </Button>
        </div>

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
                  <Badge variant="success">نشط</Badge>
                </div>
                
                <div className="mt-4 md:mt-0 flex space-x-3 rtl:space-x-reverse">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => router.push(`/owner/stadiums/${stadium.id}`)}
                  >
                    إدارة
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    // Mocked action
                    onClick={() => alert(`حذف الملعب: ${stadium.name}`)}
                  >
                    حذف
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          !isLoading && <Card className="text-center p-8 text-gray-500">لم تقم بإضافة أي ملاعب بعد. ابدأ الآن!</Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OwnerStadiumsPage;
