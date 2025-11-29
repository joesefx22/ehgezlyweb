// src/components/player/DashboardHeader.tsx
"use client";
import React from "react";
import { Bell } from "lucide-react";

export default function DashboardHeader({ user, onRefresh }: any) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold">أهلًا بـ {user?.name || user?.email || "لاعب"}</h2>
        <p className="text-zinc-400">لوحة التحكم الخاصة بك — تابع طلباتك وحجوزاتك.</p>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => onRefresh?.()} className="btn-lux py-2 px-3">تحديث</button>
        <button className="p-2 rounded-lg bg-white/6">
          <Bell />
        </button>
      </div>
    </div>
  );
}
