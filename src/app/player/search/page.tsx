"use client";
import React, { useEffect, useState } from "react";
import PlayCard from "@/components/player/PlayCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import { useToast } from "@/components/ui/use-toast";

export default function PlayerSearchPage(){
  const [q, setQ] = useState("");
  const [plays, setPlays] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToast();

  async function load(p = 1) {
    try {
      const res = await fetch(`/api/play?search=${encodeURIComponent(q)}&page=${p}`);
      const j = await res.json();
      if (res.ok && j.ok) {
        setPlays(j.data.items || []);
        setTotalPages(j.data.totalPages || 1);
        setPage(p);
      } else toast.show(j.error || "خطأ","error");
    } catch (err) { console.error(err); toast.show("خطأ","error"); }
  }

  useEffect(()=>{ load(1); }, []);

  return (
    <div className="p-6">
      <div className="mb-4 flex gap-3">
        <SearchBar value={q} onChange={(v)=>setQ(v)} placeholder="ابحث بالمنطقة أو الوصف..." />
        <Button onClick={()=>load(1)}>بحث</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plays.map(p => <PlayCard key={p.id} play={p} />)}
        {plays.length === 0 && <Card className="p-4">لا توجد نتائج</Card>}
      </div>

      <div className="mt-6 flex justify-center">
        <Pagination page={page} totalPages={totalPages} onPage={(p)=>load(p)} />
      </div>
    </div>
  );
}
