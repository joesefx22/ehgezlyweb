// src/app/api/auth/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

type Body = {
  action?: string;
  email?: string;
  password?: string;
  name?: string;
  role?: string;
  token?: string;
};

const COOKIE_NAME = "ehg_token";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export async function POST(req: Request) {
  try {
    const body: Body = await req.json();
    const action = (body.action || "").toLowerCase();

    if (action === "signup") {
      const { email, password, name, role } = body;
      if (!email || !password) return NextResponse.json({ ok: false, error: "email and password required" }, { status: 400 });

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return NextResponse.json({ ok: false, error: "email already registered" }, { status: 409 });

      const hashed = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, password: hashed, name: name || null, role: (role as any) || "PLAYER" },
        select: { id: true, email: true, name: true, role: true }
      });

      return NextResponse.json({ ok: true, user });
    }

    if (action === "login") {
      const { email, password } = body;
      if (!email || !password) return NextResponse.json({ ok: false, error: "email and password required" }, { status: 400 });

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return NextResponse.json({ ok: false, error: "invalid credentials" }, { status: 401 });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return NextResponse.json({ ok: false, error: "invalid credentials" }, { status: 401 });

      // Create session token (simple random token)
      const token = `${Math.random().toString(36).slice(2)}${Date.now()}`;
      const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

      await prisma.session.create({
        data: { token, userId: user.id, expiresAt }
      });

      const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, role: user.role }, token });
      // Set cookie
      res.headers.set("Set-Cookie", `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS/1000)}`);
      return res;
    }

    if (action === "logout") {
      const { token } = body;
      if (!token) return NextResponse.json({ ok: false, error: "token required" }, { status: 400 });

      await prisma.session.deleteMany({ where: { token } });

      const res = NextResponse.json({ ok: true });
      res.headers.set("Set-Cookie", `${COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0`);
      return res;
    }

    return NextResponse.json({ ok: false, error: "invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Auth route error:", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
