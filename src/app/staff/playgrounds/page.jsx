"use client";
import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/use-toast";

export default function StaffPlaygroundsPage(){
  const [playgrounds, setPlaygrounds] = useState([]);
  const toast = useToast();

  async function load(){
    try {
      const res = await fetch("/api/staff/playgrounds");
      const j = await res.json();
      if (res.ok && j.ok) setPlaygrounds(j.data);
      else toast.show(j.error || "خطأ","error");
    } catch (err) { console.error(err); toast.show("خطأ","error"); }
  }

  useEffect(()=>{ load(); }, []);

  async function update(id, payload){
    const res = await fetch(`/api/staff/playgrounds/${id}`, { method: "PUT", headers: {"content-type":"application/json"}, body: JSON.stringify(payload) });
    const j = await res.json();
    if (res.ok && j.ok) { toast.show("تم الحفظ","success"); load(); } else toast.show(j.error || "خطأ","error");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">الملاعب المسندة إليك</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {playgrounds.map(p => (
          <Card key={p.id} className="p-4 flex flex-col justify-between">
            <div>
              <div className="font-semibold text-lg">{p.name}</div>
              <div className="text-sm text-zinc-400">{p.address}</div>
              <div className="mt-2">الحالة: {p.state || "UNKNOWN"}</div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button onClick={()=> update(p.id, { state: "READY" })}>جاهز</Button>
              <Button onClick={()=> update(p.id, { state: "BUSY" })} className="bg-amber-500">مشغول</Button>
              <Button onClick={()=> update(p.id, { state: "MAINTENANCE" })} className="bg-rose-600">صيانة</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
