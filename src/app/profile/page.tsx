// src/app/profile/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import AvatarUploader from "@/components/profile/AvatarUploader";
import ProfileForm from "@/components/profile/ProfileForm";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import { LogOut } from "lucide-react";

export default function ProfilePage() {
  const { user, setUser, setToken } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.ok) setUser(data.user);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [setUser]);

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "POST", headers: { "content-type":"application/json" }, body: JSON.stringify({ action: "logout", token: null }) });
    setUser(null);
    setToken(null);
    // redirect to login
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-800 text-white">
        <div className="animate-pulse text-center">
          <div className="h-36 w-36 rounded-full bg-zinc-700 mx-auto mb-6" />
          <div className="h-6 w-64 bg-zinc-700 mx-auto mb-3" />
          <div className="h-4 w-40 bg-zinc-700 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#07112a] text-white p-6 md:p-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">حسابي</h1>
            <p className="text-zinc-300 mt-1">لوحة تحكم حسابك الشخصية — كل شيء تحت تحكمك</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleLogout} className="bg-rose-600 hover:bg-rose-500 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
              <LogOut size={16} />
              تسجيل خروج
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <aside className="md:col-span-1 bg-gradient-to-br from-zinc-900/60 to-zinc-800/40 rounded-2xl p-6 shadow-2xl border border-neutral-800">
            <div className="flex flex-col items-center text-center">
              <AvatarUploader currentAvatar={user?.avatarUrl || ""} onUploaded={(url) => setUser({ ...user, avatarUrl: url } as any)} />
              <h2 className="mt-4 text-xl font-semibold">{user?.name || user?.email}</h2>
              <p className="text-sm text-zinc-400 mt-1">{user?.role}</p>
            </div>

            <div className="mt-8 space-y-3">
              <div className="text-zinc-300 text-sm">انضممت في</div>
              <div className="text-white font-medium">-- تاريخ الإنضمام سيظهر هنا --</div>
            </div>
          </aside>

          <div className="md:col-span-2 space-y-6">
            <ProfileForm user={user} onUpdated={(u) => setUser(u)} />
            <ChangePasswordForm />
            {/* يمكن إضافة أقسام إضافية هنا: النشاطات، الحجوزات، الاشتراكات */}
          </div>
        </section>
      </motion.div>
    </main>
  );
}
