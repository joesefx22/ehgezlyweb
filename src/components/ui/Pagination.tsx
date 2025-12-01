"use client";
import React from "react";
import Button from "@/components/ui/Button";

export default function Pagination({ page, totalPages, onPage }: { page: number, totalPages: number, onPage: (p:number)=>void }) {
  const prev = () => onPage(Math.max(1, page - 1));
  const next = () => onPage(Math.min(totalPages, page + 1));
  return (
    <div className="flex items-center gap-2">
      <Button onClick={prev} disabled={page===1} className="px-3 py-1">السابق</Button>
      <div className="px-3 py-1 text-sm">صفحة {page} من {totalPages}</div>
      <Button onClick={next} disabled={page===totalPages} className="px-3 py-1">التالي</Button>
    </div>
  );
}
