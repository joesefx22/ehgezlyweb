// src/app/api/payments/create/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromReq } from "@/lib/authServer";

export async function POST(req: Request) {
  const session = await getSessionFromReq(req);
  if (!session) return NextResponse.json({ ok:false, error: "unauthenticated" }, { status: 401 });

  const body = await req.json();
  const { bookingId } = body;
  if (!bookingId) return NextResponse.json({ ok:false, error: "bookingId required" }, { status: 400 });

  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { field: true } });
  if (!booking) return NextResponse.json({ ok:false, error: "booking not found" }, { status: 404 });
  if (booking.userId !== session.userId) return NextResponse.json({ ok:false, error: "forbidden" }, { status: 403 });

  // here: call PayMob api to create order / payment key, but we return a placeholder
  // create an externalOrderId linking booking <-> gateway
  const externalOrderId = `ext_${booking.id}_${Date.now()}`;
  await prisma.booking.update({ where: { id: booking.id }, data: { externalOrderId } });

  // Return a fake payment redirect (in production call PayMob and return real URL)
  return NextResponse.json({ ok:true, data: { paymentUrl: `${process.env.SITE_URL || ""}/payments/mock?order=${externalOrderId}` } });
}
