import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  // In production: verify signature / HMAC using PAYMOB secret
  const raw = await req.text();
  let body;
  try { body = JSON.parse(raw); } catch (e) { body = {}; }

  // Example fields: { order_id, status, transaction_id, signature }
  const orderId = body.order_id || body.externalOrderId || body.order || null;
  const status = (body.status || "").toLowerCase();

  if (!orderId) return NextResponse.json({ ok:false, error: "missing order id" }, { status: 400 });

  try {
    const booking = await prisma.booking.findFirst({ where: { externalOrderId: String(orderId) }});
    if (!booking) return NextResponse.json({ ok:false, error:"booking not found" }, { status: 404 });

    if (status === "paid" || status === "captured" || status === "success") {
      await prisma.booking.update({ where: { id: booking.id }, data: { status: "PAID", paymentStatus: "PAID", updatedAt: new Date() } });
    } else if (status === "failed" || status === "declined") {
      await prisma.booking.update({ where: { id: booking.id }, data: { status: "PAYMENT_FAILED", paymentStatus: "FAILED", updatedAt: new Date() } });
    } else {
      // other statuses: pending, refunded etc.
      await prisma.booking.update({ where: { id: booking.id }, data: { paymentStatus: status.toUpperCase(), updatedAt: new Date() } });
    }

    return NextResponse.json({ ok:true });
  } catch (err) {
    console.error("webhook error", err);
    return NextResponse.json({ ok:false, error: "server error" }, { status: 500 });
  }
}

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
