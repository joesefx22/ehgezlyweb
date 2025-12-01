import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { code, userId } = await req.json();

    const found = await prisma.code.findUnique({ where: { code } });

    if (!found || !found.isActive) {
      return NextResponse.json({ valid: false, reason: "INVALID_CODE" });
    }

    if (found.expiresAt && found.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, reason: "EXPIRED" });
    }

    if (found.usedCount >= found.maxUsage) {
      return NextResponse.json({ valid: false, reason: "USAGE_LIMIT" });
    }

    // لو الكود تعويض مرتبط بمستخدم معين
    if (found.type === "COMPENSATION" && found.ownerId && found.ownerId !== userId) {
      return NextResponse.json({ valid: false, reason: "NOT_ALLOWED" });
    }

    return NextResponse.json({
      valid: true,
      code: found,
      discount: found.amount || found.percent
    });

  } catch (e) {
    return NextResponse.json({ valid: false, reason: "SERVER_ERROR" });
  }
}
