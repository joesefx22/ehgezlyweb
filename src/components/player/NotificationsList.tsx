// src/components/player/NotificationsList.tsx
"use client";
import React from "react";

export default function NotificationsList({ notifications, onRefresh }: any) {
  const markAll = async () => {
    await fetch("/api/player/notifications", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "mark-all" }) });
    onRefresh?.();
  };

  return (
    <div className="lux-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold">الإشعارات</div>
        <button onClick={markAll} className="text-xs text-zinc-400">تمييز الكل كمقروء</button>
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? <div className="text-zinc-400">لا إشعارات جديدة</div> :
          notifications.map((n:any)=>(<div key={n.id} className={`p-3 rounded-lg ${n.read ? "bg-zinc-900/20" : "bg-amber-900/10 border border-amber-400/20"}`}>
            <div className="text-sm font-semibold">{n.title}</div>
            <div className="text-xs text-zinc-400">{n.body}</div>
          </div>))
        }
      </div>
    </div>
  );
}
