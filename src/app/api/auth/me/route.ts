// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const COOKIE_NAME = "ehg_token";

export async function GET(req: Request) {
  try {
    // قراءة الكوكي من الهيدر (NextRequest.nextUrl.cookies موجود في middleware فقط)
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.split(";").map(s=>s.trim()).find(s => s.startsWith(`${COOKIE_NAME}=`));
    const token = match ? match.split("=")[1] : null;

    if (!token) return NextResponse.json({ ok: false, user: null }, { status: 401 });

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: { select: { id: true, email: true, name: true, role: true } } }
    });

    if (!session || session.expiresAt.getTime() < Date.now()) {
      // delete expired session
      if (session) await prisma.session.delete({ where: { id: session.id }});
      return NextResponse.json({ ok: false, user: null }, { status: 401 });
    }

    return NextResponse.json({ ok: true, user: session.user });
  } catch (err) {
    console.error("me route error:", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
