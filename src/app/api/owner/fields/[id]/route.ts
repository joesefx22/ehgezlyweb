// src/app/api/owner/fields/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const COOKIE_NAME = process.env.COOKIE_NAME || "ehg_token";
async function getSessionFromReq(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.split(";").map(s=>s.trim()).find(s=>s.startsWith(`${COOKIE_NAME}=`));
  if (!m) return null;
  const token = m.split("=")[1];
  return prisma.session.findUnique({ where: { token } });
}

const UpdateFieldSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  priceCents: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
  images: z.array(z.object({ id: z.string().optional(), url: z.string().url(), alt: z.string().optional(), order: z.number().optional() })).optional()
});

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getSessionFromReq(req);
  if (!session) return NextResponse.json({ ok:false, error: "unauthenticated" }, { status: 401 });

  const field = await prisma.field.findUnique({ where: { id: params.id }, include: { images: true, bookings: true } });
  if (!field) return NextResponse.json({ ok:false, error: "not found" }, { status: 404 });
  if (field.ownerId !== session.userId) return NextResponse.json({ ok:false, error: "forbidden" }, { status: 403 });

  return NextResponse.json({ ok:true, data: field });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ ok:false, error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const parsed = UpdateFieldSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok:false, error: "validation", issues: parsed.error.format() }, { status: 400 });

    const field = await prisma.field.findUnique({ where: { id: params.id } });
    if (!field) return NextResponse.json({ ok:false, error: "not found" }, { status: 404 });
    if (field.ownerId !== session.userId) return NextResponse.json({ ok:false, error: "forbidden" }, { status: 403 });

    // update basic fields
    const dataToUpdate:any = {};
    ["title","description","address","city","lat","lng","priceCents","active"].forEach(k=>{
      if (k in parsed.data) dataToUpdate[k] = (parsed.data as any)[k];
    });

    const updated = await prisma.field.update({
      where: { id: params.id },
      data: {
        ...dataToUpdate,
        images: parsed.data.images ? {
          // crude approach: delete all and recreate — for simplicity
          deleteMany: {},
          create: (parsed.data.images || []).map((im:any, i:number) => ({ url: im.url, alt: im.alt || null, order: im.order ?? i }))
        } : undefined
      },
      include: { images: true }
    });

    return NextResponse.json({ ok:true, data: updated });
  } catch (err) {
    console.error("owner fields PUT error:", err);
    return NextResponse.json({ ok:false, error: "server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ ok:false, error: "unauthenticated" }, { status: 401 });

    const field = await prisma.field.findUnique({ where: { id: params.id } });
    if (!field) return NextResponse.json({ ok:false, error: "not found" }, { status: 404 });
    if (field.ownerId !== session.userId) return NextResponse.json({ ok:false, error: "forbidden" }, { status: 403 });

    await prisma.field.delete({ where: { id: params.id } });
    return NextResponse.json({ ok:true });
  } catch (err) {
    console.error("owner fields DELETE error:", err);
    return NextResponse.json({ ok:false, error: "server error" }, { status: 500 });
  }
}

// src/app/api/owner/fields/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getSessionFromReq } from "@/lib/authServer";

const UpdateFieldSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  priceCents: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
  images: z.array(z.object({ id: z.string().optional(), url: z.string().url(), alt: z.string().optional(), order: z.number().optional() })).optional()
});

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getSessionFromReq(req);
  if (!session) return NextResponse.json({ ok:false, error: "unauthenticated" }, { status: 401 });

  const field = await prisma.field.findUnique({ where: { id: params.id }, include: { images: true, bookings: true } });
  if (!field) return NextResponse.json({ ok:false, error: "not found" }, { status: 404 });
  if (field.ownerId !== session.userId) return NextResponse.json({ ok:false, error: "forbidden" }, { status: 403 });

  return NextResponse.json({ ok:true, data: field });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ ok:false, error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const parsed = UpdateFieldSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok:false, error: "validation", issues: parsed.error.format() }, { status: 400 });

    const field = await prisma.field.findUnique({ where: { id: params.id } });
    if (!field) return NextResponse.json({ ok:false, error: "not found" }, { status: 404 });
    if (field.ownerId !== session.userId) return NextResponse.json({ ok:false, error: "forbidden" }, { status: 403 });

    const dataToUpdate:any = {};
    ["title","description","address","city","lat","lng","priceCents","active"].forEach(k=>{
      if (k in parsed.data) dataToUpdate[k] = (parsed.data as any)[k];
    });

    const updated = await prisma.field.update({
      where: { id: params.id },
      data: {
        ...dataToUpdate,
        images: parsed.data.images ? {
          deleteMany: {},
          create: (parsed.data.images || []).map((im:any, i:number) => ({ url: im.url, alt: im.alt || null, order: im.order ?? i }))
        } : undefined
      },
      include: { images: true }
    });

    return NextResponse.json({ ok:true, data: updated });
  } catch (err) {
    console.error("owner fields PUT error:", err);
    return NextResponse.json({ ok:false, error: "server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ ok:false, error: "unauthenticated" }, { status: 401 });

    const field = await prisma.field.findUnique({ where: { id: params.id } });
    if (!field) return NextResponse.json({ ok:false, error: "not found" }, { status: 404 });
    if (field.ownerId !== session.userId) return NextResponse.json({ ok:false, error: "forbidden" }, { status: 403 });

    await prisma.field.delete({ where: { id: params.id } });
    return NextResponse.json({ ok:true });
  } catch (err) {
    console.error("owner fields DELETE error", err);
    return NextResponse.json({ ok:false, error: "server error" }, { status: 500 });
  }
}
