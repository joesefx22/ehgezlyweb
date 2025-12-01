"use client";
import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CreateCodeModal from "@/components/admin/CreateCodeModal";
import { useToast } from "@/components/ui/use-toast";

export default function AdminCodesPage() {
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const toast = useToast();

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/codes");
      const j = await res.json();
      if (res.ok && j.ok) setCodes(j.data);
      else toast.show(j.error || "خطأ", "error");
    } catch (err) { console.error(err); toast.show("خطأ","error"); }
    finally { setLoading(false); }
  }

  useEffect(()=>{ load(); }, []);

  async function toggleActive(id: string, current: boolean) {
    const res = await fetch(`/api/admin/codes/${id}`, { method: "PUT", headers: { "content-type":"application/json" }, body: JSON.stringify({ isActive: !current }) });
    const j = await res.json();
    if (res.ok && j.ok) { toast.show("تم التعديل","success"); load(); } else toast.show(j.error || "خطأ","error");
  }

  async function doDelete(id:string) {
    if (!confirm("حذف الكود نهائيًا؟")) return;
    const res = await fetch(`/api/admin/codes/${id}`, { method: "DELETE" });
    const j = await res.json();
    if (res.ok && j.ok) { toast.show("تم الحذف","success"); load(); } else toast.show(j.error || "خطأ","error");
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">إدارة الأكواد</h1>
        <div className="flex gap-2">
          <Button onClick={()=> setShowCreate(true)}>إنشاء كود جديد</Button>
          <a href="/api/admin/code-usages?export=1"><Button variant="secondary">تصدير استخدامات CSV</Button></a>
        </div>
      </div>

      {showCreate && <div className="mb-4"><Card className="p-4"><CreateCodeModal onCreated={()=>{ setShowCreate(false); load(); }} onCancel={()=>setShowCreate(false)} /></Card></div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {codes.map(c => (
          <Card key={c.id} className="p-4 flex justify-between items-center">
            <div>
              <div className="font-semibold">{c.code} <span className="text-sm text-zinc-400">({c.type})</span></div>
              <div className="text-sm text-zinc-500">استخدم: {c.usedCount}/{c.maxUsage} — ينتهي: {c.expiresAt ? new Date(c.expiresAt).toLocaleString() : "غير محدد"}</div>
              <div className="text-sm text-zinc-400 mt-1">قيمة: {c.percent ? `${c.percent}%` : (c.amount ? `${c.amount}` : "-")}</div>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={()=> toggleActive(c.id, c.isActive)}>{c.isActive ? "تعطيل" : "تفعيل"}</Button>
              <Button className="bg-rose-600" onClick={()=> doDelete(c.id)}>حذف</Button>
            </div>
          </Card>
        ))}
      </div>

      {loading && <div className="mt-4">جاري التحميل...</div>}
    </div>
  );
}

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
