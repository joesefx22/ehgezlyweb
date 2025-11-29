// src/app/api/matches/join/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const COOKIE_NAME = "ehg_token";

function tokenFromReq(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.split(";").map(s => s.trim()).find(s => s.startsWith(`${COOKIE_NAME}=`));
  return m ? m.split("=")[1] : null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { matchId } = body;
    if (!matchId) return NextResponse.json({ ok: false, error: "matchId required" }, { status: 400 });

    const token = tokenFromReq(req);
    if (!token) return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });

    const session = await prisma.session.findUnique({ where: { token } });
    if (!session) return NextResponse.json({ ok: false, error: "invalid session" }, { status: 401 });

    const userId = session.userId;

    // check match exists and status
    const match = await prisma.matchRequest.findUnique({ where: { id: matchId }, include: { participants: true }});
    if (!match) return NextResponse.json({ ok: false, error: "match not found" }, { status: 404 });
    if (match.status !== "OPEN") return NextResponse.json({ ok: false, error: "match not open" }, { status: 400 });

    // prevent creator joining as participant (optional)
    if (match.creatorId === userId) return NextResponse.json({ ok: false, error: "creator cannot join as participant" }, { status: 400 });

    // check already joined
    const existing = await prisma.participation.findFirst({ where: { matchId, userId } });
    if (existing) return NextResponse.json({ ok: false, error: "already joined" }, { status: 409 });

    // create participation
    await prisma.participation.create({ data: { matchId, userId } });

    // recalc participants count
    const participantsCount = await prisma.participation.count({ where: { matchId } });

    // if full -> update match status
    if (participantsCount >= match.playersNeeded) {
      await prisma.matchRequest.update({ where: { id: matchId }, data: { status: "FULL" } });
    }

    // optional: create notification for creator
    await prisma.notification.create({
      data: {
        userId: match.creatorId,
        title: "انضم لاعب جديد لطلبك",
        body: `هناك لاعب انضم إلى طلبك في ${match.area} بتاريخ ${match.date.toISOString()}`,
        link: `/play/${matchId}`
      }
    });

    const updatedMatch = await prisma.matchRequest.findUnique({
      where: { id: matchId },
      include: { participants: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } } }
    });

    return NextResponse.json({ ok: true, data: { participantsCount, status: updatedMatch?.status || match.status } });
  } catch (err) {
    console.error("POST /api/matches/join error:", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}

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
