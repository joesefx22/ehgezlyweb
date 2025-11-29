// src/components/play/MatchList.tsx
"use client";
import React from "react";
import MatchCard from "./MatchCard";

export default function MatchList({ matches, loading, onJoined }: any) {
  if (loading) {
    return <div className="animate-pulse space-y-3">
      {[1,2,3].map(i => <div key={i} className="h-28 bg-zinc-800 rounded-xl" />)}
    </div>;
  }

  if (!matches || matches.length === 0) {
    return <div className="text-zinc-400">لا توجد طلبات حالياً — كن أول من ينشر طلبًا!</div>;
  }

  return (
    <div>
      {matches.map((m: any) => <MatchCard key={m.id} match={m} onJoined={onJoined} />)}
    </div>
  );
}
