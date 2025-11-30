import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_, { params }) {
  const { id } = params;

  try {
    const stadium = await prisma.stadium.findUnique({
      where: { id: Number(id) },
      include: { images: true },
    });

    return NextResponse.json(stadium);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
export async function PUT(req, { params }) {
  const { id } = params;
  const data = await req.json();

  try {
    const stadium = await prisma.stadium.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        price: Number(data.price),
        size: data.size,
        location: data.location,
        active: data.active,
      },
    });

    return NextResponse.json(stadium);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  const { id } = params;

  try {
    await prisma.stadium.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
