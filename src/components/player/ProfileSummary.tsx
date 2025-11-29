// src/components/player/ProfileSummary.tsx
"use client";
import React from "react";
import Button from "@/components/ui/Button";

export default function ProfileSummary({ user, onUpdated }: any) {
  const handleEdit = () => window.location.href = "/profile";
  return (
    <div className="lux-card p-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-800">
          <img src={user?.avatarUrl || "/icons/icon-192x192.png"} alt="avatar" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <div className="text-lg font-semibold">{user?.name || user?.email}</div>
          <div className="text-sm text-zinc-400">{user?.role}</div>
        </div>
        <div>
          <Button onClick={handleEdit} className="px-4 py-2">تعديل البروفايل</Button>
        </div>
      </div>
    </div>
  );
}
