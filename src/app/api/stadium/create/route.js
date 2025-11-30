import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const data = await req.json();

    const stadium = await prisma.stadium.create({
      data: {
        name: data.name,
        price: Number(data.price),
        location: data.location,
        size: data.size,
        ownerId: data.ownerId || 1, // انت هتعدلها حسب السيشن
      },
    });

    return NextResponse.json(stadium);
  } catch (err) {
    return NextResponse.json({ error: "Failed to create stadium" }, { status: 500 });
  }
}
