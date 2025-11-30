"use client";
import React from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function FieldCard({ field, onDeleted, onUpdated }: { field:any, onDeleted?:()=>void, onUpdated?:()=>void }) {

  const doDelete = async () => {
    if (!confirm("هل تريد حذف الملعب؟")) return;
    const res = await fetch(`/api/owner/fields/${field.id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok && data.ok) {
      onDeleted?.();
      alert("تم الحذف");
    } else {
      alert(data.error || "خطأ");
    }
  };

  return (
    <Card className="p-4 flex flex-col justify-between">
      <div>
        <div className="font-semibold text-lg">{field.title}</div>
        <div className="text-sm text-zinc-400">{field.address} {field.city ? `— ${field.city}` : ""}</div>
        <div className="mt-2">السعر: {field.priceCents ? (field.priceCents/100) + " EGP" : "غير محدد"}</div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button onClick={() => {
          // TODO: open edit modal
          alert("Edit modal not implemented yet");
        }}>تعديل</Button>
        <Button onClick={doDelete} className="bg-rose-600">حذف</Button>
      </div>
    </Card>
  );
}
