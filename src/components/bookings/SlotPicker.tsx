'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Card from '../ui/Card';
import { TimeSlot } from '@/types';
import { cn, formatTimeDisplay } from '@/lib/utils';
import { Calendar, Clock } from 'lucide-react';
import Button from '../ui/Button';

interface SlotPickerProps {
  stadiumId: string;
  onSelectSlot: (slot: TimeSlot | null) => void;
  slots: TimeSlot[];
  isLoading: boolean;
  error: string | null;
  onDateChange: (date: string) => void;
  selectedDate: string;
}

const SlotPicker: React.FC<SlotPickerProps> = ({ stadiumId, onSelectSlot, slots, isLoading, error, onDateChange, selectedDate }) => {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  useEffect(() => {
    // إعادة تعيين الفتحة المختارة عند تغيير الملعب أو التاريخ
    setSelectedSlot(null);
    onSelectSlot(null);
  }, [stadiumId, selectedDate]);

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.is_booked) return;

    if (selectedSlot?.id === slot.id) {
      setSelectedSlot(null);
      onSelectSlot(null);
    } else {
      setSelectedSlot(slot);
      onSelectSlot(slot);
    }
  };

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  return (
    <Card title="اختر التاريخ والموعد" className="sticky top-4">
      <div className="space-y-4">
        {/* Date Picker */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
          <input
            type="date"
            value={selectedDate}
            min={today}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Slot Display */}
        <div className="mt-4">
          <h4 className="font-semibold flex items-center dark:text-white">
            <Clock className="h-4 w-4 rtl:ml-2 ltr:mr-2 text-primary" />
            المواعيد المتاحة
          </h4>
          
          {isLoading && (
            <div className="text-center py-8">جاري تحميل المواعيد...</div>
          )}

          {error && <p className="text-red-600 p-3 bg-red-100 rounded-lg">{error}</p>}

          {!isLoading && !error && slots.length === 0 && (
            <p className="text-gray-500 mt-4 text-center">لا توجد مواعيد متاحة لهذا التاريخ.</p>
          )}

          <div className="flex flex-wrap gap-2 mt-4 max-h-60 overflow-y-auto p-1">
            {slots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => handleSlotClick(slot)}
                disabled={slot.is_booked}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                  slot.is_booked
                    ? 'bg-red-200 text-red-700 cursor-not-allowed line-through'
                    : selectedSlot?.id === slot.id
                      ? 'bg-accent text-white shadow-md'
                      : 'bg-green-100 text-primary hover:bg-green-200',
                )}
              >
                {formatTimeDisplay(slot.start_time)} - {formatTimeDisplay(slot.end_time)}
                {!slot.is_booked && <span className="rtl:mr-1 ltr:ml-1 font-bold">({slot.price} د.ع)</span>}
                {slot.is_booked && <span className="rtl:mr-1 ltr:ml-1">(محجوزة)</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Confirmation Summary */}
        {selectedSlot && (
          <div className="p-4 bg-primary/10 rounded-lg border-r-4 border-primary">
            <p className="font-semibold text-gray-800 dark:text-white">ملخص الحجز:</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              الموعد: <span className="font-bold">{formatTimeDisplay(selectedSlot.start_time)}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              السعر: <span className="font-bold text-lg text-primary">{selectedSlot.price} د.ع</span>
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SlotPicker;
