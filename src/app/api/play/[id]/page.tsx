"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/toast";
import Image from "next/image";

export default function MatchDetails({ params }) {
  const [match, setMatch] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetch(`/api/play/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) toast.show(data.error, "error");
        else setMatch(data);
      });
  }, []);

  if (!match) return <p className="text-center pt-20">Loading...</p>;

  const handleJoin = async () => {
    try {
      const res = await fetch(`/api/play/${params.id}/join`, {
        method: "POST",
      });

      const data = await res.json();

      if (data.error) return toast.show(data.error, "error");

      toast.show("تم انضمامك للماتش بنجاح!", "success");
    } catch {
      toast.show("خطأ أثناء الانضمام", "error");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white pb-20">

      {/* Banner */}
      <div className="relative w-full h-[240px]">
        <Image
          src="/images/stadium.jpg"
          alt="stadium"
          fill
          className="object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/80" />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-xl -mt-16 bg-white/10 backdrop-blur-xl 
        border border-white/20 p-6 rounded-2xl shadow-2xl"
      >
        <h1 className="text-2xl font-semibold mb-4">{match.title}</h1>

        <p className="text-gray-300 mb-2">
          📍 <b>المنطقة:</b> {match.area}
        </p>

        <p className="text-gray-300 mb-2">
          📅 <b>التاريخ:</b> {match.date}
        </p>

        <p className="text-gray-300 mb-2">
          🧑‍🤝‍🧑 <b>عدد اللاعبين:</b> {match.players.length} / {match.maxPlayers}
        </p>

        <p className="text-gray-300 mb-4">
          👤 <b>صاحب الطلب:</b> {match.owner?.name}
        </p>

        <button
          onClick={handleJoin}
          className="w-full py-3 bg-green-600 hover:bg-green-500 text-white 
          font-semibold rounded-xl shadow-lg transition"
        >
          انضم للماتش
        </button>
      </motion.div>
    </div>
  );
}
