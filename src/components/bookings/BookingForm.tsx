'use client';

import React, { useState } from 'react';
import { TimeSlot, CompensationCode } from '@/types';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface BookingFormProps {
  stadiumName: string;
  selectedSlot: TimeSlot;
}

const BookingForm: React.FC<BookingFormProps> = ({ stadiumName, selectedSlot }) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCode, setAppliedCode] = useState<CompensationCode | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const router = useRouter();

  const originalPrice = selectedSlot.price;
  const discountAmount = appliedCode ? (originalPrice * appliedCode.discount_percentage / 100) : 0;
  const finalPrice = originalPrice - discountAmount;

  const handleValidateCoupon = async () => {
    if (!couponCode) return;
    setIsCouponLoading(true);
    setCouponError('');
    setAppliedCode(null);

    try {
      const result: CompensationCode = await apiRequest(`/codes/validate?code=${couponCode}`);
      setAppliedCode(result);
      setCouponError('');
    } catch (err) {
      setCouponError((err as Error).message);
    } finally {
      setIsCouponLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot) return;
    setIsBookingLoading(true);

    try {
      const bookingData = {
        stadium_id: selectedSlot.stadium_id,
        slot_id: selectedSlot.id,
        code_id: appliedCode?.id,
      };

      const result = await apiRequest<{ bookingId: string }>('/bookings', 'POST', bookingData);
      
      // التوجيه إلى صفحة تأكيد الدفع أو الحجز
      alert(`تم الحجز بنجاح! رقم الحجز: ${result.bookingId}`);
      router.push(`/bookings`);

    } catch (err) {
      alert(`فشل الحجز: ${(err as Error).message}`);
    } finally {
      setIsBookingLoading(false);
    }
  };

  return (
    <Card title={`تأكيد حجز ${stadiumName}`} className="space-y-6">
      {/* 1. Booking Details */}
      <div className="border-b pb-4 dark:border-gray-700">
        <h4 className="text-lg font-semibold dark:text-white mb-2">تفاصيل الموعد</h4>
        <p>التاريخ: <span className="font-bold">{selectedSlot.date}</span></p>
        <p>الوقت: <span className="font-bold">{selectedSlot.start_time} - {selectedSlot.end_time}</span></p>
        <p className="text-xl font-bold text-primary dark:text-secondary flex items-center mt-2">
          <DollarSign className="h-5 w-5 rtl:ml-2 ltr:mr-2" />
          السعر الأصلي: {originalPrice.toFixed(2)} د.ع
        </p>
      </div>

      {/* 2. Coupon/Code */}
      <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="text-lg font-semibold dark:text-white">هل لديك كود خصم؟</h4>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="أدخل كود الخصم"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            disabled={isCouponLoading || !!appliedCode}
            className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-200"
          />
          <Button 
            type="button" 
            onClick={handleValidateCoupon} 
            isLoading={isCouponLoading}
            disabled={!couponCode || !!appliedCode}
          >
            تطبيق
          </Button>
        </div>
        
        {couponError && (
          <p className="text-red-500 text-sm flex items-center"><XCircle className="h-4 w-4 rtl:ml-1 ltr:mr-1" /> {couponError}</p>
        )}
        
        {appliedCode && (
          <p className="text-green-600 font-medium text-sm flex items-center">
            <CheckCircle className="h-4 w-4 rtl:ml-1 ltr:mr-1" />
            تم تطبيق خصم بنسبة {appliedCode.discount_percentage}% بنجاح.
          </p>
        )}
      </div>

      {/* 3. Final Summary */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <div className="flex justify-between font-medium dark:text-gray-300">
            <span>الخصم:</span>
            <span className="text-red-500">- {discountAmount.toFixed(2)} د.ع</span>
        </div>
        <div className="flex justify-between font-bold text-2xl dark:text-white">
            <span>الإجمالي النهائي:</span>
            <span className="text-primary">{finalPrice.toFixed(2)} د.ع</span>
        </div>
      </div>

      {/* 4. Confirmation Button */}
      <Button 
        type="button" 
        onClick={handleBooking} 
        isLoading={isBookingLoading}
        className="w-full text-lg h-12"
      >
        تأكيد الحجز والدفع
      </Button>
      
      <p className="text-xs text-center text-gray-400">ستتم عملية دفع آمنة بعد التأكيد.</p>
    </Card>
  );
};

export default BookingForm;
