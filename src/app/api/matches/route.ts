// src/app/api/matches/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Body = {
  action?: string;
  title?: string;
  description?: string;
  location?: string;
  pitchId?: string;
  date?: string;
  timeSlot?: string;
  playersNeeded?: number;
};

const COOKIE_NAME = "ehg_token";

function getTokenFromReq(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.split(";").map(s => s.trim()).find(s => s.startsWith(`${COOKIE_NAME}=`));
  return match ? match.split("=")[1] : null;
}

export async function GET(req: Request) {
  try {
    // simple query params: ?status=OPEN&limit=20
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || undefined;
    const limit = Number(url.searchParams.get("limit") || 50);

    const where = status ? { status } : {};
    const matches = await prisma.matchRequest.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { creator: { select: { id: true, name: true, avatarUrl: true } }, participants: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } } }
    });

    return NextResponse.json({ ok: true, matches });
  } catch (err) {
    console.error("matches GET error", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: Body = await req.json();
    const token = getTokenFromReq(req);
    if (!token) return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });

    const session = await prisma.session.findUnique({ where: { token }, include: { user: true } });
    if (!session) return NextResponse.json({ ok: false, error: "invalid session" }, { status: 401 });

    // minimal validation
    if (!body.title || !body.location || !body.date) {
      return NextResponse.json({ ok: false, error: "missing fields" }, { status: 400 });
    }

    const date = new Date(body.date);
    const mr = await prisma.matchRequest.create({
      data: {
        title: body.title,
        description: body.description || null,
        location: body.location,
        pitchId: body.pitchId || null,
        date,
        timeSlot: body.timeSlot || null,
        playersNeeded: body.playersNeeded ?? 1,
        creator: { connect: { id: session.userId } }
      },
      include: { creator: { select: { id: true, name: true, avatarUrl: true } } }
    });

    return NextResponse.json({ ok: true, match: mr });
  } catch (err) {
    console.error("matches POST error", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
