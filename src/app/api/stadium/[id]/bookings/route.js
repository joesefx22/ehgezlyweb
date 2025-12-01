import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_, { params }) {
  const { id } = params;

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        stadiumId: Number(id)
      },
      include: {
        user: true,
        slot: true
      },
      orderBy: {
        date: "desc"
      }
    });

    return NextResponse.json(bookings);
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
