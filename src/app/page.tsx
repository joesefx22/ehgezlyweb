// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Stadium } from '@/types';
import { stadiumsAPI } from '@/lib/api';
import StadiumCard from '@/components/stadiums/StadiumCard';

export default function HomePage() {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    type: ''
  });

  useEffect(() => {
    loadStadiums();
  }, [filters]);

  const loadStadiums = async () => {
    try {
      const response = await stadiumsAPI.getAll(filters);
      setStadiums(response.data);
    } catch (error) {
      console.error('Error loading stadiums:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">احجزلي</h1>
            <div className="flex space-x-4 space-x-reverse">
              <button className="text-gray-700 hover:text-blue-600">تسجيل الدخول</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                إنشاء حساب
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المدينة</label>
              <input
                type="text"
                placeholder="ابحث عن مدينة..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع الملعب</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="">كل الأنواع</option>
                <option value="football">كرة قدم</option>
                <option value="basketball">كرة سلة</option>
                <option value="tennis">تنس</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={loadStadiums}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                بحث
              </button>
            </div>
          </div>
        </div>

        {/* Stadiums Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stadiums.map((stadium) => (
            <StadiumCard key={stadium.id} stadium={stadium} />
          ))}
        </div>

        {stadiums.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">لا توجد ملاعب متاحة</p>
          </div>
        )}
      </div>
    </div>
  );
}
