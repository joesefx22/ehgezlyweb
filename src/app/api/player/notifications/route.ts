import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ notifications });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

// src/app/api/player/notifications/route.ts
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

    const notes = await prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: [{ read: "asc" }, { createdAt: "desc" }],
      take: 100
    });
    return NextResponse.json({ ok: true, data: notes });
  } catch (err) {
    console.error("player/notifications GET", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const token = tokenFromReq(req);
    if (!token) return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session) return NextResponse.json({ ok: false, error: "invalid session" }, { status: 401 });

    const body = await req.json();
    // body: { action: 'mark-read', id: '<notificationId>' } OR { action: 'mark-all' }
    if (body.action === "mark-read" && body.id) {
      await prisma.notification.updateMany({ where: { id: body.id, userId: session.userId }, data: { read: true } });
      return NextResponse.json({ ok: true });
    }
    if (body.action === "mark-all") {
      await prisma.notification.updateMany({ where: { userId: session.userId }, data: { read: true } });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "invalid action" }, { status: 400 });
  } catch (err) {
    console.error("player/notifications POST", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
