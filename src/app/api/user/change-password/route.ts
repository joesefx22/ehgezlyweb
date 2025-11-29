// src/app/api/user/change-password/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { currentPassword, newPassword } = body;

    const cookie = req.headers.get("cookie") || "";
    const match = cookie.split(";").map(s => s.trim()).find(s => s.startsWith("ehg_token="));
    const token = match ? match.split("=")[1] : null;
    if (!token) return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });

    const session = await prisma.session.findUnique({ where: { token }, include: { user: true } });
    if (!session) return NextResponse.json({ ok: false, error: "invalid session" }, { status: 401 });

    const user = session.user;
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return NextResponse.json({ ok: false, error: "invalid current password" }, { status: 403 });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("change-password error", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
