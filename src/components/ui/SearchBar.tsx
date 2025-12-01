"use client";
import React from "react";

export default function SearchBar({ value, onChange, placeholder = "ابحث..." }: { value: string, onChange: (v:string)=>void, placeholder?: string }) {
  return (
    <div className="relative w-full">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full input-lux pr-10"
        aria-label="search"
      />
      <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" viewBox="0 0 24 24" fill="none">
        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="11" cy="11" r="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}
