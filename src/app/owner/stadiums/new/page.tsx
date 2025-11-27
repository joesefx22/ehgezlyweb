'use client';

import DashboardLayout from '@/components/dashboard/Layout';
import StadiumForm from '@/components/forms/StadiumForm';
import { useApi } from '@/hooks/useApi';
import { Stadium } from '@/types';
import { useRouter } from 'next/navigation';

/**
 * صفحة إضافة ملعب جديد
 */
const NewStadiumPage: React.FC = () => {
  const { isLoading, execute } = useApi<Stadium>();
  const router = useRouter();

  const handleNewStadiumSubmit = async (data: Partial<Stadium>) => {
    try {
      await execute('/owner/stadiums', 'POST', data);
      alert('تم إضافة الملعب بنجاح. سيتم توجيهك الآن.');
      router.push('/owner/stadiums');
    } catch (err) {
      alert(`فشل الإضافة: ${(err as Error).message}`);
    }
  };

  return (
    <DashboardLayout allowedRoles={['owner', 'manager']}>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold dark:text-white">إضافة ملعب جديد</h1>
        <StadiumForm 
          onSubmit={handleNewStadiumSubmit} 
          isLoading={isLoading} 
        />
      </div>
    </DashboardLayout>
  );
};

export default NewStadiumPage;
