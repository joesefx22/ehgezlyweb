// src/app/api/player/bookings/[id]/cancel/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromReq } from "@/lib/authServer";

export async function POST(req, { params }) {
  const session = await getSessionFromReq(req);
  if (!session) return NextResponse.json({ ok:false, error:"unauthenticated" }, { status:401 });

  const id = Number(params.id);
  const booking = await prisma.booking.findUnique({ where: { id }});
  if (!booking) return NextResponse.json({ ok:false, error:"not found" }, { status:404 });
  if (booking.userId !== session.userId) return NextResponse.json({ ok:false, error:"forbidden" }, { status:403 });

  const updated = await prisma.booking.update({ where: { id }, data: { status: "CANCELLED" }});
  return NextResponse.json({ ok:true, data: updated });
}
