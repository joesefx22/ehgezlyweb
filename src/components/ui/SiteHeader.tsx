// src/components/ui/SiteHeader.tsx
"use client";
import React from "react";
import Link from "next/link";
import { SunMedium, Menu } from "lucide-react";

export default function SiteHeader() {
  return (
    <header className="w-full backdrop-blur-lg bg-gradient-to-b from-transparent to-transparent/50 border-b border-white/6">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center shadow-md">
            <span className="font-bold text-black">EH</span>
          </div>
          <div>
            <div className="text-white font-semibold">Ehgezly</div>
            <div className="text-sm text-zinc-400">احجز الملعب بسرعة</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-4">
          <Link href="/play" className="text-zinc-200 hover:text-white">لاعبوني معاكم</Link>
          <Link href="/profile" className="text-zinc-200 hover:text-white">حسابي</Link>
          <Link href="/dashboard" className="text-zinc-200 hover:text-white">الادمن</Link>
          <button className="ml-3 btn-lux bg-white/6 text-white">جرب الحجز</button>
        </nav>

        <div className="md:hidden">
          <button className="p-2 rounded-md bg-white/4"><Menu size={18} /></button>
        </div>
      </div>
    </header>
  );
}
