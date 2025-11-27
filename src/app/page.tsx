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

import Link from 'next/link';
import { SoccerBall, Users, Key } from 'lucide-react';

/**
 * الصفحة الرئيسية (Landing Page)
 */
const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <header className="text-center mb-12">
        <SoccerBall className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-3">
          احجزلي
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          ملعبك في ضغطة، وحجزك مؤكد عندنا.
        </p>
      </header>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-6">
        <Link href="/login" passHref>
          <button className="flex items-center justify-center px-8 py-4 bg-primary text-white text-xl font-bold rounded-xl shadow-lg hover:bg-secondary transition-colors duration-300 transform hover:scale-105 min-w-[250px]">
            <Key className="h-6 w-6 rtl:ml-3 ltr:mr-3" />
            تسجيل الدخول / الحجز
          </button>
        </Link>
        <Link href="/signup" passHref>
          <button className="flex items-center justify-center px-8 py-4 bg-gray-200 text-gray-800 text-xl font-bold rounded-xl shadow-lg hover:bg-gray-300 transition-colors duration-300 transform hover:scale-105 min-w-[250px]">
            <Users className="h-6 w-6 rtl:ml-3 ltr:mr-3" />
            إنشاء حساب جديد
          </button>
        </Link>
      </div>

      {/* Feature Section */}
      <section className="mt-16 w-full max-w-4xl text-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
          لماذا تختار احجزلي؟
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<MapPin className="h-8 w-8 text-accent" />}
            title="سهولة الوصول"
            description="ابحث عن الملاعب القريبة منك وحسب المواصفات المناسبة."
          />
          <FeatureCard 
            icon={<Clock className="h-8 w-8 text-accent" />}
            title="تأكيد فوري"
            description="احجز مواعيدك وادفع بأمان عبر الإنترنت مع تأكيد فوري."
          />
          <FeatureCard 
            icon={<Users className="h-8 w-8 text-accent" />}
            title="تكوين فريقك"
            description="انضم أو انشئ طلبات لجمع لاعبين لمباراتك القادمة."
          />
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
    <div className="p-6 bg-white dark:bg-dark-card rounded-xl shadow-lg transform hover:shadow-xl transition-all duration-300">
        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-accent/10 mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-semibold dark:text-white mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
    </div>
);

export default HomePage;
