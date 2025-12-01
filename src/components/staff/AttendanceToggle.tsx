"use client";
import React, { useState } from "react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/use-toast";

export default function AttendanceToggle({ bookingId, present, onUpdated } : { bookingId:number, present:boolean, onUpdated?:()=>void }) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch("/api/staff/attendance", { method: "POST", headers: { "content-type":"application/json" }, body: JSON.stringify({ bookingId, present: !present })});
      const j = await res.json();
      if (res.ok && j.ok) { toast.show("تم تحديث الحضور","success"); onUpdated?.(); }
      else toast.show(j.error || "خطأ","error");
    } catch (err) {
      console.error(err);
      toast.show("خطأ","error");
    } finally { setLoading(false); }
  }

  return <Button onClick={toggle} disabled={loading}>{present ? "وصول مُسجل" : "تسجيل وصول"}</Button>;
}
