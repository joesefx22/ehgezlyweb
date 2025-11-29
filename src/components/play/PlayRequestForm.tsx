// src/components/play/PlayRequestForm.tsx
"use client";
import React from "react";
import { useForm } from "react-hook-form";

export default function PlayRequestForm({ onCreated, currentUser }: any) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const onSubmit = async (vals: any) => {
    try {
      const payload = {
        action: "create",
        title: vals.title,
        description: vals.description,
        location: vals.location,
        date: vals.date,
        timeSlot: vals.timeSlot,
        playersNeeded: Number(vals.playersNeeded || 1)
      };
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        reset();
        onCreated?.();
        alert("تم إنشاء طلب اللعب بنجاح");
      } else {
        alert(data.error || "حدث خطأ");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="text-sm text-zinc-400">عنوان الطلب</label>
        <input {...register("title", { required: true })} placeholder="مثال: محتاج 2 لاعبين اللمبارح" className="w-full mt-1 p-3 rounded-lg bg-zinc-900/40 border border-zinc-700" />
      </div>

      <div>
        <label className="text-sm text-zinc-400">الوصف (اختياري)</label>
        <textarea {...register("description")} rows={3} className="w-full mt-1 p-3 rounded-lg bg-zinc-900/40 border border-zinc-700" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-zinc-400">المكان</label>
          <input {...register("location", { required: true })} className="w-full mt-1 p-3 rounded-lg bg-zinc-900/40 border border-zinc-700" />
        </div>

        <div>
          <label className="text-sm text-zinc-400">عدد اللاعبين المطلوبين</label>
          <input type="number" min={1} {...register("playersNeeded")} defaultValue={1} className="w-full mt-1 p-3 rounded-lg bg-zinc-900/40 border border-zinc-700" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-zinc-400">التاريخ</label>
          <input type="date" {...register("date", { required: true })} className="w-full mt-1 p-3 rounded-lg bg-zinc-900/40 border border-zinc-700" />
        </div>
        <div>
          <label className="text-sm text-zinc-400">الوقت (اختياري)</label>
          <input {...register("timeSlot")} placeholder="18:00-19:00" className="w-full mt-1 p-3 rounded-lg bg-zinc-900/40 border border-zinc-700" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={isSubmitting} className="bg-emerald-500 hover:bg-emerald-400 px-4 py-2 rounded-lg shadow">انشر الطلب</button>
        <button type="button" onClick={() => { reset(); }} className="px-3 py-2 bg-white/6 rounded-lg">إلغاء</button>
      </div>
    </form>
  );
}
