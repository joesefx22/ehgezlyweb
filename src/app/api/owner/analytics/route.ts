// src/app/api/owner/analytics/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromReq } from "@/lib/authServer";

function startOfMonth(dt) {
  return new Date(dt.getFullYear(), dt.getMonth(), 1);
}

export async function GET(req: Request) {
  const session = await getSessionFromReq(req);
  if (!session) return NextResponse.json({ ok:false, error: "unauthenticated" }, { status: 401 });
  const ownerId = session.userId;

  // params optional: year, stadiumId
  const url = new URL(req.url);
  const year = Number(url.searchParams.get("year") || new Date().getFullYear());
  const stadiumId = url.searchParams.get("stadiumId");

  try {
    // get stadiums of owner
    const stadiums = await prisma.stadium.findMany({ where: { ownerId } });
    const stadiumIds = stadiums.map(s => s.id);

    const where:any = {
      stadiumId: { in: stadiumIds },
      status: { not: "CANCELLED" },
      createdAt: { gte: new Date(`${year}-01-01T00:00:00.000Z`), lte: new Date(`${year}-12-31T23:59:59.999Z`) }
    };
    if (stadiumId) where.stadiumId = Number(stadiumId);

    // total earnings by month
    const bookings = await prisma.booking.findMany({ where, select: { id:true, totalCents:true, createdAt:true, stadiumId:true } });

    const months = Array.from({length:12}, (_,i)=>({ month: i+1, totalCents:0, bookings:0 }));
    for (const b of bookings) {
      const m = new Date(b.createdAt).getMonth(); // 0-11
      months[m].totalCents += b.totalCents || 0;
      months[m].bookings += 1;
    }

    // totals
    const totalEarnings = months.reduce((s,m)=>s+m.totalCents,0);
    const totalBookings = bookings.length;

    // per-stadium
    const perStadiumMap = {};
    for (const s of stadiums) perStadiumMap[s.id]= { id:s.id, name:s.name, totalCents:0, bookings:0 };
    for (const b of bookings) {
      perStadiumMap[b.stadiumId].totalCents += b.totalCents || 0;
      perStadiumMap[b.stadiumId].bookings += 1;
    }
    const perStadium = Object.values(perStadiumMap);

    return NextResponse.json({ ok:true, data: { year, months, totalEarnings, totalBookings, perStadium } });
  } catch (err) {
    console.error("analytics error", err);
    return NextResponse.json({ ok:false, error: "server error" }, { status: 500 });
  }
}
