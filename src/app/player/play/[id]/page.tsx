"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import JoinModal from "@/components/player/JoinModal";
import { useToast } from "@/components/ui/use-toast";

export default function PlayDetailPage(){
  const { id } = useParams();
  const [play, setPlay] = useState<any>(null);
  const [showJoin, setShowJoin] = useState(false);
  const toast = useToast();

  async function load() {
    try {
      const res = await fetch(`/api/play/${id}`);
      const j = await res.json();
      if (res.ok && j.ok) setPlay(j.data);
      else toast.show(j.error || "خطأ","error");
    } catch (err) { console.error(err); toast.show("خطأ","error"); }
  }

  useEffect(()=>{ load(); }, [id]);

  if (!play) return <div className="p-6">جاري التحميل...</div>;

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{play.title || "طلب لعب"}</h1>
        <div className="text-sm text-zinc-500">{new Date(play.date).toLocaleString()}</div>
      </div>

      <Card className="p-4 mb-4">
        <div className="text-sm text-zinc-400">{play.description}</div>
        <div className="mt-3">المنطقة: {play.area} — المستوى: {play.level}</div>
        <div className="mt-3">اللاعبين المطلوبين: {play.playersNeeded} — مُشاركِين: {play.participants?.length || 0}</div>
      </Card>

      <Card className="p-4 mb-4">
        <h3 className="font-semibold mb-2">المشاركون</h3>
        <div className="flex gap-3 flex-wrap">
          {(play.participants || []).map((p:any)=>(
            <div key={p.id} className="p-2 bg-white/6 rounded">{p.user?.name || p.userId}</div>
          ))}
        </div>
      </Card>

      <div className="flex gap-3">
        <Button onClick={()=> setShowJoin(true)}>انضم للطلب</Button>
        <a href="/player/bookings"><Button variant="secondary">حجوزاتي</Button></a>
      </div>

      {showJoin && <JoinModal playId={play.id} onClose={()=>{ setShowJoin(false); load(); }} />}
    </div>
  );
}
