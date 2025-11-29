// src/app/api/player/history/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const COOKIE_NAME = "ehg_token";
function tokenFromReq(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.split(";").map(s => s.trim()).find(s => s.startsWith(`${COOKIE_NAME}=`));
  return m ? m.split("=")[1] : null;
}

export async function GET(req: Request) {
  try {
    const token = tokenFromReq(req);
    if (!token) return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session) return NextResponse.json({ ok: false, error: "invalid session" }, { status: 401 });

    // matches the user created and are PLAYED
    const createdPlayed = await prisma.playRequest.findMany({
      where: { userId: session.userId, status: "PLAYED" },
      orderBy: { createdAt: "desc" }
    });

    // matches the user joined and are PLAYED
    const joinedPlayed = await prisma.participation.findMany({
      where: { userId: session.userId },
      include: { match: { where: { status: "PLAYED" } } },
      orderBy: { joinedAt: "desc" }
    });

    return NextResponse.json({ ok: true, data: { createdPlayed, joinedPlayed } });
  } catch (err) {
    console.error("player/history GET", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
