// src/app/stadiums/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Stadium, StadiumSlot } from '@/types';
import { stadiumsAPI } from '@/lib/api';
import SlotPicker from '@/components/stadiums/SlotPicker';

export default function StadiumDetailsPage() {
  const params = useParams();
  const stadiumId = params.id as string;
  
  const [stadium, setStadium] = useState<Stadium | null>(null);
  const [slots, setSlots] = useState<StadiumSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStadiumDetails();
  }, [stadiumId]);

  useEffect(() => {
    if (selectedDate) {
      loadSlots();
    }
  }, [selectedDate]);

  const loadStadiumDetails = async () => {
    try {
      const response = await stadiumsAPI.getById(stadiumId);
      setStadium(response.data);
      // Set default date to today
      setSelectedDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error loading stadium details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async () => {
    try {
      const response = await stadiumsAPI.getSlots(stadiumId, selectedDate);
      setSlots(response.data);
    } catch (error) {
      console.error('Error loading slots:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stadium) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">الملعب غير موجود</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stadium Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <div className="h-64 bg-gray-200 rounded-lg overflow-hidden">
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
              </div>
            </div>
            
            <div className="md:w-2/3">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{stadium.name}</h1>
              <p className="text-gray-600 mb-4">{stadium.location}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">السعر بالساعة</p>
                  <p className="text-xl font-bold text-blue-600">{stadium.price_per_hour} ج.س</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">العربون</p>
                  <p className="text-lg text-gray-700">{stadium.deposit_amount} ج.س</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">التقييم</p>
                  <div className="flex items-center">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-gray-700 mr-1">
                      {stadium.average_rating || '0.0'} ({stadium.total_ratings || 0} تقييم)
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">النوع</p>
                  <p className="text-gray-700 capitalize">{stadium.type}</p>
                </div>
              </div>

              {/* Features */}
              {stadium.features && Object.keys(stadium.features).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">المميزات</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(stadium.features).map(([feature, available]) => 
                      available && (
                        <span key={feature} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {feature}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-6">احجز موعد</h2>
          
          {/* Date Picker */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اختر التاريخ
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Slots Grid */}
          <SlotPicker 
            slots={slots} 
            stadium={stadium}
            date={selectedDate}
            onSlotsUpdate={loadSlots}
          />
        </div>
      </div>
    </div>
  );
}
