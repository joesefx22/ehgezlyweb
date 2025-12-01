"use client";
import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function BookingCard({ booking, onUpdated } : { booking:any, onUpdated?:()=>void }) {
  async function cancel() {
    if (!confirm("هل تريد إلغاء الحجز؟")) return;
    const res = await fetch(`/api/player/bookings/${booking.id}/cancel`, { method: "POST" });
    const j = await res.json();
    if (res.ok && j.ok) onUpdated?.();
    else alert(j.error || "خطأ");
  }

  async function pay() {
    // call payments/create endpoint
    const res = await fetch(`/api/payments/create`, { method: "POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ bookingId: booking.id })});
    const j = await res.json();
    if (res.ok && j.ok && j.data?.paymentUrl) {
      window.location.href = j.data.paymentUrl;
    } else {
      alert(j.error || "خطأ في الدفع");
    }
  }

  return (
    <Card className="p-4 flex justify-between items-center">
      <div>
        <div className="font-semibold">{booking.stadium?.name || booking.title || "حجز"}</div>
        <div className="text-sm text-zinc-500">{booking.slot ? `${booking.slot.startTime} - ${booking.slot.endTime}` : (booking.date || "")}</div>
        <div className="text-sm">حالة: {booking.status} — الدفع: {booking.paymentStatus || booking.payment}</div>
      </div>
      <div className="flex gap-2">
        {booking.paymentStatus !== "PAID" && <Button onClick={pay}>ادفع</Button>}
        <Button className="bg-rose-600" onClick={cancel}>إلغاء</Button>
      </div>
    </Card>
  );
}
