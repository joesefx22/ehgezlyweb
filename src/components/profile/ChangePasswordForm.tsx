// src/components/profile/ChangePasswordForm.tsx
"use client";
import React from "react";
import { useForm } from "react-hook-form";

export default function ChangePasswordForm() {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (vals: any) => {
    if (vals.newPassword !== vals.confirmPassword) return alert("كلمات المرور غير متطابقة");
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentPassword: vals.currentPassword, newPassword: vals.newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        alert("تم تغيير كلمة المرور بنجاح");
      } else {
        alert(data.error || "حدث خطأ");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ");
    }
  };

  return (
    <div className="bg-gradient-to-br from-zinc-900/40 to-zinc-800/30 rounded-2xl p-6 border border-neutral-800 shadow-lg">
      <h3 className="text-lg font-semibold mb-4">تغيير كلمة المرور</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-zinc-300">كلمة المرور الحالية</label>
          <input {...register("currentPassword", { required: true })} type="password" className="w-full mt-1 p-3 rounded-lg bg-zinc-900/40 border border-zinc-700" />
        </div>

        <div>
          <label className="text-sm text-zinc-300">كلمة المرور الجديدة</label>
          <input {...register("newPassword", { required: true, minLength: 6 })} type="password" className="w-full mt-1 p-3 rounded-lg bg-zinc-900/40 border border-zinc-700" />
        </div>

        <div>
          <label className="text-sm text-zinc-300">تأكيد كلمة المرور</label>
          <input {...register("confirmPassword", { required: true })} type="password" className="w-full mt-1 p-3 rounded-lg bg-zinc-900/40 border border-zinc-700" />
        </div>

        <div className="md:col-span-2 mt-2">
          <button className="bg-amber-500 hover:bg-amber-400 px-4 py-2 rounded-lg shadow" type="submit" disabled={isSubmitting}>تغيير كلمة المرور</button>
        </div>
      </form>
    </div>
  );
}
