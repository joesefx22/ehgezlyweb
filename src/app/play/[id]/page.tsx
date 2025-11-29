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
