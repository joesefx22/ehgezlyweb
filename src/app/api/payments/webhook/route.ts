// src/app/api/payments/webhook/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  try {
    const { order_id, status } = body; // adapt to PayMob payload
    if (!order_id) return NextResponse.json({ ok:false }, { status: 400 });

    const booking = await prisma.booking.findFirst({ where: { externalOrderId: order_id } });
    if (!booking) return NextResponse.json({ ok:false }, { status: 404 });

    if (status === "paid" || status === "CAPTURED") {
      await prisma.booking.update({ where: { id: booking.id }, data: { status: "PAID", updatedAt: new Date() } });
    } else {
      await prisma.booking.update({ where: { id: booking.id }, data: { status: "PAYMENT_FAILED", updatedAt: new Date() } });
    }
    return NextResponse.json({ ok:true });
  } catch (err) {
    console.error("payments webhook error", err);
    return NextResponse.json({ ok:false }, { status: 500 });
  }
}
