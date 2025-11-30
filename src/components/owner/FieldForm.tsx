"use client";
import React from "react";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function FieldForm({ onSaved, onCancel }: { onSaved?: ()=>void, onCancel?: ()=>void }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<any>({
    defaultValues: { title: "", description: "", address: "", city: "", priceCents: 0, images: [] }
  });

  const onSubmit = async (vals:any) => {
    try {
      const payload = {
        title: vals.title,
        description: vals.description,
        address: vals.address,
        city: vals.city,
        priceCents: Number(vals.priceCents) || 0,
        images: [] // for now images empty — you can integrate uploader later
      };
      const res = await fetch("/api/owner/fields", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok && data.ok) {
        onSaved?.();
      } else {
        alert(data.error || "خطأ");
      }
    } catch (err) {
      console.error(err);
      alert("خطأ في الشبكة");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="text-sm">عنوان الملعب</label>
        <input {...register("title")} className="input-lux w-full" />
      </div>
      <div>
        <label className="text-sm">الوصف</label>
        <textarea {...register("description")} className="input-lux w-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm">العنوان/المنطقة</label>
          <input {...register("address")} className="input-lux w-full" />
        </div>
        <div>
          <label className="text-sm">المدينة</label>
          <input {...register("city")} className="input-lux w-full" />
        </div>
      </div>
      <div>
        <label className="text-sm">سعر بالساعة (جنيه)</label>
        <input type="number" {...register("priceCents")} className="input-lux w-full" />
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => onCancel?.()} className="px-4 py-2 rounded-lg bg-white/6">إلغاء</button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "جاري..." : "حفظ"}</Button>
      </div>
    </form>
  );
}
