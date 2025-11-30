// src/app/api/stadium/[id]/staff/[staffId]/attendance/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getSessionFromReq } from "@/lib/authServer";

const CreateAttendanceSchema = z.object({
  date: z.string().refine(s => !Number.isNaN(Date.parse(s)), { message: "Invalid date" }),
  present: z.boolean().optional(),
  note: z.string().optional()
});

export async function GET(req: Request, { params }: { params: { id: string, staffId: string } }) {
  const session = await getSessionFromReq(req);
  if (!session) return NextResponse.json({ ok:false, error:"unauthenticated" }, { status: 401 });

  const stadiumId = Number(params.id);
  const staffId = Number(params.staffId);
  const stadium = await prisma.stadium.findUnique({ where: { id: stadiumId } });
  if (!stadium || stadium.ownerId !== session.userId) return NextResponse.json({ ok:false, error:"forbidden" }, { status: 403 });

  const attendances = await prisma.staffAttendance.findMany({
    where: { staffId },
    orderBy: { date: "desc" }
  });

  return NextResponse.json({ ok:true, data: attendances });
}

export async function POST(req: Request, { params }: { params: { id: string, staffId: string } }) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ ok:false, error:"unauthenticated" }, { status: 401 });

    const stadiumId = Number(params.id);
    const staffId = Number(params.staffId);
    const stadium = await prisma.stadium.findUnique({ where: { id: stadiumId } });
    if (!stadium || stadium.ownerId !== session.userId) return NextResponse.json({ ok:false, error:"forbidden" }, { status: 403 });

    const body = await req.json();
    const parsed = CreateAttendanceSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok:false, error:"validation", issues: parsed.error.format() }, { status: 400 });

    const att = await prisma.staffAttendance.create({
      data: { staff: { connect: { id: staffId } }, date: new Date(parsed.data.date), present: parsed.data.present ?? true, note: parsed.data.note ?? null }
    });

    return NextResponse.json({ ok:true, data: att }, { status: 201 });
  } catch (err) {
    console.error("attendance error:", err);
    return NextResponse.json({ ok:false, error:"server_error" }, { status: 500 });
  }
}
