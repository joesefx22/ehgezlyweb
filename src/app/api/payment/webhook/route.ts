import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.obj) return NextResponse.json({ error: "invalid" });

  const orderId = body?.obj?.order?.merchant_order_id;
  const success = body?.obj?.success;

  if (!orderId) return NextResponse.json({ status: "ignored" });

  // تحديث حالة الأوردر
  if (success) {
    await prisma.order.update({
      where: { id: Number(orderId) },
      data: { status: "PAID" },
    });

    // تفعيل الكود (خصم – تعويض – خصم نسبة)
    await prisma.codeUsage.create({
      data: {
        orderId: Number(orderId),
        codeId: body?.obj?.codeAppliedId || null,
      },
    });
  }

  return NextResponse.json({ status: "ok" });
}
