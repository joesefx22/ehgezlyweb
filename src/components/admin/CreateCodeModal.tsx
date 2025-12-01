"use client";
import React from "react";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(3),
  type: z.enum(["DISCOUNT","COMPENSATION","PAYMENT"]),
  amount: z.number().optional().nullable(),
  percent: z.number().optional().nullable(),
  maxUsage: z.number().int().min(1).optional(),
  expiresAt: z.string().optional(),
  ownerId: z.string().optional()
});

type Form = z.infer<typeof schema>;

export default function CreateCodeModal({ onCreated, onCancel } : { onCreated?: ()=>void, onCancel?: ()=>void }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { maxUsage: 1, type: "DISCOUNT" as any } });

  async function onSubmit(vals: any) {
    try {
      const res = await fetch("/api/admin/codes", { method: "POST", headers: { "content-type":"application/json" }, body: JSON.stringify(vals) });
      const j = await res.json();
      if (res.ok && j.ok) { onCreated?.(); } else alert(j.error || "خطأ");
    } catch (err) { console.error(err); alert("خطأ"); }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <input {...register("code")} placeholder="KODE123" className="input-lux w-full" />
      <select {...register("type")} className="input-lux w-full">
        <option value="DISCOUNT">خصم</option>
        <option value="COMPENSATION">تعويض</option>
        <option value="PAYMENT">دفع مسبق</option>
      </select>

      <input type="number" step="0.01" {...register("amount", { valueAsNumber: true })} placeholder="مبلغ ثابت (مثلاً 50)" className="input-lux w-full" />
      <input type="number" step="0.1" {...register("percent", { valueAsNumber: true })} placeholder="نسبة (مثلاً 10)" className="input-lux w-full" />

      <input type="number" {...register("maxUsage", { valueAsNumber: true })} placeholder="الحد الأقصى للاستخدام" className="input-lux w-full" />
      <input type="datetime-local" {...register("expiresAt")} className="input-lux w-full" />

      <input {...register("ownerId")} placeholder="ownerId (اختياري)" className="input-lux w-full col-span-2" />

      <div className="col-span-2 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded bg-white/6">إلغاء</button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "جاري الإنشاء..." : "إنشاء"}</Button>
      </div>
    </form>
  );
}
