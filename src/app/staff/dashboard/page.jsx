"use client";
import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/use-toast";
import AttendanceToggle from "@/components/staff/AttendanceToggle";

export default function StaffTodayPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/staff/today");
      const j = await res.json();
      if (res.ok && j.ok) setItems(j.data);
      else toast.show(j.error || "خطأ في تحميل الجدول", "error");
    } catch (err) {
      console.error(err);
      toast.show("خطأ في الشبكة", "error");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">جدول اليوم</h1>

      {loading && <div>جاري التحميل...</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.length === 0 && !loading && <div className="text-zinc-400">لا يوجد حجوزات لليوم</div>}
        {items.map(b => (
          <Card key={b.id} className="p-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between">
                <div className="font-semibold text-lg">{b.stadium?.name || "ملعب"}</div>
                <div className="text-sm text-zinc-500">{new Date(b.startAt).toLocaleTimeString()} - {new Date(b.endAt).toLocaleTimeString()}</div>
              </div>
              <div className="text-sm text-zinc-400 mt-2">اللاعب: {b.user?.name || b.userId} — هاتف: {b.user?.phone || "-"}</div>
              <div className="text-sm mt-2">حالة الحجز: <strong>{b.status}</strong></div>
              {b.note && <div className="text-sm text-zinc-500 mt-2">ملاحظة: {b.note}</div>}
            </div>

            <div className="mt-3 flex gap-2">
              <Button onClick={async ()=>{
                // mark as arrived (attendance)
                const res = await fetch("/api/staff/attendance", { method: "POST", headers: { "content-type":"application/json" }, body: JSON.stringify({ bookingId: b.id, present: true })});
                const j = await res.json();
                if (res.ok && j.ok) { toast.show("تم تسجيل الحضور", "success"); load(); }
                else toast.show(j.error || "خطأ", "error");
              }}>تسجيل حضور</Button>

              <Button onClick={async ()=>{
                const res = await fetch(`/api/staff/bookings/${b.id}`, { method: "PUT", headers: { "content-type":"application/json" }, body: JSON.stringify({ status: "CANCELLED" })});
                const j = await res.json();
                if (res.ok && j.ok) { toast.show("تم إلغاء الحجز", "success"); load(); }
                else toast.show(j.error || "خطأ", "error");
              }} className="bg-rose-600">إلغاء الحجز</Button>

              <AttendanceToggle bookingId={b.id} present={b.present ?? false} onUpdated={load} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
