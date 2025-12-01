import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newCode = await prisma.code.create({
      data: {
        code: body.code,
        type: body.type,
        percent: body.percent ? Number(body.percent) : null,
        amount: body.amount ? Number(body.amount) : null,
        maxUsage: body.maxUsage ? Number(body.maxUsage) : null,
        allowedUser: body.allowedUser || null,
      },
    });

    return NextResponse.json(newCode);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Creation failed" }, { status: 500 });
  }
}
