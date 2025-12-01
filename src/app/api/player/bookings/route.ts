// src/app/api/player/bookings/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromReq } from "@/lib/authServer";

export async function GET(req){
  const session = await getSessionFromReq(req);
  if (!session) return NextResponse.json({ ok:false, error:"unauthenticated" }, { status:401 });

  // stadium bookings where user is booker
  const stadiumBookings = await prisma.booking.findMany({ where: { userId: session.userId }, include: { stadium: true, slot: true } });

  // participations (playRequests user joined)
  const participations = await prisma.participation.findMany({ where: { userId: session.userId }, include: { playRequest: true } });

  return NextResponse.json({ ok:true, data: { stadiumBookings, participations } });
}
