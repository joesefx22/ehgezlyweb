// src/app/play/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PlayRequestForm from "@/components/play/PlayRequestForm";
import MatchList from "@/components/play/MatchList";
import { useAuthStore } from "@/store/authStore";

export default function PlayPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/matches?status=OPEN&limit=50");
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    // optional: poll every 30s
    const interval = setInterval(fetchMatches, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#051025] to-[#031425] text-white p-6 md:p-12">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">لاعبوني معاكم</h1>
            <p className="text-zinc-300 mt-1">اعرض طلبات اللعب، أو أنشئ طلبًا جديدًا — تواصل سريع، لعب أسرع.</p>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <aside className="lg:col-span-1 bg-zinc-900/40 rounded-2xl p-6 border border-neutral-800 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">أنشئ طلب لعب جديد</h3>
            <PlayRequestForm onCreated={() => fetchMatches()} currentUser={user} />
            <div className="text-xs text-zinc-400 mt-4">تذكّر: كن واضحًا في الوصف لتزيد فرص الانضمام.</div>
          </aside>

          <div className="lg:col-span-2">
            <div className="bg-zinc-900/30 rounded-2xl p-4 border border-neutral-800 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-zinc-300">الطلبات المفتوحة</div>
                <div className="text-xs text-zinc-400">تحديث تلقائي كل 30 ثانية</div>
              </div>
            </div>

            <MatchList matches={matches} loading={loading} onJoined={() => fetchMatches()} />
          </div>
        </section>
      </motion.div>
    </main>
  );
}
