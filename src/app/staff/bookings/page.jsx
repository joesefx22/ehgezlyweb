"use client";
import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/use-toast";

export default function StaffBookingsPage(){
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  async function load(){
    setLoading(true);
    try {
      const res = await fetch("/api/staff/bookings");
      const j = await res.json();
      if (res.ok && j.ok) setBookings(j.data);
      else toast.show(j.error || "خطأ","error");
    } catch (err) { console.error(err); toast.show("خطأ","error"); }
    finally { setLoading(false); }
  }

  useEffect(()=>{ load(); }, []);

  async function update(id, payload){
    const res = await fetch(`/api/staff/bookings/${id}`, { method: "PUT", headers: {"content-type":"application/json"}, body: JSON.stringify(payload) });
    const j = await res.json();
    if (res.ok && j.ok) { toast.show("تم الحفظ","success"); load(); } else toast.show(j.error || "خطأ","error");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">إدارة الحجوزات</h1>
      {loading && <div>جاري التحميل...</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bookings.map(b => (
          <Card key={b.id} className="p-4">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{b.stadium?.name}</div>
                <div className="text-sm text-zinc-500">{new Date(b.startAt).toLocaleString()}</div>
                <div className="text-sm">اللاعب: {b.user?.name}</div>
                <div className="mt-2">حالة: {b.status}</div>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={()=> update(b.id, { status: "CONFIRMED" })}>تأكيد</Button>
                <Button onClick={()=> update(b.id, { status: "CANCELLED" })} className="bg-rose-600">إلغاء</Button>
                <Button onClick={()=> update(b.id, { note: (b.note||"") + " | سجل الموظف" })} variant="secondary">سجل ملاحظة</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
