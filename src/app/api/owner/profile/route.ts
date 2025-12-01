// src/app/api/owner/profile/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromReq } from "@/lib/authServer";
import { z } from "zod";
import bcrypt from "bcrypt";

const UpdateProfile = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional()
});

const ChangePassword = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6)
});

export async function GET(req: Request) {
  const session = await getSessionFromReq(req);
  if (!session) return NextResponse.json({ ok:false, error: "unauthenticated" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { id:true, name:true, email:true, phone:true, avatar:true, role:true }});
  return NextResponse.json({ ok:true, data: user });
}

export async function PUT(req: Request) {
  const session = await getSessionFromReq(req);
  if (!session) return NextResponse.json({ ok:false, error: "unauthenticated" }, { status: 401 });
  const body = await req.json();
  const parsed = UpdateProfile.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok:false, error:"validation", issues: parsed.error.format() }, { status: 400 });

  const updated = await prisma.user.update({ where: { id: session.userId }, data: parsed.data });
  return NextResponse.json({ ok:true, data: updated });
}

// change password
export async function POST(req: Request) {
  // use POST for /change-password (same route) — or create separate route if you prefer
  const session = await getSessionFromReq(req);
  if (!session) return NextResponse.json({ ok:false, error: "unauthenticated" }, { status: 401 });
  const body = await req.json();
  const parsed = ChangePassword.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok:false, error:"validation", issues: parsed.error.format() }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.userId }});
  if (!user) return NextResponse.json({ ok:false, error: "not found" }, { status: 404 });

  const match = await bcrypt.compare(parsed.data.oldPassword, user.passwordHash || "");
  if (!match) return NextResponse.json({ ok:false, error: "wrong_password" }, { status: 400 });

  const hash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: session.userId }, data: { passwordHash: hash } });

  return NextResponse.json({ ok:true });
}
