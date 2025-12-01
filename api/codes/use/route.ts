import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { code, userId, bookingId } = await req.json();

    const found = await prisma.code.findUnique({ where: { code } });

    if (!found) return NextResponse.json({ success: false, reason: "INVALID" });

    await prisma.$transaction([
      prisma.codeUsage.create({
        data: {
          codeId: found.id,
          userId,
          bookingId
        }
      }),
      prisma.code.update({
        where: { id: found.id },
        data: {
          usedCount: { increment: 1 }
        }
      })
    ]);

    return NextResponse.json({ success: true });

  } catch (e) {
    return NextResponse.json({ success: false });
  }
}
