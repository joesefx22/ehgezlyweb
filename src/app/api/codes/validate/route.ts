import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { code, userId } = await req.json();

    const c = await prisma.code.findUnique({
      where: { code },
    });

    if (!c) return NextResponse.json({ valid: false, message: "كود غير صالح" });

    // check usage limit
    if (c.maxUsage && c.used >= c.maxUsage)
      return NextResponse.json({ valid: false, message: "تم استخدام الكود بالكامل" });

    // check if user is allowed
    if (c.allowedUser && c.allowedUser !== userId)
      return NextResponse.json({ valid: false, message: "لا يمكنك استخدام هذا الكود" });

    return NextResponse.json({
      valid: true,
      type: c.type,
      percent: c.percent,
      amount: c.amount,
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Validation error" }, { status: 500 });
  }
}
