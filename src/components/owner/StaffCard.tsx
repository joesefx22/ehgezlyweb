"use client";
import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function StaffCard({ staff, onRemoved, onUpdated }: { staff:any, onRemoved?:()=>void, onUpdated?:()=>void }) {

  async function doRemove() {
    if (!confirm("حذف هذا الموظف؟")) return;
    const stadiumId = staff.stadiumId;
    const res = await fetch(`/api/stadium/${stadiumId}/staff/${staff.id}`, { method: "DELETE" });
    const d = await res.json();
    if (res.ok && d.ok) { onRemoved?.(); alert("تم الحذف"); } else alert(d.error || "خطأ");
  }

  async function toggleActive() {
    const stadiumId = staff.stadiumId;
    const res = await fetch(`/api/stadium/${stadiumId}/staff/${staff.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ active: !staff.active })
    });
    const d = await res.json();
    if (res.ok && d.ok) { onUpdated?.(); } else alert(d.error || "خطأ");
  }

  return (
    <Card className="p-4 flex flex-col justify-between">
      <div>
        <div className="font-semibold text-lg">{staff.user?.name || staff.userId}</div>
        <div className="text-sm text-zinc-400">Role: {staff.role}</div>
        <div className="text-sm text-zinc-400">Active: {staff.active ? "نعم" : "لا"}</div>
      </div>

      <div className="mt-3 flex gap-2">
        <Button onClick={toggleActive}>{staff.active ? "تعطيل" : "تفعيل"}</Button>
        <Button className="bg-rose-600" onClick={doRemove}>حذف</Button>
      </div>
    </Card>
  );
}
