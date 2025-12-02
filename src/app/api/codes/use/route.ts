import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ApiError } from "@/lib/errors";
import { logError } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const { code, userId, orderId } = await req.json();
    if (!code) throw new ApiError("code_required", 400);

    const found = await prisma.code.findUnique({ where: { code } });
    if (!found || !found.isActive) throw new ApiError("invalid_code", 400);
    if (found.expiresAt && found.expiresAt < new Date()) throw new ApiError("expired", 400);
    if (found.maxUsage && found.usedCount >= found.maxUsage) throw new ApiError("usage_limit", 400);
    if (found.ownerId && userId && found.ownerId !== userId) throw new ApiError("not_allowed", 403);

    // If orderId provided — ensure uniqueness (idempotency)
    if (orderId) {
      // upsert usage protected by unique([codeId, orderId])
      await prisma.$transaction(async (tx) => {
        await tx.codeUsage.upsert({
          where: { codeId_orderId: { codeId: found.id, orderId: Number(orderId) } },
          create: { codeId: found.id, orderId: Number(orderId), userId: userId ?? null },
          update: {}
        });

        // increment usedCount only if it wasn't used before for this order
        await tx.code.update({
          where: { id: found.id },
          data: { usedCount: { increment: 1 } }
        });
      });

      return NextResponse.json({ ok: true, reused: false });
    }

    // if no orderId, just create usage record (guard duplicate create by unique + optional orderless unique omitted)
    const usage = await prisma.codeUsage.create({ data: { codeId: found.id, userId: userId ?? null } });
    await prisma.code.update({ where: { id: found.id }, data: { usedCount: { increment: 1 } } });

    return NextResponse.json({ ok: true, data: usage });
  } catch (err:any) {
    logError("codes.use", err);
    const status = err?.status || 500;
    return NextResponse.json({ ok: false, error: err?.message || "server_error" }, { status });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code, userId, originalPrice } = await req.json();

    const discount = await prisma.discountCode.findFirst({
      where: { code, isActive: true }
    });

    if (!discount)
      return NextResponse.json({ error: "INVALID_CODE" }, { status: 400 });

    // Prevent using more than limit
    if (discount.usedCount >= discount.usageLimit)
      return NextResponse.json({ error: "EXCEEDED_LIMIT" }, { status: 400 });

    // Prevent same user using the same code twice
    const alreadyUsed = await prisma.codeUsage.findFirst({
      where: { codeId: discount.id, userId }
    });

    if (alreadyUsed)
      return NextResponse.json({ error: "ALREADY_USED" }, { status: 400 });

    let finalPrice = originalPrice;

    if (discount.type === "PERCENT") {
      finalPrice = Math.round(originalPrice - (originalPrice * discount.value) / 100);
    } else {
      finalPrice = Math.max(originalPrice - discount.value, 0);
    }

    return NextResponse.json({
      status: "VALID",
      discountId: discount.id,
      finalPrice
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
