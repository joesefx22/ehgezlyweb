"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import StaffCard from "@/components/owner/StaffCard";
import StaffForm from "@/components/owner/StaffForm";

export default function StaffManagerPage() {
  const { id } = useParams();
  const toast = useToast();

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  async function loadStaff() {
    setLoading(true);
    try {
      const res = await fetch(`/api/stadium/${id}/staff`);
      const data = await res.json();
      if (res.ok && data.ok) setStaff(data.data);
      else toast.toast({ title: "Error", description: data.error || "Failed to load staff", variant: "destructive" });
    } catch (err) {
      console.error(err);
      toast.toast({ title: "Error", description: "Network error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadStaff(); }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">إدارة الموظفين</h1>
        <Button onClick={() => setShowCreate(v => !v)}>{showCreate ? "إلغاء" : "إضافة موظف"}</Button>
      </div>

      {showCreate && <div className="mb-4"><Card className="p-4"><StaffForm onSaved={() => { setShowCreate(false); loadStaff(); }} /></Card></div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staff.length === 0 && <div className="text-zinc-400">لا يوجد موظفين بعد</div>}
        {staff.map(s => <StaffCard key={s.id} staff={s} onRemoved={() => loadStaff()} onUpdated={() => loadStaff()} />)}
      </div>
      {loading && <div className="mt-4">جارٍ التحميل...</div>}
    </div>
  );
}
