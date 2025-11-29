// src/components/play/MatchCard.tsx
"use client";
import React, { useState } from "react";

export default function MatchCard({ match, onJoined }: any) {
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!confirm("هل متأكد إنك عايز تنضم للطلب؟")) return;
    setJoining(true);
    try {
      const res = await fetch("/api/matches/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ matchId: match.id }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        alert("انضممت بنجاح");
        onJoined?.();
      } else {
        alert(data.error || "حدث خطأ");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ");
    } finally {
      setJoining(false);
    }
  };

  const playersCount = match.participants?.length || 0;

  return (
    <div className="bg-zinc-900/30 rounded-xl p-4 border border-neutral-800 shadow-md mb-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-lg font-semibold">{match.title}</h4>
          <div className="text-sm text-zinc-300 mt-1">{match.description}</div>
          <div className="text-xs text-zinc-400 mt-2">المكان: {match.location} — التاريخ: {new Date(match.date).toLocaleString()}</div>
          <div className="text-xs text-zinc-400">الوقت: {match.timeSlot || "لم يحدد"}</div>
        </div>

        <div className="flex flex-col items-end">
          <div className="text-sm font-medium">{playersCount}/{match.playersNeeded}</div>
          <div className="text-xs text-zinc-400">منشئ الطلب: {match.creator?.name || "لا يوجد اسم"}</div>
          <div className="mt-3">
            {match.status === "OPEN" ? (
              <button onClick={handleJoin} disabled={joining} className="bg-amber-500 hover:bg-amber-400 px-3 py-2 rounded-md">
                {joining ? "جارٍ الانضمام..." : "انضم"}
              </button>
            ) : (
              <div className="px-3 py-2 rounded-md bg-zinc-700 text-xs">مغلقة</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
