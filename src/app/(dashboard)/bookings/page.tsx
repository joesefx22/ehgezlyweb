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
