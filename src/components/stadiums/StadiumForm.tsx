'use client';

import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { Stadium } from '@/types';

interface StadiumFormProps {
  initialData?: Stadium;
  onSubmit: (data: Partial<Stadium>) => Promise<void>;
  isLoading: boolean;
}

const defaultStadiumData: Partial<Stadium> = {
  name: '',
  location: '',
  price_per_hour: 0,
  description: '',
  amenities: [],
  size_m2: 0,
};

const availableAmenities = ['إنارة', 'مياه', 'مواقف سيارات', 'غرف تغيير', 'Wi-Fi'];

const StadiumForm: React.FC<StadiumFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<Partial<Stadium>>(initialData || defaultStadiumData);

  useEffect(() => {
    setFormData(initialData || defaultStadiumData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: id === 'price_per_hour' || id === 'size_m2' ? parseFloat(value) || 0 : value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => {
      const currentAmenities = prev.amenities || [];
      if (currentAmenities.includes(amenity)) {
        return { ...prev, amenities: currentAmenities.filter((a) => a !== amenity) };
      } else {
        return { ...prev, amenities: [...currentAmenities, amenity] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isEditMode = !!initialData;

  return (
    <Card title={isEditMode ? 'تعديل بيانات الملعب' : 'إضافة ملعب جديد'} className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="name">اسم الملعب</label>
            <input id="name" type="text" value={formData.name || ''} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="location">الموقع/العنوان</label>
            <input id="location" type="text" value={formData.location || ''} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="price_per_hour">سعر الساعة (دينار/ريال)</label>
            <input id="price_per_hour" type="number" value={formData.price_per_hour || 0} onChange={handleChange} required min="0" step="0.01" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="size_m2">المساحة (متر مربع)</label>
            <input id="size_m2" type="number" value={formData.size_m2 || 0} onChange={handleChange} required min="100" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="description">وصف الملعب</label>
          <textarea id="description" value={formData.description || ''} onChange={handleChange} rows={3} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary"></textarea>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">المرافق المتاحة</label>
          <div className="flex flex-wrap gap-3">
            {availableAmenities.map((amenity) => (
              <Button
                key={amenity}
                type="button"
                variant={formData.amenities?.includes(amenity) ? 'primary' : 'ghost'}
                onClick={() => handleAmenityToggle(amenity)}
                className="px-4 py-2"
              >
                {amenity}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Placeholder for Images Upload */}
        <Card className="p-4 bg-gray-50 dark:bg-gray-800">
            <h4 className="text-lg font-semibold mb-2 dark:text-white">صور الملعب</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">ستتم إضافة خاصية رفع الصور هنا لاحقاً.</p>
        </Card>

        <Button type="submit" isLoading={isLoading} className="w-full" variant={isEditMode ? 'secondary' : 'primary'}>
          {isEditMode ? 'حفظ التعديلات' : 'إضافة الملعب'}
        </Button>
      </form>
    </Card>
  );
};

export default StadiumForm;
