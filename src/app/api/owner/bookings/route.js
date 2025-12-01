import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const ownerId = 1; // لاحقاً هتيجي من السيشن

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        stadium: {
          ownerId: ownerId,
        },
      },
      include: {
        user: true,
        stadium: true,
        slot: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);
  } catch (err) {
    return NextResponse.json({ error: "Failed to load bookings" }, { status: 500 });
  }
}
