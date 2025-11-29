// src/components/player/CreateRequestModal.tsx
"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useToast } from "@/components/ui/toast";

const schema = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().max(1000).optional(),
  area: z.string().min(2).max(200),
  level: z.enum(["beginner","intermediate","advanced","pro"]),
  date: z.string().min(1),
  playersNeeded: z.number().min(1).max(20),
});

type FormData = z.infer<typeof schema>;

export default function CreateRequestModal({ onCreated, onClose }: { onCreated?: () => void, onClose?: () => void }) {
  const toast = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { level: "intermediate", playersNeeded: 1 },
  });

  const onSubmit = async (vals: any) => {
    try {
      const payload = {
        ...vals,
        playersNeeded: Number(vals.playersNeeded)
      };
      const res = await fetch("/api/player/create-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast.show("تم إنشاء طلب اللعب بنجاح", "success");
        onCreated?.();
        onClose?.();
      } else {
        console.error(data);
        toast.show(data.error || "حدث خطأ أثناء إنشاء الطلب", "error");
      }
    } catch (err) {
      console.error(err);
      toast.show("خطأ في الشبكة", "error");
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="text-sm text-zinc-300">عنوان (اختياري)</label>
          <input {...register("title")} className="input-lux w-full" placeholder="مثال: محتاج 2 لاعبين مساء السبت" />
          {errors.title && <div className="text-red-400 text-xs mt-1">{String(errors.title?.message)}</div>}
        </div>

        <div>
          <label className="text-sm text-zinc-300">الوصف (اختياري)</label>
          <textarea {...register("description")} className="input-lux w-full" rows={3} />
          {errors.description && <div className="text-red-400 text-xs mt-1">{String(errors.description?.message)}</div>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-zinc-300">المنطقة</label>
            <input {...register("area")} className="input-lux w-full" />
            {errors.area && <div className="text-red-400 text-xs mt-1">{String(errors.area?.message)}</div>}
          </div>

          <div>
            <label className="text-sm text-zinc-300">المستوى</label>
            <select {...register("level")} className="input-lux w-full">
              <option value="beginner">مبتدئ</option>
              <option value="intermediate">متوسط</option>
              <option value="advanced">متقدم</option>
              <option value="pro">محترف</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-zinc-300">التاريخ</label>
            <input type="datetime-local" {...register("date")} className="input-lux w-full" />
            {errors.date && <div className="text-red-400 text-xs mt-1">{String(errors.date?.message)}</div>}
          </div>

          <div>
            <label className="text-sm text-zinc-300">عدد اللاعبين المطلوبين</label>
            <input type="number" {...register("playersNeeded", { valueAsNumber: true })} className="input-lux w-full" min={1} max={20} />
            {errors.playersNeeded && <div className="text-red-400 text-xs mt-1">{String(errors.playersNeeded?.message)}</div>}
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <button type="button" onClick={() => { onClose?.(); }} className="px-4 py-2 rounded-lg bg-white/6">إلغاء</button>
          <Button type="submit" className="px-4 py-2" disabled={isSubmitting}>{isSubmitting ? "جاري الإنشاء..." : "انشر الطلب"}</Button>
        </div>
      </form>
    </Card>
  );
}
