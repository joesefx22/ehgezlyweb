import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const ownerId = 1; // هتربطها بالسيشن بعدين

    const stadiums = await prisma.stadium.findMany({
      where: { ownerId },
    });

    return NextResponse.json(stadiums);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch stadiums" }, { status: 500 });
  }
}
