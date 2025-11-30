// src/app/api/payments/webhook/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json(); // verify signature in prod
  try {
    const { order_id, status } = body; // example fields
    // map order_id -> booking
    const booking = await prisma.booking.findUnique({ where: { externalOrderId: order_id } });
    if (!booking) return NextResponse.json({ ok:false }, { status: 404 });

    if (status === "paid") {
      await prisma.booking.update({ where: { id: booking.id }, data: { status: "CONFIRMED", paidAt: new Date() }});
    } else if (status === "failed") {
      await prisma.booking.update({ where: { id: booking.id }, data: { status: "PAYMENT_FAILED" }});
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("webhook error", err);
    return NextResponse.json({ ok:false }, { status: 500 });
  }
}
