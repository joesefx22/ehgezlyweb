import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  const { bookingId } = params;
  const { status } = await req.json();

  try {
    const updated = await prisma.booking.update({
      where: { id: Number(bookingId) },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
