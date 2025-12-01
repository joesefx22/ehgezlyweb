"use client";
import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/use-toast";

export default function PlayerNotificationsPage(){
  const [notes, setNotes] = useState<any[]>([]);
  const toast = useToast();

  async function load(){
    const res = await fetch("/api/player/notifications");
    const j = await res.json();
    if (res.ok && j.ok) setNotes(j.data);
    else toast.show(j.error || "خطأ","error");
  }

  useEffect(()=>{ load(); }, []);

  async function markRead(id?: string) {
    const res = await fetch("/api/player/notifications", { method: "POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ action: id ? "mark-one" : "mark-all", id }) });
    const j = await res.json();
    if (res.ok && j.ok) load();
    else toast.show(j.error || "خطأ","error");
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">الإشعارات</h1>
        <div className="flex gap-2">
          <Button onClick={()=>markRead()}>تمييز الكل كمقروء</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {notes.length === 0 && <Card className="p-4">لا توجد إشعارات</Card>}
        {notes.map(n => (
          <Card key={n.id} className="p-3 flex justify-between">
            <div>
              <div className="font-semibold">{n.title}</div>
              <div className="text-sm text-zinc-400">{n.message}</div>
            </div>
            <div className="flex flex-col gap-2">
              {!n.read && <Button onClick={()=>markRead(n.id)}>تمييز كمقروء</Button>}
              <div className="text-sm text-zinc-400">{new Date(n.createdAt).toLocaleString()}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
