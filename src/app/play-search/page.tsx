"use client";
import { useState } from "react";

export default function PlaySearchPage() {
  const [date, setDate] = useState("");
  const [region, setRegion] = useState("");
  const [level, setLevel] = useState("");
  const [results, setResults] = useState([]);

  async function handleSearch() {
    const params = new URLSearchParams();
    if (date) params.append("date", date);
    if (region) params.append("region", region);
    if (level) params.append("level", level);

    const res = await fetch(`/api/plays/search?${params.toString()}`);
    const data = await res.json();
    setResults(data);
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">🔍 البحث المتقدم</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="date"
          className="border p-3 rounded-xl bg-white"
          onChange={(e) => setDate(e.target.value)}
        />

        <select
          className="border p-3 rounded-xl bg-white"
          onChange={(e) => setRegion(e.target.value)}
        >
          <option value="">اختر المنطقة</option>
          <option value="cairo">القاهرة</option>
          <option value="giza">الجيزة</option>
          <option value="alex">الاسكندرية</option>
        </select>

        <select
          className="border p-3 rounded-xl bg-white"
          onChange={(e) => setLevel(e.target.value)}
        >
          <option value="">مستوى اللاعبين</option>
          <option value="beginner">مبتدئ</option>
          <option value="intermediate">متوسط</option>
          <option value="advanced">محترف</option>
        </select>
      </div>

      <button
        onClick={handleSearch}
        className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-900"
      >
        بحث
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        {results.map((item: any) => (
          <div
            key={item.id}
            onClick={() => (window.location.href = `/play/${item.id}`)}
            className="p-5 rounded-2xl shadow-lg bg-white cursor-pointer hover:scale-105 transition"
          >
            <h2 className="text-xl font-bold">{item.title}</h2>
            <p className="text-gray-600 mt-2">📅 {item.date}</p>
            <p className="text-gray-600">📍 {item.region}</p>
            <p className="text-gray-600">⚽ المستوى: {item.level}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
