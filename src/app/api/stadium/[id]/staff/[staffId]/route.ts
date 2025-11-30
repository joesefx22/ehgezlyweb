// src/app/api/stadium/[id]/staff/[staffId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getSessionFromReq } from "@/lib/authServer";

const UpdateStaffSchema = z.object({
  role: z.enum(["MANAGER","WORKER","CLEANER","SECURITY"]).optional(),
  active: z.boolean().optional()
});

export async function PUT(req: Request, { params }: { params: { id: string, staffId: string } }) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ ok:false, error:"unauthenticated" }, { status: 401 });

    const stadiumId = Number(params.id);
    const staffId = Number(params.staffId);
    const stadium = await prisma.stadium.findUnique({ where: { id: stadiumId } });
    if (!stadium || stadium.ownerId !== session.userId) return NextResponse.json({ ok:false, error:"forbidden" }, { status: 403 });

    const staff = await prisma.staff.findUnique({ where: { id: staffId } });
    if (!staff || staff.stadiumId !== stadiumId) return NextResponse.json({ ok:false, error:"not_found" }, { status: 404 });

    const body = await req.json();
    const parsed = UpdateStaffSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok:false, error:"validation", issues: parsed.error.format() }, { status: 400 });

    const updated = await prisma.staff.update({
      where: { id: staffId },
      data: { ...(parsed.data.role ? { role: parsed.data.role } : {}), ...(parsed.data.active !== undefined ? { active: parsed.data.active } : {}) },
      include: { user: true }
    });

    return NextResponse.json({ ok:true, data: updated });
  } catch (err) {
    console.error("update staff error:", err);
    return NextResponse.json({ ok:false, error:"server_error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string, staffId: string } }) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ ok:false, error:"unauthenticated" }, { status: 401 });

    const stadiumId = Number(params.id);
    const staffId = Number(params.staffId);
    const stadium = await prisma.stadium.findUnique({ where: { id: stadiumId } });
    if (!stadium || stadium.ownerId !== session.userId) return NextResponse.json({ ok:false, error:"forbidden" }, { status: 403 });

    const staff = await prisma.staff.findUnique({ where: { id: staffId } });
    if (!staff || staff.stadiumId !== stadiumId) return NextResponse.json({ ok:false, error:"not_found" }, { status: 404 });

    await prisma.staff.delete({ where: { id: staffId } });
    return NextResponse.json({ ok:true });
  } catch (err) {
    console.error("delete staff error:", err);
    return NextResponse.json({ ok:false, error:"server_error" }, { status: 500 });
  }
}
