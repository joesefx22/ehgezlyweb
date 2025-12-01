import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, type, amount, percent, maxUsage, expiresAt, createdById, ownerId } = body;

    const newCode = await prisma.code.create({
      data: {
        code,
        type,
        amount,
        percent,
        maxUsage,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdById,
        ownerId: ownerId || null
      }
    });

    return NextResponse.json({ success: true, code: newCode });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ success: false, message: "Error creating code" }, { status: 500 });
  }
}
