// src/app/api/player/create-request/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const COOKIE_NAME = "ehg_token";

function tokenFromReq(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.split(";").map(s => s.trim()).find(s => s.startsWith(`${COOKIE_NAME}=`));
  return m ? m.split("=")[1] : null;
}

const BodySchema = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().max(1000).optional(),
  area: z.string().min(2).max(200),
  level: z.enum(["beginner","intermediate","advanced","pro"]),
  date: z.string().refine(s => !Number.isNaN(Date.parse(s)), { message: "Invalid date" }),
  playersNeeded: z.number().int().min(1).max(20),
});

export async function POST(req: Request) {
  try {
    const token = tokenFromReq(req);
    if (!token) return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });

    const session = await prisma.session.findUnique({ where: { token } });
    if (!session) return NextResponse.json({ ok: false, error: "invalid session" }, { status: 401 });

    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "validation error", issues: parsed.error.format() }, { status: 400 });
    }
    const data = parsed.data;

    const created = await prisma.playRequest.create({
      data: {
        title: data.title || null,
        description: data.description || null,
        area: data.area,
        level: data.level,
        date: new Date(data.date),
        playersNeeded: data.playersNeeded,
        creator: { connect: { id: session.userId } }
      }
    });

    // optional: create notification for followers or so (skip)

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (err) {
    console.error("create-request POST error:", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
