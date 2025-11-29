// src/app/player/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DashboardHeader from "@/components/player/DashboardHeader";
import ProfileSummary from "@/components/player/ProfileSummary";
import RequestCard from "@/components/player/RequestCard";
import NotificationsList from "@/components/player/NotificationsList";
import HistoryList from "@/components/player/HistoryList";
import { useAuthStore } from "@/store/authStore";

export default function PlayerDashboardPage() {
  const { user, setUser } = useAuthStore();
  const [created, setCreated] = useState<any[]>([]);
  const [joined, setJoined] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    try {
      const [r1, r2, r3, r4] = await Promise.all([
        fetch("/api/player/requests?type=created").then(r=>r.json()),
        fetch("/api/player/requests?type=joined").then(r=>r.json()),
        fetch("/api/player/notifications").then(r=>r.json()),
        fetch("/api/player/history").then(r=>r.json()),
      ]);

      if (r1.ok) setCreated(r1.data || []);
      if (r2.ok) setJoined(r2.data || []);
      if (r3.ok) setNotifications(r3.data || []);
      if (r4.ok) setHistory((r4.data?.createdPlayed || []).concat(r4.data?.joinedPlayed?.map((j:any)=>j.match) || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-[#031425] to-[#00101a]">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-6xl mx-auto">
        <DashboardHeader user={user} onRefresh={loadAll} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-1 space-y-6">
            <ProfileSummary user={user} onUpdated={() => loadAll()} />
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-zinc-400">إجمالي الطلبات المنشورة</div>
                  <div className="text-2xl font-semibold">{created.length}</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">طلبات منضم ليها</div>
                  <div className="text-2xl font-semibold">{joined.length}</div>
                </div>
              </div>
            </Card>

            <NotificationsList notifications={notifications} onRefresh={loadAll} />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">طلباتك المنشورة</h3>
                <Button onClick={() => window.location.href = "/play"}>انشر طلب جديد</Button>
              </div>

              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[1,2].map(i => <div key={i} className="h-28 bg-zinc-800 rounded-xl" />)}
                </div>
              ) : (
                <>
                  {created.length === 0 ? <div className="text-zinc-400">لم تنشئ أي طلبات بعد.</div> :
                    created.map((c:any)=> <RequestCard key={c.id} request={c} onAction={loadAll} />)
                  }
                </>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">الطلبات التي انضممت إليها</h3>
              {joined.length === 0 ? <div className="text-zinc-400">لم تنضم لأي طلبات بعد.</div> :
                joined.map((j:any)=>(<RequestCard key={j.id || j.matchId} joined={j} request={j.match || j} onAction={loadAll} />))
              }
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">تاريخ المباريات</h3>
              <HistoryList history={history} />
            </Card>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
