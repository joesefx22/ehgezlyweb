"use client";
import React, { useEffect, useState } from "react";
import BookingCard from "@/components/player/BookingCard";
import Card from "@/components/ui/Card";
import { useToast } from "@/components/ui/use-toast";

export default function PlayerBookingsPage(){
  const [items, setItems] = useState<any[]>([]);
  const toast = useToast();

  async function load(){
    try {
      const res = await fetch("/api/player/bookings");
      const j = await res.json();
      if (res.ok && j.ok) setItems(j.data);
      else toast.show(j.error || "خطأ","error");
    } catch (err) { console.error(err); toast.show("خطأ","error"); }
  }

  useEffect(()=>{ load(); }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">حجوزاتي</h1>
      <div className="grid grid-cols-1 gap-4">
        {items.length === 0 && <Card className="p-4">لا توجد حجوزات</Card>}
        {items.map(it => <BookingCard key={it.id} booking={it} onUpdated={load} />)}
      </div>
    </div>
  );
}
