"use client";
import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SearchBar from "@/components/ui/SearchBar";
import { useToast } from "@/components/ui/use-toast";

export default function AdminCodeReportsPage() {
  const [usages, setUsages] = useState<any[]>([]);
  const [codeFilter, setCodeFilter] = useState("");
  const toast = useToast();

  async function load() {
    try {
      const q = codeFilter ? `?codeId=${encodeURIComponent(codeFilter)}` : "";
      const res = await fetch(`/api/admin/code-usages${q}`);
      const j = await res.json();
      if (res.ok && j.ok) setUsages(j.data);
      else toast.show(j.error || "خطأ","error");
    } catch (err) { console.error(err); toast.show("خطأ", "error"); }
  }

  useEffect(()=>{ load(); }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">تقارير استخدام الأكواد</h1>
        <div className="flex gap-2">
          <a href="/api/admin/code-usages?export=1"><Button variant="secondary">تصدير CSV</Button></a>
        </div>
      </div>

      <div className="mb-4 flex gap-3">
        <SearchBar value={codeFilter} onChange={setCodeFilter} placeholder="فلتر بالكود أو ID" />
        <Button onClick={()=> load()}>تطبيق فلتر</Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {usages.length === 0 && <Card className="p-4">لا توجد استخدامات</Card>}
        {usages.map(u => (
          <Card key={u.id} className="p-3 flex justify-between items-center">
            <div>
              <div className="font-semibold">{u.code?.code} <span className="text-sm text-zinc-400">({u.code?.type})</span></div>
              <div className="text-sm text-zinc-500">by: {u.userId} — booking: {u.bookingId ?? "-"}</div>
              <div className="text-sm text-zinc-400">{new Date(u.usedAt).toLocaleString()}</div>
            </div>
            <div className="text-sm font-medium">{u.code?.percent ? `${u.code.percent}%` : (u.code?.amount ?? "-")}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
