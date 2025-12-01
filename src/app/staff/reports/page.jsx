"use client";
import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/use-toast";

export default function StaffReportsPage(){
  const [report, setReport] = useState(null);
  const toast = useToast();

  async function load(){
    try {
      const res = await fetch("/api/staff/reports/daily");
      const j = await res.json();
      if (res.ok && j.ok) setReport(j.data);
      else toast.show(j.error || "خطأ","error");
    } catch (err) { console.error(err); toast.show("خطأ","error"); }
  }

  useEffect(()=>{ load(); }, []);

  if (!report) return <div className="p-6">جاري التحميل...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">تقرير اليوم</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4"><div className="text-sm">حجوزات اليوم</div><div className="text-xl font-bold">{report.bookings}</div></Card>
        <Card className="p-4"><div className="text-sm">حضور</div><div className="text-xl font-bold">{report.present}</div></Card>
        <Card className="p-4"><div className="text-sm">غائبون</div><div className="text-xl font-bold">{report.absent}</div></Card>
      </div>

      <section>
        <h2 className="text-lg font-medium mb-3">تفاصيل</h2>
        {report.details.map(d => (
          <Card key={d.stadiumId} className="p-3 mb-2 flex justify-between">
            <div>
              <div className="font-semibold">{d.stadiumName}</div>
              <div className="text-sm text-zinc-400">{d.bookings} حجز — حضور {d.present}</div>
            </div>
            <div className="text-lg font-bold">{(d.revenue/100).toFixed(2)} EGP</div>
          </Card>
        ))}
      </section>
    </div>
  );
}
