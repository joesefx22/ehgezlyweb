// src/app/api/player/requests/route.ts
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

    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "all"; // created | joined | all
    const limit = Number(url.searchParams.get("limit") || 50);

    if (type === "created") {
      const created = await prisma.playRequest.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: { participants: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } } }
      });
      return NextResponse.json({ ok: true, data: created });
    }

    if (type === "joined") {
      const joined = await prisma.participation.findMany({
        where: { userId: session.userId },
        take: limit,
        orderBy: { joinedAt: "desc" },
        include: { match: true }
      });
      return NextResponse.json({ ok: true, data: joined });
    }

    // default all (both created and joined)
    const [created, joined] = await Promise.all([
      prisma.playRequest.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.participation.findMany({
        where: { userId: session.userId },
        orderBy: { joinedAt: "desc" },
        take: limit,
        include: { match: true }
      })
    ]);

    return NextResponse.json({ ok: true, data: { created, joined } });
  } catch (err) {
    console.error("player/requests error:", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
