// src/app/api/payment/create-order/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateCode } from "@/lib/payments/validateCode";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // expected body: { userId?, playgroundId?, date?, time?, price, code? }
    const { userId, playgroundId, date, time, price, code } = body;

    if (!price) return NextResponse.json({ error: "price_required" }, { status: 400 });

    let finalPrice = price;
    let appliedCodeId: string | null = null;

    if (code) {
      const res = await validateCode({ code, userId: userId ?? null, price });
      if (!res.valid) return NextResponse.json({ error: res.message }, { status: 400 });
      finalPrice = res.finalPrice;
      appliedCodeId = res.code.id;
    }

    const created = await prisma.order.create({
      data: {
        userId: userId ?? null,
        playgroundId: playgroundId ?? null,
        date: date ? new Date(date) : null,
        time: time ?? null,
        originalPrice: price,
        finalPrice,
        codeAppliedId: appliedCodeId,
        status: "PENDING"
      }
    });

    return NextResponse.json({ ok: true, data: created });
  } catch (err) {
    console.error("create-order error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateCode } from "@/lib/payments/validateCode"; // سنتعامل معه بعد قليل

export async function POST(req: Request) {
  try {
    const { userId, playgroundId, date, time, price, code } = await req.json();

    let finalPrice = price;
    let appliedCode = null;

    // لو فيه كود → نتحقق منه
    if (code && code !== "") {
      const result = await validateCode({ code, userId, price });

      if (!result.valid) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }

      finalPrice = result.finalPrice;
      appliedCode = result.code;
    }

    // إنشاء أوردر في قاعدة البيانات
    const order = await prisma.order.create({
      data: {
        userId,
        playgroundId,
        date,
        time,
        originalPrice: price,
        finalPrice,
        codeAppliedId: appliedCode?.id || null,
        status: "PENDING",
      },
    });

    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
