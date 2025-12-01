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
