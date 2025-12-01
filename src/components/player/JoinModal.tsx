"use client";
import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/use-toast";

export default function JoinModal({ playId, onClose } : { playId: string, onClose?: ()=>void }) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function join() {
    setLoading(true);
    try {
      const res = await fetch(`/api/play/${playId}/join`, { method: "POST" });
      const j = await res.json();
      if (res.ok && j.ok) {
        toast.show("تم الانضمام بنجاح", "success");
        onClose?.();
      } else {
        toast.show(j.error || "خطأ أثناء الانضمام", "error");
      }
    } catch (err) { console.error(err); toast.show("خطأ","error"); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <Card className="z-[10000] p-4 w-full max-w-lg">
        <h3 className="text-lg font-semibold mb-3">تأكيد الانضمام</h3>
        <div className="mb-4">هل أنت متأكد أنك تريد الانضمام للمباراة؟</div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-white/6">إلغاء</button>
          <Button onClick={join} disabled={loading}>{loading? "جاري..." : "انضم"}</Button>
        </div>
      </Card>
    </div>
  );
}
