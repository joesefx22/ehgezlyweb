import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const date = searchParams.get("date");
  const area = searchParams.get("area");
  const level = searchParams.get("level");

  const filters: any = {};

  if (date) {
    filters.date = {
      gte: new Date(date + "T00:00:00"),
      lte: new Date(date + "T23:59:59"),
    };
  }

  if (area) filters.area = area;
  if (level) filters.level = level;

  try {
    const requests = await prisma.playRequest.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: requests });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      userId,
      playerName,
      area,
      level,
      date,
      needed,
      notes,
      phone,
    } = body;

    const newRequest = await prisma.playRequest.create({
      data: {
        userId,
        playerName,
        area,
        level,
        date: new Date(date),
        needed,
        notes,
        phone,
      },
    });

    return NextResponse.json({ success: true, data: newRequest });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

// src/app/api/play/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getSessionFromReq } from "@/lib/authServer";

const CreateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().max(1000).optional(),
  area: z.string().min(2),
  level: z.enum(["beginner","intermediate","advanced","pro"]),
  date: z.string(),
  playersNeeded: z.number().int().min(1).max(20)
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const search = url.searchParams.get("search") || undefined;
  const page = Number(url.searchParams.get("page") || "1");
  const limit = Number(url.searchParams.get("limit") || "12");

  const where:any = {};
  if (search) where.OR = [{ area: { contains: search } }, { description: { contains: search } }, { title: { contains: search } }];

  const total = await prisma.playRequest.count({ where });
  const items = await prisma.playRequest.findMany({
    where,
    include: { participants: { include: { user: true } }, creator: true },
    orderBy: { date: "asc" },
    skip: (page-1)*limit,
    take: limit
  });

  return NextResponse.json({ ok:true, data: { items, total, totalPages: Math.max(1, Math.ceil(total/limit)) }});
}

export async function POST(req: Request) {
  const session = await getSessionFromReq(req);
  if (!session) return NextResponse.json({ ok:false, error: "unauthenticated" }, { status: 401 });

  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok:false, error: "validation", issues: parsed.error.format() }, { status: 400 });

  const created = await prisma.playRequest.create({
    data: {
      title: parsed.data.title || null,
      description: parsed.data.description || null,
      area: parsed.data.area,
      level: parsed.data.level,
      date: new Date(parsed.data.date),
      playersNeeded: parsed.data.playersNeeded,
      creator: { connect: { id: session.userId } }
    },
    include: { creator: true }
  });

  return NextResponse.json({ ok:true, data: created }, { status: 201 });
}
