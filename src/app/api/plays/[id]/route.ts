import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req, { params }) {
  try {
    const play = await db.play.findUnique({
      where: { id: params.id },
    });

    if (!play) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(play);
  } catch (e) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
