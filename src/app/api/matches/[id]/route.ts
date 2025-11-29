// src/app/api/matches/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

    const match = await prisma.matchRequest.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
        participants: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
      },
    });

    if (!match) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

    // prepare response shape
    const payload = {
      id: match.id,
      title: match.title,
      description: match.description,
      area: match.area,
      level: match.level,
      date: match.date,
      playersNeeded: match.playersNeeded,
      status: match.status,
      creator: match.creator,
      participants: match.participants.map(p => ({ id: p.id, user: p.user, joinedAt: p.joinedAt })),
      createdAt: match.createdAt,
    };

    return NextResponse.json({ ok: true, data: payload });
  } catch (err) {
    console.error("GET /api/matches/[id] error:", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
