'use client';

import DashboardLayout from '@/components/dashboard/Layout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useApi } from '@/hooks/useApi';
import { CompensationCode } from '@/types';
import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Plus, Zap, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * صفحة إدارة أكواد التعويض والخصم (لـ Admin)
 */
const AdminCodesPage: React.FC = () => {
  // جلب الأكواد (Mocked endpoint)
  const { data: codes, isLoading, error, execute, setData } = useApi<CompensationCode[]>(true);
  const { isLoading: isActionLoading, execute: executeAction } = useApi<any>(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState(10);
  const [newValidUntil, setNewValidUntil] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    execute('/admin/codes'); // جلب جميع الأكواد
  }, [execute]);

  const getStatusBadge = (status: CompensationCode['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">نشط</Badge>;
      case 'used':
        return <Badge variant="warning">مستخدم</Badge>;
      case 'expired':
        return <Badge variant="danger">منتهي</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || newDiscount <= 0) return;
    
    try {
      const createdCode: CompensationCode = await executeAction('/admin/codes', 'POST', { 
        code: newCode, 
        discount_percentage: newDiscount, 
        valid_until: newValidUntil 
      });
      alert('تم إنشاء الكود بنجاح.');
      // تحديث القائمة
      setData(prev => prev ? [...prev, createdCode] : [createdCode]);
      setIsModalOpen(false);
    } catch (err) {
      alert(`فشل إنشاء الكود: ${(err as Error).message}`);
    }
  };

  const handleUpdateStatus = async (codeId: string, status: 'active' | 'used' | 'expired') => {
    if (!confirm(`هل أنت متأكد من تغيير حالة الكود إلى ${status}؟`)) return;
    try {
        await executeAction(`/admin/codes/${codeId}/status`, 'PATCH', { status });
        alert('تم تحديث حالة الكود بنجاح.');
        // تحديث حالة الكود في الـ state
        setData(prev => prev ? prev.map(c => c.id === codeId ? { ...c, status } : c) : null);
    } catch (err) {
        alert(`فشل تحديث الحالة: ${(err as Error).message}`);
    }
  };

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold dark:text-white">إدارة أكواد التعويض والخصم</h1>
          <Button onClick={() => setIsModalOpen(true)} variant="primary" className="flex items-center">
            <Plus className="h-5 w-5 rtl:ml-2 ltr:mr-2" />
            إنشاء كود جديد
          </Button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        )}

        {error && (
          <Card className="bg-red-50 border-red-200 text-red-600 p-4 flex items-center">
            <AlertCircle className="h-5 w-5 rtl:ml-2 ltr:mr-2" />
            <span>خطأ في تحميل الأكواد: {error}</span>
          </Card>
        )}

        {codes && codes.length > 0 ? (
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الكود</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الخصم (%)</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">صالح حتى</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                  {codes.map((code) => (
                    <tr key={code.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-lg font-mono text-primary dark:text-secondary">{code.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium dark:text-white">{code.discount_percentage}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-300">{code.valid_until}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(code.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2 rtl:space-x-reverse">
                        {code.status === 'active' && (
                            <Button size="sm" variant="danger" onClick={() => handleUpdateStatus(code.id, 'expired')} isLoading={isActionLoading}>
                                <XCircle className="h-4 w-4 rtl:ml-1 ltr:mr-1" /> إنهاء
                            </Button>
                        )}
                        {code.status !== 'active' && (
                            <Button size="sm" variant="success" onClick={() => handleUpdateStatus(code.id, 'active')} isLoading={isActionLoading}>
                                <CheckCircle className="h-4 w-4 rtl:ml-1 ltr:mr-1" /> تفعيل
                            </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          !isLoading && <Card className="text-center p-8 text-gray-500">لا يوجد أكواد خصم/تعويض مُسجلة.</Card>
        )}

        {/* Modal for New Code */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إنشاء كود خصم/تعويض جديد">
            <form onSubmit={handleCreateCode} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">الكود (مثال: EID2024)</label>
                    <input type="text" value={newCode} onChange={(e) => setNewCode(e.target.value)} required className="form-input" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">نسبة الخصم (%)</label>
                    <input type="number" value={newDiscount} onChange={(e) => setNewDiscount(parseInt(e.target.value))} required min="1" max="100" className="form-input" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">تاريخ الانتهاء</label>
                    <input type="date" value={newValidUntil} onChange={(e) => setNewValidUntil(e.target.value)} required className="form-input" />
                </div>
                <Button type="submit" isLoading={isActionLoading} className="w-full">
                    <Zap className="h-5 w-5 rtl:ml-2 ltr:mr-2" />
                    إنشاء الكود
                </Button>
            </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default AdminCodesPage;
