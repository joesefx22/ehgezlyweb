// src/components/stadiums/SlotPicker.tsx
'use client';

import { useState } from 'react';
import { Stadium, StadiumSlot } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface SlotPickerProps {
  slots: StadiumSlot[];
  stadium: Stadium;
  date: string;
  onSlotsUpdate: () => void;
}

export default function SlotPicker({ slots, stadium, date, onSlotsUpdate }: SlotPickerProps) {
  const [selectedSlot, setSelectedSlot] = useState<StadiumSlot | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const handleSlotSelect = (slot: StadiumSlot) => {
    if (slot.status === 'AVAILABLE') {
      setSelectedSlot(slot);
    }
  };

  const handleBooking = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (selectedSlot) {
      router.push(`/booking/${selectedSlot.id}`);
    }
  };

  const getSlotStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800 border-green-200';
      case 'BOOKED_CONFIRMED': return 'bg-red-100 text-red-800 border-red-200';
      case 'BOOKED_UNCONFIRMED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PLAYED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EXPIRED_UNBOOKED': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'REPORTED_NOT_PLAYED': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSlotStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'متاح';
      case 'BOOKED_CONFIRMED': return 'محجوز مؤكد';
      case 'BOOKED_UNCONFIRMED': return 'بانتظار التأكيد';
      case 'PLAYED': return 'تم اللعب';
      case 'EXPIRED_UNBOOKED': return 'منتهي';
      case 'REPORTED_NOT_PLAYED': return 'لم يلعب';
      default: return status;
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        {slots.map((slot) => (
          <button
            key={slot.id}
            onClick={() => handleSlotSelect(slot)}
            disabled={slot.status !== 'AVAILABLE'}
            className={`p-3 border rounded-lg text-center transition-colors ${
              selectedSlot?.id === slot.id
                ? 'ring-2 ring-blue-500 border-blue-500'
                : getSlotStatusColor(slot.status)
            } ${
              slot.status === 'AVAILABLE'
                ? 'hover:bg-green-200 cursor-pointer'
                : 'cursor-not-allowed opacity-60'
            }`}
          >
            <div className="font-medium">{slot.slot_time}</div>
            <div className="text-xs mt-1">{getSlotStatusText(slot.status)}</div>
            {slot.final_price && (
              <div className="text-xs font-bold mt-1">{slot.final_price} ج.س</div>
            )}
          </button>
        ))}
      </div>

      {slots.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">لا توجد ساعات متاحة لهذا التاريخ</p>
        </div>
      )}

      {selectedSlot && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">تفاصيل الحجز</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">الوقت: </span>
              <span>{selectedSlot.slot_time}</span>
            </div>
            <div>
              <span className="text-blue-700">التاريخ: </span>
              <span>{date}</span>
            </div>
            <div>
              <span className="text-blue-700">السعر: </span>
              <span>{stadium.price_per_hour} ج.س</span>
            </div>
            <div>
              <span className="text-blue-700">العربون: </span>
              <span>{stadium.deposit_amount} ج.س</span>
            </div>
          </div>
          
          <button
            onClick={handleBooking}
            className="mt-4 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            تأكيد الحجز
          </button>
        </div>
      )}
    </div>
  );
}
