// src/components/player/HistoryList.tsx
"use client";
import React from "react";

export default function HistoryList({ history }: any) {
  if (!history || history.length === 0) return <div className="text-zinc-400">لا توجد سجلات بعد</div>;

  return (
    <div className="space-y-3">
      {history.map((h:any) => (
        <div key={h.id} className="p-3 rounded-lg bg-zinc-900/20 flex items-center justify-between">
          <div>
            <div className="font-semibold">{h.title || h.playerName}</div>
            <div className="text-xs text-zinc-400">{new Date(h.date).toLocaleString()}</div>
            <div className="text-xs text-zinc-400 mt-1">{h.area}</div>
          </div>
          <div className="text-sm text-zinc-300">تم اللعب</div>
        </div>
      ))}
    </div>
  );
}
