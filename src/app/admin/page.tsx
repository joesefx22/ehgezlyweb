'use client';

import DashboardLayout from '@/components/dashboard/Layout';
import Stats from '@/components/dashboard/Stats';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useApi } from '@/hooks/useApi';
import { DashboardStats, User } from '@/types';
import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, BarChart3, UserCheck, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const MockStats: DashboardStats = {
  total_bookings: 1200,
  total_revenue: 95000,
  new_users: 50,
  available_stadiums: 25,
  pending_managers: 5,
};

/**
 * لوحة تحكم الأدمن الرئيسي
 */
const AdminDashboardPage: React.FC = () => {
  const { data: stats, isLoading, error, execute } = useApi<DashboardStats>(true);
  const { data: pendingManagers, isLoading: isManagersLoading, execute: fetchPendingManagers, setData: setPendingManagers } = useApi<User[]>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    execute('/admin/dashboard/stats'); // جلب الإحصائيات العامة
    fetchPendingManagers('/admin/users/pending-managers'); // جلب المديرين بانتظار الموافقة
  }, [execute, fetchPendingManagers]);

  const handleApproveManager = async (managerId: string) => {
    setActionLoading(managerId);
    try {
      await execute('/admin/users/approve-manager', 'PATCH', { userId: managerId });
      alert('تمت الموافقة على المدير بنجاح.');
      // إزالة المدير من القائمة
      setPendingManagers(prev => prev ? prev.filter(u => u.id !== managerId) : null);
      execute('/admin/dashboard/stats'); // تحديث الإحصائيات
    } catch (err) {
      alert(`فشل الموافقة: ${(err as Error).message}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold dark:text-white">نظرة عامة على النظام</h1>
        
        {/* Statistics Section */}
        {isLoading && <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
        
        {error && (
            <Card className="bg-red-50 border-red-200 text-red-600 p-4 flex items-center">
              <AlertCircle className="h-5 w-5 rtl:ml-2 ltr:mr-2" />
              <span>خطأ في تحميل الإحصائيات: {error}</span>
            </Card>
          )}

        {!isLoading && (
            <Stats stats={stats || MockStats} />
        )}

        {/* Pending Managers */}
        <Card title="المديرين والمالكين بانتظار الموافقة">
            {isManagersLoading && <div className="text-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
            
            {pendingManagers?.length === 0 && !isManagersLoading && (
                <p className="text-green-600 font-semibold flex items-center">
                    <CheckCircle className="h-5 w-5 rtl:ml-2 ltr:mr-2" />
                    لا يوجد حالياً أي طلبات معلقة للموافقة.
                </p>
            )}

            {pendingManagers && pendingManagers.length > 0 && (
                <ul className="space-y-3">
                    {pendingManagers.map(manager => (
                        <li key={manager.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-card/50 rounded-lg">
                            <div>
                                <p className="font-semibold dark:text-white">{manager.name}</p>
                                <p className="text-sm text-gray-500">{manager.email} | الدور: {manager.role}</p>
                            </div>
                            <Button 
                                variant="primary" 
                                size="sm" 
                                isLoading={actionLoading === manager.id}
                                onClick={() => handleApproveManager(manager.id)}
                                className="flex items-center"
                            >
                                <UserCheck className="h-4 w-4 rtl:ml-1 ltr:mr-1" /> موافقة
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
            
            <Button 
                variant="ghost" 
                className="mt-4 w-full"
                onClick={() => router.push('/admin/users')}
            >
                عرض جميع المستخدمين
            </Button>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboardPage;

"use client";
import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const toast = useToast();

  async function load() {
    try {
      const res = await fetch("/api/admin/stats");
      const j = await res.json();
      if (res.ok && j.ok) setStats(j.data);
      else toast.show(j.error || "خطأ","error");

      const ru = await fetch("/api/admin/users");
      const uj = await ru.json();
      if (ru.ok && uj.ok) setUsers(uj.data);
    } catch (err) {
      console.error(err);
      toast.show("خطأ","error");
    }
  }

  useEffect(()=>{ load(); }, []);

  if (!stats) return <div className="p-6">جاري التحميل...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">لوحة الأدمن</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4"><div className="text-sm">المستخدمين</div><div className="text-xl font-bold">{stats.usersCount}</div></Card>
        <Card className="p-4"><div className="text-sm">الملاعب</div><div className="text-xl font-bold">{stats.stadiumsCount}</div></Card>
        <Card className="p-4"><div className="text-sm">الحجوزات</div><div className="text-xl font-bold">{stats.bookingsCount}</div></Card>
        <Card className="p-4"><div className="text-sm">الإيرادات</div><div className="text-xl font-bold">{(stats.income/100).toFixed(2)} EGP</div></Card>
      </div>

      <section>
        <h2 className="text-lg font-medium mb-3">المستخدمين</h2>
        <div className="space-y-3">
          {users.map(u => (
            <Card key={u.id} className="p-3 flex justify-between items-center">
              <div>
                <div className="font-semibold">{u.name || u.email}</div>
                <div className="text-sm text-zinc-400">{u.role} {u.banned ? "— BANNED" : ""}</div>
              </div>
              <div className="flex gap-2">
                <Button onClick={async ()=> {
                  const res = await fetch(`/api/admin/users/${u.id}`, { method: "PUT", headers: { "content-type":"application/json" }, body: JSON.stringify({ banned: !u.banned }) });
                  const j = await res.json();
                  if (res.ok && j.ok) { toast.show("تم التعديل","success"); load(); }
                  else toast.show(j.error || "خطأ","error");
                }}>{u.banned ? "رفع الحظر" : "حظر"}</Button>

                <Button className="bg-rose-600" onClick={async ()=> {
                  if(!confirm("حذف المستخدم نهائي؟")) return;
                  const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
                  const j = await res.json();
                  if (res.ok && j.ok) { toast.show("تم الحذف","success"); load(); }
                  else toast.show(j.error || "خطأ","error");
                }}>حذف</Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
