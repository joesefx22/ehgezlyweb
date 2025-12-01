// src/app/api/staff/reports/daily/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromReq } from "@/lib/authServer";

function startOfDay(d){ const x=new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d){ const x=new Date(d); x.setHours(23,59,59,999); return x; }

export async function GET(){
  const session = await getSessionFromReq(this as any || arguments[0]);
  if (!session) return NextResponse.json({ ok:false, error:"unauthenticated" }, { status:401 });

  const staffs = await prisma.staff.findMany({ where: { userId: session.userId }});
  const stadiumIds = staffs.map(s=>s.stadiumId);
  if (stadiumIds.length === 0) return NextResponse.json({ ok:true, data: { bookings:0, present:0, absent:0, details:[] } });

  const today = new Date();
  const bookings = await prisma.booking.findMany({ where: { stadiumId: { in: stadiumIds }, startAt: { gte: startOfDay(today), lte: endOfDay(today) } }, include: { stadium:true } });

  // get attendances for these staff entries
  const staffIds = staffs.map(s=>s.id);
  const attendances = await prisma.staffAttendance.findMany({ where: { staffId: { in: staffIds }, date: { gte: startOfDay(today), lte: endOfDay(today) } } });

  const presentCount = attendances.filter(a=>a.present).length;
  const absentCount = bookings.length - presentCount;

  // per stadium breakdown
  const map = {};
  for (const b of bookings) {
    if (!map[b.stadiumId]) map[b.stadiumId] = { stadiumId: b.stadiumId, stadiumName: b.stadium?.name || "ملعب", bookings:0, present:0, revenue:0 };
    map[b.stadiumId].bookings += 1;
    map[b.stadiumId].revenue += b.totalCents || 0;
  }
  for (const a of attendances) {
    // need to map attendance to stadium: find staff entry to get stadiumId
    const staff = staffs.find(s=>s.id === a.staffId);
    if (!staff) continue;
    map[staff.stadiumId].present += a.present ? 1 : 0;
  }

  const details = Object.values(map);
  return NextResponse.json({ ok:true, data: { bookings: bookings.length, present: presentCount, absent: absentCount, details } });
}
