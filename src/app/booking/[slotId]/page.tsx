// src/app/booking/[slotId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Stadium, StadiumSlot } from '@/types';
import { stadiumsAPI, bookingsAPI, codesAPI } from '@/lib/api';

export default function BookingPage() {
  const params = useParams();
  const slotId = params.slotId as string;
  const router = useRouter();
  const { user } = useAuth();
  
  const [slot, setSlot] = useState<StadiumSlot | null>(null);
  const [stadium, setStadium] = useState<Stadium | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [formData, setFormData] = useState({
    payment_method: 'online' as 'online' | 'code',
    discount_code: '',
    guest_name: '',
    guest_phone: '',
    players_needed: 0
  });
  const [discountInfo, setDiscountInfo] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadBookingData();
  }, [slotId, user]);

  const loadBookingData = async () => {
    try {
      // في الواقع، تحتاج لجلب بيانات الساعة والملعب من API
      // هذا مثال مبسط
      const slotResponse = { data: { /* slot data */ } };
      const stadiumResponse = { data: { /* stadium data */ } };
      
      setSlot(slotResponse.data as StadiumSlot);
      setStadium(stadiumResponse.data as Stadium);
    } catch (error) {
      console.error('Error loading booking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateDiscountCode = async () => {
    if (!formData.discount_code || !stadium) return;
    
    try {
      const response = await codesAPI.validate(formData.discount_code, stadium.id);
      setDiscountInfo(response.data);
    } catch (error: any) {
      alert(error.response?.data?.message || 'كود الخصم غير صالح');
      setDiscountInfo(null);
    }
  };

  const handleBooking = async () => {
    if (!slot || !stadium) return;
    
    setBookingLoading(true);
    try {
      const bookingData = {
        slot_id: slot.id,
        stadium_id: stadium.id,
        date: slot.slot_date,
        start_time: slot.slot_time,
        end_time: '...', // حساب وقت الانتهاء
        payment_method: formData.payment_method,
        code: formData.discount_code || undefined,
        guest_name: formData.guest_name || undefined,
        guest_phone: formData.guest_phone || undefined,
        players_needed: formData.players_needed || 0
      };

      const response = await bookingsAPI.create(bookingData);
      
      if (response.data.payment) {
        // توجيه لصفحة الدفع
        alert('يجب إتمام دفع العربون');
      } else {
        alert('تم إنشاء الحجز بنجاح!');
        router.push('/dashboard/bookings');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ أثناء الحجز');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!slot || !stadium) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">الساعة غير متاحة</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-6">إتمام الحجز</h1>

          {/* Booking Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="font-semibold mb-3">ملخص الحجز</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">الملعب: </span>
                <span>{stadium.name}</span>
              </div>
              <div>
                <span className="text-gray-600">التاريخ: </span>
                <span>{slot.slot_date}</span>
              </div>
              <div>
                <span className="text-gray-600">الوقت: </span>
                <span>{slot.slot_time}</span>
              </div>
              <div>
                <span className="text-gray-600">السعر: </span>
                <span>{stadium.price_per_hour} ج.س</span>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="space-y-6">
            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                طريقة الدفع
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, payment_method: 'online' }))}
                  className={`p-3 border rounded-lg text-center ${
                    formData.payment_method === 'online'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  💳 دفع أونلاين
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, payment_method: 'code' }))}
                  className={`p-3 border rounded-lg text-center ${
                    formData.payment_method === 'code'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  🎫 دفع بالكود
                </button>
              </div>
            </div>

            {/* Discount Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كود الخصم
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="أدخل كود الخصم"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.discount_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_code: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={validateDiscountCode}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  تحقق
                </button>
              </div>
              {discountInfo && (
                <p className="text-green-600 text-sm mt-2">كود الخصم صالح!</p>
              )}
            </div>

            {/* Additional Players */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عدد اللاعبين الإضافيين المطلوبين
              </label>
              <input
                type="number"
                min="0"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.players_needed}
                onChange={(e) => setFormData(prev => ({ ...prev, players_needed: parseInt(e.target.value) || 0 }))}
              />
            </div>

            {/* Guest Information (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                معلومات الضيف (اختياري)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="اسم الضيف"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.guest_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, guest_name: e.target.value }))}
                />
                <input
                  type="tel"
                  placeholder="هاتف الضيف"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.guest_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, guest_phone: e.target.value }))}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleBooking}
              disabled={bookingLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bookingLoading ? 'جاري إنشاء الحجز...' : 'تأكيد الحجز'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
