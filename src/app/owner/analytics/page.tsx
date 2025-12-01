"use client";
import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";

export default function OwnerAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const toast = useToast();
  const currentYear = new Date().getFullYear();

  async function load(year = currentYear) {
    try {
      const res = await fetch(`/api/owner/analytics?year=${year}`);
      const j = await res.json();
      if (res.ok && j.ok) setData(j.data);
      else toast.show(j.error || "خطأ في التحميل", "error");
    } catch (err) {
      console.error(err);
      toast.show("خطأ في الشبكة", "error");
    }
  }

  useEffect(()=> { load(); }, []);

  function downloadCSV() {
    if (!data) return;
    const rows = [["Month","Bookings","Earnings (EGP)"], ...data.months.map(m=>[m.month, m.bookings, (m.totalCents/100).toFixed(2)])];
    const csv = rows.map(r=>r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href=url; a.download = `earnings_${data.year}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  if (!data) return <div className="p-6">جاري التحميل...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">التقارير والإيرادات — {data.year}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-zinc-400">إجمالي الإيرادات</div>
          <div className="text-2xl font-bold">{(data.totalEarnings/100).toFixed(2)} EGP</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-zinc-400">إجمالي الحجوزات</div>
          <div className="text-2xl font-bold">{data.totalBookings}</div>
        </Card>
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-zinc-400">تصدير</div>
              <div className="text-base">CSV</div>
            </div>
            <Button onClick={downloadCSV}>تصدير</Button>
          </div>
        </Card>
      </div>

      <section className="mb-6">
        <h2 className="text-lg font-medium mb-3">الأرباح شهريًا</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {data.months.map((m:any) => (
            <Card key={m.month} className="p-4">
              <div className="text-sm text-zinc-400">شهر {m.month}</div>
              <div className="text-xl font-bold">{(m.totalCents/100).toFixed(2)} EGP</div>
              <div className="text-sm">{m.bookings} حجز</div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3">الأرباح حسب الملعب</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.perStadium.map((s:any) => (
            <Card key={s.id} className="p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold">{s.name}</div>
                <div className="text-sm text-zinc-400">{s.bookings} حجز</div>
              </div>
              <div className="text-lg font-bold">{(s.totalCents/100).toFixed(2)} EGP</div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
