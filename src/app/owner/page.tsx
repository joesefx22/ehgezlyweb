'use client';

import DashboardLayout from '@/components/dashboard/Layout';
import Stats from '@/components/dashboard/Stats';
import Card from '@/components/ui/Card';
import { useApi } from '@/hooks/useApi';
import { DashboardStats, UserRole } from '@/types';
import { useEffect } from 'react';
import { Loader2, AlertCircle, BarChart3, Clock, SoccerBall } from 'lucide-react';

const MockStats: DashboardStats = {
  total_bookings: 45,
  total_revenue: 12500,
  new_users: 2,
  available_stadiums: 3,
  pending_managers: 0,
};

/**
 * لوحة تحكم مالك/مدير الملعب
 */
const OwnerDashboardPage: React.FC = () => {
  const { data: stats, isLoading, error, execute } = useApi<DashboardStats>(true);

  useEffect(() => {
    execute('/owner/dashboard/stats'); // جلب إحصائيات لوحة المالك
  }, [execute]);

  return (
    <DashboardLayout allowedRoles={['owner', 'manager']}>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold dark:text-white">لوحة تحكم الملعب</h1>
        
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

        {/* Quick Actions & Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="الحجوزات القادمة (Mocked)">
            <ul className="space-y-3">
              <li className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                <span className="flex items-center"><Clock className="h-4 w-4 rtl:ml-2 ltr:mr-2 text-primary" /> 18:00 اليوم</span>
                <span className="font-semibold">فريق الأمل</span>
              </li>
              <li className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                <span className="flex items-center"><Clock className="h-4 w-4 rtl:ml-2 ltr:mr-2 text-primary" /> 20:00 غداً</span>
                <span className="font-semibold">فريق النجوم</span>
              </li>
            </ul>
          </Card>
          <Card title="ملخص الملاعب">
            <p className="text-3xl font-bold text-primary dark:text-secondary">
                <SoccerBall className="h-6 w-6 inline-block rtl:ml-2 ltr:mr-2" />
                {MockStats.available_stadiums} ملاعب مُدارة
            </p>
            <p className="text-sm text-gray-500 mt-2">انقر على ملاعبي لإدارة الجداول.</p>
          </Card>
          <Card title="إشعارات النظام (Mocked)">
            <div className="p-3 bg-yellow-100 rounded-lg text-yellow-800 text-sm">
                <AlertCircle className="h-4 w-4 inline-block rtl:ml-2 ltr:mr-2" />
                تذكر أن تنشئ مواعيد للأسابيع القادمة!
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerDashboardPage;

// src/app/owner/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FieldForm from "@/components/owner/FieldForm";
import FieldCard from "@/components/owner/FieldCard";
import { useToast } from "@/components/ui/toast";

type Field = any;
type Booking = any;

export default function OwnerPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const toast = useToast();

  async function loadFields() {
    const res = await fetch("/api/owner/fields");
    const data = await res.json();
    if (res.ok && data.ok) setFields(data.data);
    else toast.show(data.error || "خطأ في تحميل الملاعب", "error");
  }

  async function loadBookings() {
    const res = await fetch("/api/owner/bookings");
    const data = await res.json();
    if (res.ok && data.ok) setBookings(data.data);
    else toast.show(data.error || "خطأ في تحميل الحجوزات", "error");
  }

  useEffect(() => { loadFields(); loadBookings(); }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">لوحة التحكم - صاحب الملعب</h1>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowCreate(true)}>إضافة ملعب جديد</Button>
        </div>
      </div>

      {showCreate && (
        <div className="mb-6">
          <Card className="p-4">
            <FieldForm
              onSaved={() => { setShowCreate(false); loadFields(); toast.show("تم إنشاء الملعب", "success"); }}
              onCancel={() => setShowCreate(false)}
            />
          </Card>
        </div>
      )}

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-3">ملاعبك</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.length === 0 ? <div className="text-zinc-400">لا توجد ملاعب بعد</div> : fields.map(f => (
            <FieldCard key={f.id} field={f} onDeleted={() => loadFields()} onUpdated={() => loadFields()} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-medium mb-3">الحجوزات الأخيرة</h2>
        <div className="space-y-3">
          {bookings.length === 0 && <div className="text-zinc-400">لا توجد حجوزات</div>}
          {bookings.map(b => (
            <Card key={b.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-semibold">{b.field?.title}</div>
                <div className="text-sm text-zinc-400">{new Date(b.startAt).toLocaleString()} — {b.user?.name || b.userId}</div>
                <div className="text-sm mt-1">حالة: {b.status}</div>
              </div>
              <div className="flex gap-2">
                {b.status === "PENDING" && <Button onClick={async ()=>{
                  const res = await fetch(`/api/owner/bookings/${b.id}/confirm`, { method: "POST" });
                  const d = await res.json();
                  if (res.ok && d.ok) { toast.show("تم تأكيد الحجز", "success"); loadBookings(); }
                  else toast.show(d.error || "خطأ", "error");
                }}>تأكيد</Button>}
                {b.status !== "CANCELLED" && <Button onClick={async ()=>{
                  const res = await fetch(`/api/owner/bookings/${b.id}/cancel`, { method: "POST" });
                  const d = await res.json();
                  if (res.ok && d.ok) { toast.show("تم إلغاء الحجز", "success"); loadBookings(); }
                  else toast.show(d.error || "خطأ", "error");
                }}>إلغاء</Button>}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
// src/app/owner/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FieldForm from "@/components/owner/FieldForm";
import FieldCard from "@/components/owner/FieldCard";
import { useToast } from "@/components/ui/toast";

export default function OwnerPage() {
  const [fields, setFields] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const toast = useToast();

  async function loadFields() {
    const res = await fetch("/api/owner/fields");
    const data = await res.json();
    if (res.ok && data.ok) setFields(data.data);
    else toast.show(data.error || "خطأ في تحميل الملاعب", "error");
  }

  async function loadBookings() {
    const res = await fetch("/api/owner/bookings");
    const data = await res.json();
    if (res.ok && data.ok) setBookings(data.data);
    else toast.show(data.error || "خطأ في تحميل الحجوزات", "error");
  }

  useEffect(() => { loadFields(); loadBookings(); }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">لوحة التحكم - صاحب الملعب</h1>
        <Button onClick={() => setShowCreate(true)}>إضافة ملعب جديد</Button>
      </div>

      {showCreate && (
        <div className="mb-6">
          <Card className="p-4">
            <FieldForm
              onSaved={() => { setShowCreate(false); loadFields(); toast.show("تم إنشاء الملعب", "success"); }}
              onCancel={() => setShowCreate(false)}
            />
          </Card>
        </div>
      )}

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-3">ملاعبك</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.length === 0 ? <div className="text-zinc-400">لا توجد ملاعب بعد</div> : fields.map(f => (
            <FieldCard key={f.id} field={f} onDeleted={() => loadFields()} onUpdated={() => loadFields()} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-medium mb-3">الحجوزات الأخيرة</h2>
        <div className="space-y-3">
          {bookings.length === 0 && <div className="text-zinc-400">لا توجد حجوزات</div>}
          {bookings.map(b => (
            <Card key={b.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-semibold">{b.field?.title}</div>
                <div className="text-sm text-zinc-400">{new Date(b.startAt).toLocaleString()} — {b.user?.name || b.userId}</div>
                <div className="text-sm mt-1">حالة: {b.status}</div>
              </div>
              <div className="flex gap-2">
                {b.status === "PENDING" && <Button onClick={async ()=>{
                  const res = await fetch(`/api/owner/bookings/${b.id}/confirm`, { method: "POST" });
                  const d = await res.json();
                  if (res.ok && d.ok) { toast.show("تم تأكيد الحجز", "success"); loadBookings(); }
                  else toast.show(d.error || "خطأ", "error");
                }}>تأكيد</Button>}
                {b.status !== "CANCELLED" && <Button onClick={async ()=>{
                  const res = await fetch(`/api/owner/bookings/${b.id}/cancel`, { method: "POST" });
                  const d = await res.json();
                  if (res.ok && d.ok) { toast.show("تم إلغاء الحجز", "success"); loadBookings(); }
                  else toast.show(d.error || "خطأ", "error");
                }}>إلغاء</Button>}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
