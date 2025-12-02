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
