import { Calendar, Users, MapPin, Phone, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function PlayDetailsPage({ params }: { params: { id: string } }) {
  const requestId = params.id;

  // fake data TEMP untill API ready
  const data = {
    player: "Ahmed Mohamed",
    area: "مدينة نصر",
    level: "متقدم",
    date: "2025-02-10",
    needed: 2,
    notes: "عايزين لاعبين ملتزمين.. الماتش الساعة 8.",
    phone: "01012345678",
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-8 backdrop-blur-xl bg-white/10 shadow-2xl border border-white/20"
      >

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">
          تفاصيل طلب اللعب
        </h1>

        {/* PLAYER NAME */}
        <div className="text-white text-xl font-semibold mb-4">
          {data.player}
        </div>

        {/* DETAILS */}
        <div className="space-y-4 text-white">

          <div className="flex items-center gap-3">
            <MapPin /> المنطقة: {data.area}
          </div>

          <div className="flex items-center gap-3">
            <Users /> مستوى اللاعبين: {data.level}
          </div>

          <div className="flex items-center gap-3">
            <Calendar /> التاريخ: {data.date}
          </div>

          <div className="flex items-center gap-3">
            <Users /> عدد اللاعبين المطلوبين: {data.needed}
          </div>

          <div className="bg-white/10 p-4 rounded-xl">
            <p className="text-sm">{data.notes}</p>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <Phone /> تواصل: {data.phone}
          </div>
        </div>

        <button
          className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2"
        >
          انضم للماتش <ArrowRight size={18} />
        </button>
      </motion.div>
    </div>
  );
}

async function getData(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/plays/${id}`);
  return res.json();
}

export default async function PlayDetails({ params }) {
  const data = await getData(params.id);

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold mb-4">{data.title}</h1>

      <div className="space-y-3 text-gray-700">
        <p>📅 التاريخ: {data.date}</p>
        <p>📍 المنطقة: {data.region}</p>
        <p>⚽ المستوى: {data.level}</p>
        <p>⏳ الوقت: {data.time}</p>
        <p>💰 السعر: {data.price} جنيه</p>
      </div>

      <button className="mt-6 px-8 py-3 rounded-xl bg-black text-white">
        احجز الماتش
      </button>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Users,
  User,
  Phone,
  BadgeCheck,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function PlayDetailsPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/play/${id}`);
      const json = await res.json();
      setData(json.data);
    }
    if (id) load();
  }, [id]);

  if (!data)
    return (
      <div className="text-center py-40 text-zinc-300 text-xl">
        جاري تحميل التفاصيل...
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-5xl mx-auto px-6 py-12"
    >
      {/* Header Title */}
      <div className="mb-10">
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-4xl font-bold text-white"
        >
          مباراة في {data.area}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-zinc-300 mt-3 leading-relaxed"
        >
          تفاصيل كاملة عن طلب اللعب 👇
        </motion.p>
      </div>

      {/* Main Card */}
      <Card className="p-8 bg-white/5 backdrop-blur-xl shadow-lux-2 border border-white/10 rounded-2xl">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Left Side */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-zinc-200">
              <User size={20} className="text-emerald-400" />
              <span>الاسم: {data.name}</span>
            </div>

            <div className="flex items-center gap-3 text-zinc-200">
              <Phone size={20} className="text-sky-400" />
              <span>رقم الموبايل: {data.phone}</span>
            </div>

            <div className="flex items-center gap-3 text-zinc-200">
              <MapPin size={20} className="text-rose-400" />
              <span>المنطقة: {data.area}</span>
            </div>

            <div className="flex items-center gap-3 text-zinc-200">
              <Calendar size={20} className="text-amber-400" />
              <span>التاريخ: {data.date}</span>
            </div>

            <div className="flex items-center gap-3 text-zinc-200">
              <Users size={20} className="text-purple-400" />
              <span>
                عدد اللاعبين المطلوبين: {data.players}
              </span>
            </div>

            <div className="text-zinc-300 leading-relaxed">
              <b>ملاحظات:</b>  
              <br />
              {data.description}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex flex-col justify-center">
            <div className="mb-6">
              <div className="text-zinc-400 text-sm mb-2">مستوى اللعب</div>
              <div className="flex items-center gap-2 text-xl font-semibold text-white">
                <BadgeCheck className="text-green-400" />
                {data.level}
              </div>
            </div>

            <Button className="w-full py-4 text-lg rounded-xl shadow-xl hover:scale-[1.02] transition-all">
              انضم الآن
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// src/app/play/[id]/page.jsx

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function MatchDetails({ params }) {
  const { id } = params;
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatch() {
      try {
        const res = await fetch(`/api/matches/${id}`);
        const data = await res.json();
        setMatch(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchMatch();
  }, [id]);

  if (loading) {
    return <div className="text-center py-10 text-lg">Loading match details...</div>;
  }

  if (!match) {
    return <div className="text-center py-10 text-red-600">Match not found.</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Match Details</h1>

      <Card className="shadow-xl rounded-2xl p-4">
        <CardContent>
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold text-xl">Location</h2>
              <p>{match.location}</p>
            </div>

            <div>
              <h2 className="font-semibold text-xl">Date & Time</h2>
              <p>{new Date(match.date).toLocaleString()}</p>
            </div>

            <div>
              <h2 className="font-semibold text-xl">Players Needed</h2>
              <p>{match.playersNeeded}</p>
            </div>

            <div>
              <h2 className="font-semibold text-xl">Skill Level</h2>
              <p>{match.level}</p>
            </div>

            <div>
              <h2 className="font-semibold text-xl">Description</h2>
              <p>{match.description}</p>
            </div>

            <Button className="w-full mt-6 text-lg py-6 rounded-xl">
              Join Match
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// src/app/play/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { MapPin, Calendar, Users, User, Phone, MessageCircle } from "lucide-react";

export default function PlayDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [match, setMatch] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/matches/${id}`)
      .then(res => res.json())
      .then(j => {
        if (j?.ok) setMatch(j.data);
        else setMatch(null);
      })
      .catch(err => { console.error(err); setMatch(null); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleJoin = async () => {
    if (!match) return;
    if (!confirm("هل أنت متأكد أنك تريد الانضمام إلى هذا الطلب؟")) return;
    setJoining(true);
    try {
      const res = await fetch("/api/matches/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ matchId: match.id }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        alert("تم الانضمام بنجاح");
        // refresh match
        const r2 = await fetch(`/api/matches/${id}`);
        const j2 = await r2.json();
        if (j2?.ok) setMatch(j2.data);
      } else {
        alert(data.error || "حدث خطأ أثناء الانضمام");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return <div className="min-h-[40vh] flex items-center justify-center text-zinc-300">جاري تحميل التفاصيل...</div>;
  }

  if (!match) {
    return <div className="min-h-[40vh] flex items-center justify-center text-red-400">عذرًا، لم يتم العثور على الطلب</div>;
  }

  const playersCount = match.participants?.length || 0;
  const spotsLeft = Math.max(match.playersNeeded - playersCount, 0);

  return (
    <main className="min-h-screen p-6 bg-gradient-to-b from-[#041225] to-[#021018]">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-white">{match.title || `مباراة في ${match.area}`}</h1>
          <p className="text-zinc-400 mt-1">منشئ الطلب: {match.creator?.name || "مستخدم"}</p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          <section className="md:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 text-zinc-200 mb-3">
                    <MapPin /><span className="font-medium">المنطقة</span> <span className="text-zinc-400 ml-2">{match.area}</span>
                  </div>

                  <div className="flex items-center gap-3 text-zinc-200 mb-3">
                    <Calendar /><span className="font-medium">التاريخ والوقت</span> <span className="text-zinc-400 ml-2">{new Date(match.date).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-3 text-zinc-200 mb-3">
                    <Users /><span className="font-medium">المستوى</span> <span className="text-zinc-400 ml-2">{match.level}</span>
                  </div>

                  <div className="mt-4 text-zinc-300 leading-relaxed">
                    <h3 className="font-semibold text-white mb-2">تفاصيل الطلب</h3>
                    <p>{match.description || "لا توجد ملاحظات إضافية"}</p>
                  </div>
                </div>

                <aside className="w-44">
                  <div className="text-sm text-zinc-400">المنشئ</div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800">
                      <img src={match.creator?.avatarUrl || "/icons/icon-192x192.png"} alt="creator" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{match.creator?.name || "مستخدم"}</div>
                      <div className="text-xs text-zinc-400">المنشئ</div>
                    </div>
                  </div>
                  <div className="mt-6 text-sm text-zinc-400">
                    <div>الانضمام: <span className="text-white font-medium">{playersCount}/{match.playersNeeded}</span></div>
                    <div className="mt-2">متبقي: <span className="text-amber-400 font-semibold">{spotsLeft}</span></div>
                  </div>
                </aside>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">قائمة المنضمين</h3>
              <div className="space-y-3">
                {match.participants && match.participants.length > 0 ? match.participants.map((p:any) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800"><img src={p.user?.avatarUrl || "/icons/icon-192x192.png"} alt="" className="w-full h-full object-cover" /></div>
                    <div>
                      <div className="font-medium text-white">{p.user?.name || p.user?.email}</div>
                      <div className="text-xs text-zinc-400">{new Date(p.joinedAt).toLocaleString()}</div>
                    </div>
                  </div>
                )) : <div className="text-zinc-400">لا يوجد منضمين حتى الآن</div>}
              </div>
            </Card>
          </section>

          <aside className="md:col-span-1 space-y-6">
            <Card className="p-6 text-center">
              <div className="text-sm text-zinc-400">مكان الحجز</div>
              <div className="text-lg font-semibold text-white mt-2">{match.area}</div>

              <div className="mt-4">
                <div className="text-sm text-zinc-400">المتطلبات</div>
                <div className="text-white font-medium mt-1">{match.playersNeeded} لاعب/لاعبين</div>
              </div>

              <div className="mt-6">
                {match.status === "OPEN" ? (
                  <Button onClick={handleJoin} disabled={joining || spotsLeft <= 0} className="w-full py-3 text-lg">
                    {joining ? "جارٍ الانضمام..." : (spotsLeft > 0 ? "انضم الآن" : "اكتمل العدد")}
                  </Button>
                ) : (
                  <div className="px-4 py-3 rounded-xl bg-zinc-800 text-zinc-400">الحالة: {match.status}</div>
                )}
              </div>

              <div className="mt-4 text-xs text-zinc-400">
                <div>للاستفسار: <a href={`tel:${match.creator?.phone || ""}`} className="text-emerald-400">{match.creator?.phone || "-"}</a></div>
                <div className="mt-2">انقر انضم الآن للانضمام سريعًا</div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="text-sm text-zinc-300">اختر إجراء</h4>
              <div className="mt-3 space-y-2">
                <button className="w-full btn-lux p-2">مراسلة المنشئ</button>
                <button className="w-full bg-white/6 p-2 rounded-xl">إضافة لتذكيري</button>
              </div>
            </Card>
          </aside>
        </div>
      </motion.div>
    </main>
  );
}
