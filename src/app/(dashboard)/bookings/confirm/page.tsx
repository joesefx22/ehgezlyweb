import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface BookingConfirmationPageProps {
  params: { slotId: string };
}

/**
 * صفحة تأكيد الحجز بعد عملية الدفع
 * هذه الصفحة يفترض أن يتم التوجيه إليها بعد إتمام الحجز عبر الـ API
 */
const BookingConfirmationPage: React.FC<BookingConfirmationPageProps> = ({ params }) => {
  const bookingId = params.slotId; // قد يكون هنا هو الـ booking ID الحقيقي

  // يمكن إضافة منطق لجلب بيانات الحجز هنا باستخدام bookingId

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <Card title="تم الحجز بنجاح!" className="text-center max-w-lg w-full bg-green-50 border-green-300">
        <svg className="h-20 w-20 text-green-500 mx-auto mb-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-2xl font-bold text-gray-800 mb-3">تهانينا!</p>
        <p className="text-gray-600 mb-6">
          لقد تم تأكيد حجزك لملعب كرة القدم بنجاح. تفاصيل الحجز:
        </p>
        
        <div className="text-left inline-block bg-white p-4 rounded-lg shadow-inner">
            <p className="text-sm font-semibold text-gray-700">رقم الحجز المرجعي (Mocked):</p>
            <p className="text-lg font-mono text-primary break-all">{bookingId}</p>
            <p className="text-sm font-semibold text-gray-700 mt-2">الملعب والتاريخ (Mocked):</p>
            <p className="text-lg font-mono text-primary">ملعب السعادة - 2024-10-20</p>
        </div>

        <div className="mt-8 flex justify-center space-x-4 rtl:space-x-reverse">
          <Link href="/bookings" passHref>
            <Button variant="primary">عرض حجوزاتي</Button>
          </Link>
          <Link href="/dashboard" passHref>
            <Button variant="secondary">العودة للرئيسية</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default BookingConfirmationPage;
