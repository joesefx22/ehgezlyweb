// src/app/api/stadium/[id]/staff/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getSessionFromReq } from "@/lib/authServer";

const CreateStaffSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["MANAGER","WORKER","CLEANER","SECURITY"]).optional()
});

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getSessionFromReq(req);
  if (!session) return NextResponse.json({ ok:false, error:"unauthenticated" }, { status: 401 });

  const stadiumId = Number(params.id);

  // verify owner
  const stadium = await prisma.stadium.findUnique({ where: { id: stadiumId } });
  if (!stadium || stadium.ownerId !== session.userId) return NextResponse.json({ ok:false, error:"forbidden" }, { status: 403 });

  const staff = await prisma.staff.findMany({
    where: { stadiumId },
    include: { user: true, attendances: { take: 10, orderBy: { date: "desc" } } }
  });

  return NextResponse.json({ ok:true, data: staff });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ ok:false, error:"unauthenticated" }, { status: 401 });

    const stadiumId = Number(params.id);
    const stadium = await prisma.stadium.findUnique({ where: { id: stadiumId } });
    if (!stadium || stadium.ownerId !== session.userId) return NextResponse.json({ ok:false, error:"forbidden" }, { status: 403 });

    const body = await req.json();
    const parsed = CreateStaffSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok:false, error:"validation", issues: parsed.error.format() }, { status: 400 });

    const { userId, role } = parsed.data;

    // check duplicate
    const exists = await prisma.staff.findFirst({ where: { stadiumId, userId }});
    if (exists) return NextResponse.json({ ok:false, error:"already_assigned" }, { status: 400 });

    const staff = await prisma.staff.create({
      data: { stadium: { connect: { id: stadiumId } }, user: { connect: { id: userId } }, role: role ?? "WORKER" },
      include: { user: true }
    });

    // optional: send notification/email invite (placeholder)

    return NextResponse.json({ ok:true, data: staff }, { status: 201 });
  } catch (err) {
    console.error("create staff error:", err);
    return NextResponse.json({ ok:false, error:"server_error" }, { status: 500 });
  }
}
