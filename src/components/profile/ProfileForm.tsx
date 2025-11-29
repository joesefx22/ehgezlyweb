// src/components/profile/ProfileForm.tsx
"use client";
import React from "react";
import { useForm } from "react-hook-form";

type User = { id?: string; name?: string | null; email?: string; role?: string; avatarUrl?: string };

export default function ProfileForm({ user, onUpdated }: { user: User | null; onUpdated?: (u: User) => void }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { name: user?.name || "", email: user?.email || "" },
  });

  const onSubmit = async (values: any) => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...values }),
      });
      const data = await res.json();
      if (res.ok && data.ok) onUpdated?.(data.user);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-800/40 rounded-2xl p-6 border border-neutral-800 shadow-lg">
      <h3 className="text-lg font-semibold mb-4">تعديل الملف الشخصي</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-zinc-300">الاسم</label>
          <input {...register("name")} className="w-full mt-1 p-3 rounded-lg bg-zinc-900/40 border border-zinc-700 focus:ring-2 focus:ring-blue-400" />
        </div>

        <div>
          <label className="text-sm text-zinc-300">البريد الإلكتروني</label>
          <input {...register("email")} className="w-full mt-1 p-3 rounded-lg bg-zinc-900/40 border border-zinc-700" />
        </div>

        <div className="md:col-span-2 flex items-center gap-3 mt-2">
          <button type="submit" disabled={isSubmitting} className="bg-emerald-500 hover:bg-emerald-400 px-4 py-2 rounded-lg shadow">
            حفظ التغييرات
          </button>
          <div className="text-sm text-zinc-400">ستظهر التغييرات في لحظتها بعد الحفظ.</div>
        </div>
      </form>
    </div>
  );
}
