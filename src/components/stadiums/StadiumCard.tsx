// src/components/stadiums/StadiumCard.tsx
'use client';

import { Stadium } from '@/types';
import Link from 'next/link';

interface StadiumCardProps {
  stadium: Stadium;
}

export default function StadiumCard({ stadium }: StadiumCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
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
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{stadium.name}</h3>
        <p className="text-gray-600 mb-2">{stadium.location}</p>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">{stadium.type}</span>
          <div className="flex items-center">
            <span className="text-yellow-400">⭐</span>
            <span className="text-sm text-gray-600 mr-1">
              {stadium.average_rating || '0.0'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-bold text-blue-600">
            {stadium.price_per_hour} ج.س/ساعة
          </span>
          <span className="text-sm text-gray-500">
            عربون: {stadium.deposit_amount} ج.س
          </span>
        </div>

        <Link
          href={`/stadiums/${stadium.id}`}
          className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          احجز الآن
        </Link>
      </div>
    </div>
  );
}
