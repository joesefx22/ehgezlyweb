'use client';

import DashboardLayout from '@/components/dashboard/Layout';
import StadiumForm from '@/components/forms/StadiumForm';
import { useApi } from '@/hooks/useApi';
import { Stadium, TimeSlot } from '@/types';
import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Calendar, Plus, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { cn, formatTimeDisplay, formatDateDisplay } from '@/lib/utils';
import Modal from '@/components/ui/Modal';

interface EditStadiumPageProps {
  params: { id: string };
}

/**
 * صفحة إدارة وتعديل ملعب (بما في ذلك إدارة المواعيد)
 */
const EditStadiumPage: React.FC<EditStadiumPageProps> = ({ params }) => {
  const stadiumId = params.id;
  const { data: stadium, isLoading: isStadiumLoading, error: stadiumError, execute: fetchStadium } = useApi<Stadium>(true);
  
  // لإدارة المواعيد
  const { data: slots, isLoading: isSlotsLoading, error: slotsError, execute: fetchSlots } = useApi<TimeSlot[]>(true);
  const { isLoading: isSlotsActionLoading, execute: executeSlotAction } = useApi<any>(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [slotDate, setSlotDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('18:00');
  const [slotPrice, setSlotPrice] = useState(stadium?.price_per_hour || 50);

  useEffect(() => {
    fetchStadium(`/stadiums/${stadiumId}`);
  }, [stadiumId, fetchStadium]);

  // جلب المواعيد عند تغيير التاريخ أو تحميل الملعب
  useEffect(() => {
    if (stadiumId && slotDate) {
        fetchSlots(`/slots/available?stadiumId=${stadiumId}&date=${slotDate}`);
        setSlotPrice(stadium?.price_per_hour || 50);
    }
  }, [stadiumId, slotDate, fetchSlots, stadium?.price_per_hour]);

  const handleStadiumUpdate = async (data: Partial<Stadium>) => {
    try {
      await executeSlotAction(`/owner/stadiums/${stadiumId}`, 'PUT', data);
      alert('تم تحديث بيانات الملعب بنجاح.');
      fetchStadium(`/stadiums/${stadiumId}`); // تحديث البيانات المعروضة
    } catch (err) {
      alert(`فشل التحديث: ${(err as Error).message}`);
    }
  };

  const handleGenerateSlots = async () => {
    try {
        await executeSlotAction('/owner/stadiums/generate-slots', 'POST', { 
            stadium_id: stadiumId, 
            date: slotDate, 
            start_time: startTime, 
            end_time: endTime, 
            price: slotPrice
        });
        alert('تم إنشاء المواعيد بنجاح.');
        fetchSlots(`/slots/available?stadiumId=${stadiumId}&date=${slotDate}`);
    } catch (err) {
        alert(`فشل إنشاء المواعيد: ${(err as Error).message}`);
    }
  };

  const handleBlockSlot = async (slotId: string) => {
    if (!confirm('هل أنت متأكد من حظر هذا الموعد؟')) return;
    try {
        await executeSlotAction(`/owner/stadiums/slots/${slotId}/block`, 'PATCH');
        alert('تم حظر الموعد بنجاح.');
        fetchSlots(`/slots/available?stadiumId=${stadiumId}&date=${slotDate}`);
    } catch (err) {
        alert(`فشل حظر الموعد: ${(err as Error).message}`);
    }
  };

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
    <DashboardLayout allowedRoles={['owner', 'manager']}>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold dark:text-white">إدارة الملعب: {stadium?.name || 'غير محدد'}</h1>
        
        {/* Tab 1: Edit Details */}
        <StadiumForm 
          initialData={stadium} 
          onSubmit={handleStadiumUpdate} 
          isLoading={isSlotsActionLoading} 
        />
        
        {/* Tab 2: Manage Slots */}
        <Card title="إدارة المواعيد والجداول" className="mt-8">
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-4 mb-4 dark:border-gray-700">
                    <h3 className="text-xl font-semibold dark:text-white flex items-center">
                        <Calendar className="h-5 w-5 rtl:ml-2 ltr:mr-2 text-accent" />
                        المواعيد لـ {formatDateDisplay(slotDate)}
                    </h3>
                    <Button onClick={() => setIsModalOpen(true)} variant="secondary" className="flex items-center">
                        <Plus className="h-5 w-5 rtl:ml-2 ltr:mr-2" />
                        إنشاء مواعيد جديدة
                    </Button>
                </div>
                
                {/* Date Picker for Slot Display */}
                <div className="w-full md:w-1/3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تغيير التاريخ للعرض:</label>
                    <input 
                        type="date" 
                        value={slotDate} 
                        onChange={(e) => setSlotDate(e.target.value)}
                        className="form-input"
                    />
                </div>
                
                {isSlotsLoading && <div className="text-center py-6"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
                {slotsError && <div className="text-red-500 p-3 bg-red-50 rounded-lg">خطأ: {slotsError}</div>}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {slots?.map(slot => (
                        <div key={slot.id} className={cn(
                            'p-3 rounded-lg text-center shadow-md',
                            slot.is_booked 
                                ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 line-through' 
                                : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:shadow-lg transition-shadow'
                        )}>
                            <p className="font-bold">{formatTimeDisplay(slot.start_time)}</p>
                            <p className="text-xs">{slot.price} د.ع</p>
                            {!slot.is_booked && (
                                <Button 
                                    variant="danger" 
                                    size="sm" 
                                    className="mt-2 w-full"
                                    onClick={() => handleBlockSlot(slot.id)}
                                    isLoading={isSlotsActionLoading}
                                >
                                    <X className="h-4 w-4" /> حظر
                                </Button>
                            )}
                        </div>
                    ))}
                    {slots?.length === 0 && !isSlotsLoading && <p className="col-span-full text-center text-gray-500">لا توجد مواعيد لهذا التاريخ.</p>}
                </div>
            </div>
        </Card>

        {/* Modal for Slot Generation */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إنشاء مواعيد يومية/أسبوعية">
            <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">حدد التاريخ وفترة العمل لإنشاء مواعيد مدتها ساعة واحدة.</p>
                
                <div>
                    <label className="block text-sm font-medium mb-1">التاريخ</label>
                    <input type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} className="form-input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">وقت البدء</label>
                        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="form-input" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">وقت الانتهاء</label>
                        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="form-input" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">السعر للساعة (د.ع)</label>
                    <input type="number" value={slotPrice} onChange={(e) => setSlotPrice(parseFloat(e.target.value))} min="1" className="form-input" />
                </div>
                
                <Button onClick={handleGenerateSlots} isLoading={isSlotsActionLoading} className="w-full">
                    إنشاء المواعيد
                </Button>
            </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default EditStadiumPage;
