// src/app/(dashboard)/bookings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Booking } from '@/types';
import { bookingsAPI } from '@/lib/api';

export default function PlayerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  const loadBookings = async () => {
    try {
      const response = await bookingsAPI.getMyBookings(
        statusFilter === 'all' ? undefined : statusFilter
      );
      setBookings(response.data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('هل أنت متأكد من إلغاء هذا الحجز؟')) return;

    try {
      await bookingsAPI.cancel(bookingId);
      alert('تم إلغاء الحجز بنجاح');
      loadBookings();
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ أثناء الإلغاء');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'REFUNDED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'مؤكد';
      case 'PENDING': return 'بانتظار التأكيد';
      case 'CANCELLED': return 'ملغى';
      case 'REFUNDED': return 'تم الاسترداد';
      default: return status;
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
        <h1 className="text-2xl font-bold text-gray-900">حجوزاتي</h1>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">كل الحجوزات</option>
          <option value="CONFIRMED">مؤكدة</option>
          <option value="PENDING">قيد الانتظار</option>
          <option value="CANCELLED">ملغاة</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">لا توجد حجوزات</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {bookings.map((booking) => (
              <div key={booking.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.stadium_name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">التاريخ: </span>
                        {booking.date}
                      </div>
                      <div>
                        <span className="font-medium">الوقت: </span>
                        {booking.start_time} - {booking.end_time}
                      </div>
                      <div>
                        <span className="font-medium">السعر: </span>
                        {booking.total_price} ج.س
                      </div>
                      <div>
                        <span className="font-medium">العربون: </span>
                        {booking.deposit_amount} ج.س
                      </div>
                    </div>

                    {booking.payment_method && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">طريقة الدفع: </span>
                        {booking.payment_method === 'PAYMOB' ? 'دفع أونلاين' : 'كود دفع'}
                      </div>
                    )}
                  </div>

                  <div className="ml-6 flex flex-col space-y-2">
                    {booking.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                      >
                        إلغاء
                      </button>
                    )}
                    
                    <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">
                      تفاصيل
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useApi } from '@/hooks/useApi';
import { Booking } from '@/types';
import { useEffect, useState } from 'react';
import { Loader2, Clock, MapPin, XCircle, CheckCircle } from 'lucide-react';
import { cn, formatTimeDisplay } from '@/lib/utils';

/**
 * صفحة حجوزات اللاعب
 */
const PlayerBookingsPage: React.FC = () => {
  const { data: bookings, isLoading, error, execute } = useApi<Booking[]>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    execute('/bookings/user'); // جلب حجوزات المستخدم
  }, [execute]);

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

  const openCancellationModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    if (!confirm('هل أنت متأكد من إلغاء هذا الحجز؟ قد تطبق رسوم إلغاء.')) {
        return;
    }

    setIsCancelling(true);
    try {
      await execute(`/bookings/${selectedBooking.id}/cancel`, 'PATCH');
      alert('تم إلغاء الحجز بنجاح.');
      // تحديث القائمة بعد الإلغاء
      execute('/bookings/user'); 
      setIsModalOpen(false);
    } catch (err) {
      alert(`فشل الإلغاء: ${(err as Error).message}`);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold dark:text-white">حجوزاتي الحالية والسابقة</h1>

      {isLoading && (
        <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      )}

      {bookings && bookings.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className={cn(
                'border-r-8',
                booking.status === 'confirmed' ? 'border-primary' :
                booking.status === 'cancelled' ? 'border-red-500' : 'border-accent'
            )}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold dark:text-white">حجز في: ملعب الإبهار (Mocked)</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <MapPin className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                    تاريخ الحجز: <span className="font-semibold rtl:mr-1 ltr:ml-1">{booking.date}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <Clock className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                    الوقت: <span className="font-semibold rtl:mr-1 ltr:ml-1">{formatTimeDisplay(booking.start_time)} - {formatTimeDisplay(booking.end_time)}</span>
                  </p>
                  <p className="text-lg font-bold text-primary dark:text-secondary">الإجمالي: {booking.total_price} د.ع</p>
                </div>
                
                <div className="mt-4 md:mt-0 flex flex-col items-end space-y-2">
                  {getStatusBadge(booking.status)}
                  {booking.status === 'confirmed' && (
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => openCancellationModal(booking)}
                    >
                      إلغاء الحجز
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        !isLoading && <Card className="text-center p-8 text-gray-500">لا توجد لديك حجوزات حالياً.</Card>
      )}

      {/* Cancellation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="تأكيد إلغاء الحجز">
        {selectedBooking && (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              أنت على وشك إلغاء حجز ملعب <span className="font-bold">ملعب الإبهار (Mocked)</span> في تاريخ <span className="font-bold">{selectedBooking.date}</span> ووقت <span className="font-bold">{formatTimeDisplay(selectedBooking.start_time)}.</span>
            </p>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <XCircle className="h-5 w-5 inline rtl:ml-2 ltr:mr-2" />
              يرجى العلم أن رسوم إلغاء قد تطبق حسب سياسة الملعب. هل تود المتابعة؟
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="rtl:ml-3 ltr:mr-3">
                تراجع
              </Button>
              <Button variant="danger" isLoading={isCancelling} onClick={handleCancelBooking}>
                نعم، قم بالإلغاء
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PlayerBookingsPage;
