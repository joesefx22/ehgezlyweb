// src/app/api/owner/fields/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// util to read session token — adjust to your auth implementation
const COOKIE_NAME = process.env.COOKIE_NAME || "ehg_token";
async function getSessionFromReq(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.split(";").map(s=>s.trim()).find(s=>s.startsWith(`${COOKIE_NAME}=`));
  if (!m) return null;
  const token = m.split("=")[1];
  return prisma.session.findUnique({ where: { token } });
}

const CreateFieldSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  address: z.string().min(3),
  city: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  priceCents: z.number().int().min(0).optional(),
  images: z.array(z.object({ url: z.string().url(), alt: z.string().optional() })).optional()
});

export async function GET(req: Request) {
  const session = await getSessionFromReq(req);
  if (!session) return NextResponse.json({ ok:false, error: "unauthenticated" }, { status: 401 });

  const fields = await prisma.field.findMany({
    where: { ownerId: session.userId },
    include: { images: true, bookings: { take: 5, orderBy: { startAt: "desc" } } }
  });
  return NextResponse.json({ ok: true, data: fields });
}

export async function POST(req: Request) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ ok:false, error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const parsed = CreateFieldSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok:false, error: "validation", issues: parsed.error.format() }, { status: 400 });
    const data = parsed.data;

    const created = await prisma.field.create({
      data: {
        owner: { connect: { id: session.userId } },
        title: data.title,
        description: data.description || null,
        address: data.address,
        city: data.city || null,
        lat: data.lat || null,
        lng: data.lng || null,
        priceCents: data.priceCents ?? 0,
        images: { create: (data.images || []).map((im:any, i:number) => ({ url: im.url, alt: im.alt || null, order: i })) }
      },
      include: { images: true }
    });

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (err) {
    console.error("owner fields POST error:", err);
    return NextResponse.json({ ok:false, error: "server error" }, { status: 500 });
  }
}
