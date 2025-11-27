'use client';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useApi } from '@/hooks/useApi';
import { PlayerRequest } from '@/types';
import { useEffect, useState } from 'react';
import { Loader2, Users, AlertCircle } from 'lucide-react';

/**
 * صفحة طلبات اللاعبين (للانضمام إلى المباريات)
 */
const PlayerRequestsPage: React.FC = () => {
  const { data: requests, isLoading, error, execute, setData } = useApi<PlayerRequest[]>(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    execute('/player-requests/active'); // جلب الطلبات النشطة للاعبين
  }, [execute]);

  const handleJoinRequest = async (requestId: string) => {
    setIsJoining(true);
    try {
      await execute(`/player-requests/${requestId}/join`, 'POST');
      alert('تم إرسال طلب الانضمام بنجاح.');
      
      // تحديث حالة الطلب محلياً
      setData(prev => prev ? prev.map(req => req.id === requestId ? { ...req, status: 'pending' } : req) : null);

    } catch (err) {
      alert(`فشل الانضمام: ${(err as Error).message}`);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold dark:text-white">طلبات اللاعبين للانضمام</h1>

      <Card title="إنشاء طلب لاعب جديد" className="p-4 bg-primary/5 border-primary/20">
        <p className="text-gray-600 dark:text-gray-400">
          هل تحتاج لاعبين لملعب قمت بحجزه؟ يمكنك إنشاء طلب هنا (Mocked Action).
        </p>
        <Button size="sm" className="mt-3">
          إنشاء طلب جديد
        </Button>
      </Card>

      {isLoading && (
        <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      )}

      {error && (
        <Card className="bg-red-50 border-red-200 text-red-600 p-4 flex items-center">
          <AlertCircle className="h-5 w-5 rtl:ml-2 ltr:mr-2" />
          <span>خطأ في تحميل الطلبات: {error}</span>
        </Card>
      )}

      {requests && requests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((request) => (
            <Card key={request.id}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold dark:text-white flex items-center">
                    <Users className="h-5 w-5 rtl:ml-2 ltr:mr-2 text-primary" />
                    طلب انضمام لمباراة (Mocked Booking ID: {request.booking_id.substring(0, 8)})
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    المرسل: <span className="font-semibold">لاعب ID: {request.requester_id.substring(0, 8)}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    رسالة: {request.message || 'يحتاجون إلى لاعبين إضافيين.'}
                  </p>
                </div>
                
                <Badge variant={request.status === 'accepted' ? 'success' : request.status === 'pending' ? 'warning' : 'info'}>
                    {request.status === 'accepted' ? 'تم القبول' : request.status === 'pending' ? 'بانتظار موافقتك' : 'نشط'}
                </Badge>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                <Button 
                  size="sm" 
                  isLoading={isJoining}
                  disabled={request.status !== 'pending' && isJoining}
                  onClick={() => handleJoinRequest(request.id)}
                >
                  {request.status === 'pending' ? 'إلغاء الطلب' : 'إرسال طلب انضمام'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        !isLoading && <Card className="text-center p-8 text-gray-500">لا توجد طلبات انضمام نشطة حالياً.</Card>
      )}
    </div>
  );
};

export default PlayerRequestsPage;
