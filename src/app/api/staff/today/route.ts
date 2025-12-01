// src/app/api/staff/today/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromReq } from "@/lib/authServer";

function startOfDay(d){ const x=new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d){ const x=new Date(d); x.setHours(23,59,59,999); return x; }

export async function GET(req){
  const session = await getSessionFromReq(req);
  if (!session) return NextResponse.json({ ok:false, error:"unauthenticated" }, { status:401 });

  // find staff entries for this user
  const staffs = await prisma.staff.findMany({ where: { userId: session.userId }});
  if (!staffs || staffs.length === 0) return NextResponse.json({ ok:true, data: [] });

  const stadiumIds = staffs.map(s=>s.stadiumId);

  const today = new Date();
  const bookings = await prisma.booking.findMany({
    where: {
      stadiumId: { in: stadiumIds },
      startAt: { gte: startOfDay(today), lte: endOfDay(today) }
    },
    include: { user: true, stadium: true }
  });

  // map present: check attendances for each staff? simple approach: check staffAttendance for staffId linked to staff record.
  // We'll include simple present flag by searching staffAttendance by booking's stadium and date for this staff user.
  // Simpler: return bookings and frontend will call attendance endpoint to mark present.

  return NextResponse.json({ ok:true, data: bookings });
}
