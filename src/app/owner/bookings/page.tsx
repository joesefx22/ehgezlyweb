'use client';

import DashboardLayout from '@/components/dashboard/Layout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useApi } from '@/hooks/useApi';
import { Booking, Stadium } from '@/types';
import { useEffect, useState } from 'react';
import { Loader2, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { cn, formatTimeDisplay } from '@/lib/utils';

/**
 * صفحة حجوزات ملاعب المالك
 */
const OwnerBookingsPage: React.FC = () => {
  const { data: bookings, isLoading, error, execute, setData } = useApi<Booking[]>(true);
  const { data: stadiums, execute: fetchStadiums } = useApi<Stadium[]>(false);
  const [selectedStadium, setSelectedStadium] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchStadiums('/owner/stadiums'); // جلب ملاعب المالك للفلترة
    execute('/owner/bookings'); // جلب حجوزات المالك
  }, [execute, fetchStadiums]);

  const handleBookingAction = async (bookingId: string, action: 'confirm' | 'cancel') => {
    setActionLoading(bookingId);
    try {
      await execute(`/owner/bookings/${bookingId}/${action}`, 'PATCH');
      alert(`تم ${action === 'confirm' ? 'تأكيد' : 'إلغاء'} الحجز بنجاح.`);
      // تحديث حالة الحجز في الـ state
      setData(prev => prev ? prev.map(b => b.id === bookingId ? { ...b, status: action === 'confirm' ? 'confirmed' : 'cancelled' } : b) : null);
    } catch (err) {
      alert(`فشل العملية: ${(err as Error).message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = bookings?.filter(b => selectedStadium === '' || b.stadium_id === selectedStadium);

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success">مؤكد</Badge>;
      case 'pending':
        return <Badge variant="warning">بانتظار الدفع</Badge>;
      case 'cancelled':
        return <Badge variant="danger">ملغي</Badge>;
      case 'checked_in':
        return <Badge variant="info">تم الدخول</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout allowedRoles={['owner', 'manager']}>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold dark:text-white">إدارة حجوزات ملاعبك</h1>
        
        {/* Filter Section */}
        <Card title="فلترة الحجوزات">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">الملعب:</label>
              <select 
                value={selectedStadium} 
                onChange={(e) => setSelectedStadium(e.target.value)}
                className="form-input"
              >
                <option value="">جميع الملاعب</option>
                {stadiums?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            {/* يمكن إضافة فلاتر أخرى للتاريخ/الحالة */}
          </div>
        </Card>

        {isLoading && (
          <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        )}

        {filteredBookings && filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className={cn(
                'border-r-8',
                booking.status === 'confirmed' ? 'border-primary' :
                booking.status === 'cancelled' ? 'border-red-500' : 'border-accent'
              )}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold dark:text-white">
                        حجز لـ: <span className="text-primary">{stadiums?.find(s => s.id === booking.stadium_id)?.name || 'ملعب غير معروف (Mocked)'}</span>
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      تاريخ: <span className="font-semibold">{booking.date}</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <Clock className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                      الوقت: <span className="font-semibold rtl:mr-1 ltr:ml-1">{formatTimeDisplay(booking.start_time)} - {formatTimeDisplay(booking.end_time)}</span>
                    </p>
                    <p className="text-lg font-bold text-primary dark:text-secondary flex items-center">
                        <DollarSign className="h-5 w-5 rtl:ml-2 ltr:mr-2" />
                        الإجمالي: {booking.total_price} د.ع
                    </p>
                    <div className="mt-2">{getStatusBadge(booking.status)}</div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex space-x-3 rtl:space-x-reverse">
                    {booking.status === 'pending' && (
                      <>
                        <Button 
                          variant="success" 
                          size="sm" 
                          isLoading={actionLoading === booking.id}
                          onClick={() => handleBookingAction(booking.id, 'confirm')}
                        >
                          <CheckCircle className="h-4 w-4 rtl:ml-1 ltr:mr-1" /> تأكيد
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => handleBookingAction(booking.id, 'cancel')}
                          isLoading={actionLoading === booking.id}
                        >
                          <XCircle className="h-4 w-4 rtl:ml-1 ltr:mr-1" /> إلغاء
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          !isLoading && <Card className="text-center p-8 text-gray-500">لا توجد حجوزات لعرضها.</Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OwnerBookingsPage;
