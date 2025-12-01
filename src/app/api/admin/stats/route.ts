import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromReq } from "@/lib/authServer";

export async function GET() {
  const session = await getSessionFromReq(this as any);
  if (!session) return NextResponse.json({ ok:false, error:"unauthenticated" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ ok:false, error:"forbidden" }, { status: 403 });

  const usersCount = await prisma.user.count();
  const stadiumsCount = await prisma.stadium.count();
  const bookingsCount = await prisma.booking.count();
  const income = await prisma.booking.aggregate({ _sum: { totalCents: true } });

  return NextResponse.json({ ok:true, data: { usersCount, stadiumsCount, bookingsCount, income: income._sum.totalCents || 0 } });
}
