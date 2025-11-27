// src/app/api/health/route.ts
import { NextResponse } from "next/server";
import { healthCheck, createTables } from "@/lib/db";

export async function GET() {
  // optional: create tables on demand (only in dev)
  if (process.env.NODE_ENV !== 'production') {
    try { await createTables(); } catch(e){ /* ignore */ }
  }
  const stat = await healthCheck();
  return NextResponse.json(stat);
}
