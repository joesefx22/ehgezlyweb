import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { code, userId, bookingId } = await req.json();

    const c = await prisma.code.findUnique({ where: { code } });

    if (!c) return NextResponse.json({ ok: false });

    // update count
    await prisma.code.update({
      where: { code },
      data: { used: c.used + 1 },
    });

    // add usage log
    await prisma.codeUsage.create({
      data: {
        codeId: c.id,
        userId,
        bookingId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Error using code" }, { status: 500 });
  }
}
