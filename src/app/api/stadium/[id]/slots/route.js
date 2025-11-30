import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_, { params }) {
  const { id } = params;

  try {
    const slots = await prisma.slot.findMany({
      where: { stadiumId: Number(id) },
    });

    return NextResponse.json(slots);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  const { id } = params;
  const data = await req.json();

  try {
    const slot = await prisma.slot.create({
      data: {
        stadiumId: Number(id),
        startTime: data.startTime,
        endTime: data.endTime,
        price: Number(data.price),
        days: data.days,
      },
    });

    return NextResponse.json(slot);
  } catch {
    return NextResponse.json({ error: "Failed to create slot" }, { status: 500 });
  }
}
