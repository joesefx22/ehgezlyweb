// src/app/api/staff/playgrounds/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromReq } from "@/lib/authServer";

export async function PUT(req, { params }){
  const session = await getSessionFromReq(req);
  if (!session) return NextResponse.json({ ok:false, error:"unauthenticated" }, { status:401 });

  const stadiumId = Number(params.id);
  const staff = await prisma.staff.findFirst({ where: { stadiumId, userId: session.userId }});
  if (!staff) return NextResponse.json({ ok:false, error:"forbidden" }, { status:403 });

  const body = await req.json();
  const allowed = {};
  if ("state" in body) allowed["state"] = body.state;
  if ("lighting" in body) allowed["lighting"] = body.lighting;
  if ("note" in body) allowed["note"] = body.note;

  const updated = await prisma.stadium.update({ where: { id: stadiumId }, data: allowed });
  return NextResponse.json({ ok:true, data: updated });
}
