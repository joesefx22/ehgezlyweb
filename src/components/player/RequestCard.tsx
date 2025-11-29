// src/components/player/RequestCard.tsx
"use client";
import React, { useState } from "react";
import Button from "@/components/ui/Button";

export default function RequestCard({ request, joined, onAction }: any) {
  const [busy, setBusy] = useState(false);

  const doCancel = async () => {
    if (!confirm("هل أنت متأكد من إلغاء الطلب؟")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/player/request/cancel", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "cancelRequest", requestId: request.id }),
      });
      const data = await res.json();
      if (res.ok && data.ok) alert("تم الإلغاء");
      else alert(data.error || "حدث خطأ");
    } catch (err) { console.error(err); alert("حدث خطأ"); }
    finally { setBusy(false); onAction?.(); }
  };

  const doLeave = async () => {
    if (!confirm("هل تريد مغادرة هذا الطلب؟")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/player/request/cancel", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "leave", matchId: request.id }),
      });
      const data = await res.json();
      if (res.ok && data.ok) alert("تم الخروج");
      else alert(data.error || "حدث خطأ");
    } catch (err) { console.error(err); alert("حدث خطأ"); }
    finally { setBusy(false); onAction?.(); }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/30 mb-3 border border-white/6">
      <div>
        <div className="text-lg font-semibold">{request.title || request.playerName || "طلب لعب"}</div>
        <div className="text-sm text-zinc-400">{request.area} • {new Date(request.date).toLocaleString()}</div>
        <div className="text-xs text-zinc-400 mt-2">{request.description}</div>
      </div>

      <div className="flex flex-col items-end gap-3">
        <div className="text-sm text-zinc-300">{request.participants?.length || 0}/{request.needed}</div>
        <div className="flex items-center gap-2">
          {request.userId === undefined || request.userId === null ? null : (
            <>
              {request.userId && request.userId === (joined?.userId || request.userId) ? null : null}
            </>
          )}
          {/* if creator -> cancel */}
          {request.userId === request.userId ? (
            <Button onClick={doCancel} className="px-3 py-2 bg-rose-600">إلغاء</Button>
          ) : (
            <Button onClick={doLeave} className="px-3 py-2 bg-amber-500">مغادرة</Button>
          )}
        </div>
      </div>
    </div>
  );
}
