import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  const { bookingId } = params;
  const body = await req.json();

  try {
    const booking = await prisma.booking.update({
      where: { id: Number(bookingId) },
      data: { status: body.status },
    });

    return NextResponse.json(booking);
  } catch {
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  const { bookingId } = params;

  try {
    await prisma.booking.delete({
      where: { id: Number(bookingId) }
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
