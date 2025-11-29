// src/app/api/matches/join/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const COOKIE_NAME = "ehg_token";

function getToken(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.split(";").map(s => s.trim()).find(s => s.startsWith(`${COOKIE_NAME}=`));
  return match ? match.split("=")[1] : null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { matchId } = body;
    if (!matchId) return NextResponse.json({ ok: false, error: "matchId required" }, { status: 400 });

    const token = getToken(req);
    if (!token) return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });

    const session = await prisma.session.findUnique({ where: { token }, include: { user: true } });
    if (!session) return NextResponse.json({ ok: false, error: "invalid session" }, { status: 401 });

    // check if already participant
    const exists = await prisma.participation.findFirst({ where: { matchId, userId: session.userId } });
    if (exists) return NextResponse.json({ ok: false, error: "already joined" }, { status: 409 });

    const match = await prisma.matchRequest.findUnique({ where: { id: matchId }, include: { participants: true }});
    if (!match) return NextResponse.json({ ok: false, error: "match not found" }, { status: 404 });
    if (match.status !== "OPEN") return NextResponse.json({ ok: false, error: "match not open" }, { status: 400 });

    // create participation
    await prisma.participation.create({ data: { matchId, userId: session.userId } });

    // update status if full
    const participantsCount = await prisma.participation.count({ where: { matchId } });
    if (participantsCount >= match.playersNeeded) {
      await prisma.matchRequest.update({ where: { id: matchId }, data: { status: "FULL" } });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("join POST error", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
