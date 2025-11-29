// src/app/api/player/request/cancel/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const COOKIE_NAME = "ehg_token";
function tokenFromReq(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.split(";").map(s => s.trim()).find(s => s.startsWith(`${COOKIE_NAME}=`));
  return m ? m.split("=")[1] : null;
}

// body: { action: 'cancelRequest', requestId } or { action: 'leave', matchId }
export async function POST(req: Request) {
  try {
    const token = tokenFromReq(req);
    if (!token) return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session) return NextResponse.json({ ok: false, error: "invalid session" }, { status: 401 });

    const body = await req.json();
    if (body.action === "cancelRequest" && body.requestId) {
      // only creator can cancel
      const reqItem = await prisma.playRequest.findUnique({ where: { id: body.requestId }});
      if (!reqItem) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
      if (reqItem.userId !== session.userId) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

      await prisma.playRequest.update({ where: { id: body.requestId }, data: { status: "CANCELLED" }});
      // notify participants (optional)
      return NextResponse.json({ ok: true });
    }

    if (body.action === "leave" && body.matchId) {
      await prisma.participation.deleteMany({ where: { matchId: body.matchId, userId: session.userId }});
      // recalc status if needed
      const match = await prisma.playRequest.findUnique({ where: { id: body.matchId }, include: { participants: true }});
      if (match && match.status === "FULL" && match.participants.length < match.needed) {
        await prisma.playRequest.update({ where: { id: body.matchId }, data: { status: "OPEN" }});
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "invalid action" }, { status: 400 });
  } catch (err) {
    console.error("player/request/cancel error", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
