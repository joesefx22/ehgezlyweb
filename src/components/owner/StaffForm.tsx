"use client";
import React from "react";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";

export default function StaffForm({ onSaved }: { onSaved?: ()=>void }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<any>({ defaultValues: { userId: "", role: "WORKER" } });

  const onSubmit = async (vals:any) => {
    try {
      const res = await fetch(window.location.pathname.replace(/\/owner.*/, "") + `/api/stadium/${getStadiumId()}/staff`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(vals)
      });
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

  // helper to read stadium id from url (since this component used under stadium page)
  function getStadiumId() {
    const parts = window.location.pathname.split("/");
    const idx = parts.indexOf("stadium");
    return parts[idx+1];
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <input {...register("userId")} placeholder="User ID (id من جدول المستخدمين)" className="input-lux w-full" />
      <select {...register("role")} className="input-lux w-full">
        <option value="MANAGER">Manager</option>
        <option value="WORKER">Worker</option>
        <option value="CLEANER">Cleaner</option>
        <option value="SECURITY">Security</option>
      </select>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "جاري..." : "اضف"}</Button>
      </div>
    </form>
  );
}
