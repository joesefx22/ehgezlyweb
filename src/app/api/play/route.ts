import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const date = searchParams.get("date");
  const area = searchParams.get("area");
  const level = searchParams.get("level");

  const filters: any = {};

  if (date) {
    filters.date = {
      gte: new Date(date + "T00:00:00"),
      lte: new Date(date + "T23:59:59"),
    };
  }

  if (area) filters.area = area;
  if (level) filters.level = level;

  try {
    const requests = await prisma.playRequest.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: requests });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      userId,
      playerName,
      area,
      level,
      date,
      needed,
      notes,
      phone,
    } = body;

    const newRequest = await prisma.playRequest.create({
      data: {
        userId,
        playerName,
        area,
        level,
        date: new Date(date),
        needed,
        notes,
        phone,
      },
    });

    return NextResponse.json({ success: true, data: newRequest });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
