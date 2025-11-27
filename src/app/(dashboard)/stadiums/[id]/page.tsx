'use client';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import SlotPicker from '@/components/stadiums/SlotPicker';
import BookingForm from '@/components/stadiums/BookingForm';
import { useApi } from '@/hooks/useApi';
import { Stadium, TimeSlot } from '@/types';
import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, MapPin, DollarSign, Clock, Star, Zap } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

const MockStadiumDetails: Stadium = {
    id: 'mock-123',
    owner_id: 'owner-1',
    name: 'ملعب النجوم الذهبي',
    location: 'الرياض، حي الملز',
    size_m2: 1200,
    price_per_hour: 50,
    description: 'ملعب كرة قدم عالي الجودة مجهز بإضاءة ممتازة وعشب صناعي من الدرجة الأولى. مثالي للمباريات الودية والبطولات الصغيرة.',
    amenities: ['إنارة', 'مياه', 'مواقف سيارات', 'غرف تغيير'],
    images: ['url1', 'url2'],
    average_rating: 4.5,
}

interface StadiumDetailsPageProps {
  params: { id: string };
}

/**
 * صفحة تفاصيل الملعب والحجز
 */
const StadiumDetailsPage: React.FC<StadiumDetailsPageProps> = ({ params }) => {
  const stadiumId = params.id;
  // جلب تفاصيل الملعب (نستخدم بيانات Mocked لتجنب طلبات متعددة)
  const { data: stadium, isLoading: isStadiumLoading, error: stadiumError, execute: fetchStadium } = useApi<Stadium>(false);

  // جلب المواعيد المتاحة
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { data: slots, isLoading: isSlotsLoading, error: slotsError, execute: fetchSlots } = useApi<TimeSlot[]>(true);

  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  useEffect(() => {
    // Mocked fetch for stadium details
    fetchStadium(`/stadiums/${stadiumId}`);
    fetchSlots(`/slots/available?stadiumId=${stadiumId}&date=${selectedDate}`);
  }, [stadiumId, selectedDate, fetchSlots, fetchStadium]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    // سيؤدي تغيير التاريخ إلى إعادة تشغيل الـ useEffect أعلاه لجلب المواعيد الجديدة
  }

  // استخدام بيانات وهمية في حالة عدم تحميل البيانات الحقيقية
  const displayStadium = stadium || MockStadiumDetails; 

  if (isStadiumLoading && !stadium) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (stadiumError) {
    return (
        <div className="p-8"><Card className="bg-red-50 border-red-200 text-red-600 p-4">خطأ في تحميل بيانات الملعب: {stadiumError}</Card></div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Stadium Header */}
      <Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                <h1 className="text-4xl font-extrabold text-primary dark:text-secondary">{displayStadium.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400">
                    <Badge variant="warning"><Star className="h-4 w-4 rtl:ml-1 ltr:mr-1 fill-accent" /> {displayStadium.average_rating.toFixed(1)} تقييم</Badge>
                    <Badge variant="info"><MapPin className="h-4 w-4 rtl:ml-1 ltr:mr-1" /> {displayStadium.location}</Badge>
                    <Badge variant="success"><DollarSign className="h-4 w-4 rtl:ml-1 ltr:mr-1" /> {displayStadium.price_per_hour} د.ع / ساعة</Badge>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mt-4">{displayStadium.description}</p>
                
                <h3 className="text-lg font-semibold dark:text-white mt-4">المرافق:</h3>
                <div className="flex flex-wrap gap-2">
                    {displayStadium.amenities.map(a => <Badge key={a} variant='primary'>{a}</Badge>)}
                </div>
            </div>
            {/* Mocked Image Gallery/Info */}
            <div className="relative h-64 bg-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
                <Zap className="h-16 w-16 text-primary/50" />
                <span className="absolute bottom-4 text-white bg-black/50 p-1 rounded">معرض الصور (Mocked)</span>
            </div>
        </div>
      </Card>
      
      {/* Booking Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SlotPicker
            stadiumId={stadiumId}
            onSelectSlot={setSelectedSlot}
            slots={slots || []}
            isLoading={isSlotsLoading}
            error={slotsError}
            onDateChange={handleDateChange}
            selectedDate={selectedDate}
          />
        </div>

        <div className="lg:col-span-2">
          {selectedSlot ? (
            <BookingForm 
              stadiumName={displayStadium.name} 
              selectedSlot={selectedSlot} 
            />
          ) : (
            <Card title="استكمال الحجز" className="h-full flex items-center justify-center bg-blue-50 dark:bg-dark-card/50 border-blue-200">
              <p className="text-xl text-blue-600 dark:text-blue-400 font-semibold flex items-center">
                <Clock className="h-6 w-6 rtl:ml-3 ltr:mr-3" />
                يرجى اختيار موعد متاح من القائمة على اليمين للمتابعة.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StadiumDetailsPage;
