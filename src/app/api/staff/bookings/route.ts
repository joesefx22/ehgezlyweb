// src/app/api/staff/bookings/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromReq } from "@/lib/authServer";

export async function GET(){
  const session = await getSessionFromReq(this as any || arguments[0]);
  if (!session) return NextResponse.json({ ok:false, error:"unauthenticated" }, { status:401 });

  const staffs = await prisma.staff.findMany({ where: { userId: session.userId }});
  const stadiumIds = staffs.map(s => s.stadiumId);
  if (stadiumIds.length === 0) return NextResponse.json({ ok:true, data: [] });

  const bookings = await prisma.booking.findMany({ where: { stadiumId: { in: stadiumIds } }, include: { user:true, stadium:true, slot:true }, orderBy: { startAt: "desc" } });
  return NextResponse.json({ ok:true, data: bookings });
}
