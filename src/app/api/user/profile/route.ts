// src/app/api/user/profile/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

async function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    // read token from cookie
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.split(";").map(s => s.trim()).find(s => s.startsWith("ehg_token="));
    const token = match ? match.split("=")[1] : null;
    if (!token) return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });

    const session = await prisma.session.findUnique({ where: { token }, include: { user: true } });
    if (!session) return NextResponse.json({ ok: false, error: "invalid session" }, { status: 401 });

    const userId = session.userId;
    const updates: any = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.email !== undefined) updates.email = body.email;

    // handle avatarBase64 (data:url)
    if (body.avatarBase64) {
      await ensureUploadDir();
      const base64: string = body.avatarBase64;
      // extract mime and data
      const matches = base64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
      if (!matches) {
        return NextResponse.json({ ok: false, error: "invalid image" }, { status: 400 });
      }
      const mime = matches[1];
      const data = matches[2];
      const ext = mime.split("/")[1];
      const fileName = `${userId}-${Date.now()}.${ext}`;
      const filePath = path.join(UPLOAD_DIR, fileName);
      fs.writeFileSync(filePath, Buffer.from(data, "base64"));
      updates.avatarUrl = "/uploads/" + fileName;
    }

    const user = await prisma.user.update({ where: { id: userId }, data: updates, select: { id: true, name: true, email: true, role: true, avatarUrl: true } });

    return NextResponse.json({ ok: true, user, avatarUrl: user.avatarUrl });
  } catch (err) {
    console.error("profile PUT error", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
