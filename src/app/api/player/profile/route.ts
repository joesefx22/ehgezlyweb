import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req) {
  try {
    const body = await req.json();

    const { playerId, name, age, level, area, phone, avatar } = body;

    if (!playerId)
      return NextResponse.json(
        { error: "playerId is required" },
        { status: 400 }
      );

    const updated = await prisma.player.update({
      where: { id: Number(playerId) },
      data: {
        name,
        age,
        level,
        area,
        phone,
        avatar,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Error updating profile" },
      { status: 500 }
    );
  }
}

// src/app/api/player/profile/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

const COOKIE_NAME = "ehg_token";
function tokenFromReq(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.split(";").map(s => s.trim()).find(s => s.startsWith(`${COOKIE_NAME}=`));
  return m ? m.split("=")[1] : null;
}

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
async function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function PUT(req: Request) {
  try {
    const token = tokenFromReq(req);
    if (!token) return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
    const session = await prisma.session.findUnique({ where: { token }, include: { user: true } });
    if (!session) return NextResponse.json({ ok: false, error: "invalid session" }, { status: 401 });

    const body = await req.json();
    const updates: any = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.email !== undefined) updates.email = body.email;
    if (body.avatarBase64) {
      await ensureUploadDir();
      const base64: string = body.avatarBase64;
      const matches = base64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
      if (!matches) return NextResponse.json({ ok: false, error: "invalid image" }, { status: 400 });
      const mime = matches[1];
      const data = matches[2];
      const ext = mime.split("/")[1];
      const fileName = `${session.userId}-${Date.now()}.${ext}`;
      const filePath = path.join(UPLOAD_DIR, fileName);
      fs.writeFileSync(filePath, Buffer.from(data, "base64"));
      updates.avatarUrl = "/uploads/" + fileName;
    }

    const user = await prisma.user.update({ where: { id: session.userId }, data: updates, select: { id: true, name: true, email: true, avatarUrl: true, role: true } });

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error("player/profile PUT", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
