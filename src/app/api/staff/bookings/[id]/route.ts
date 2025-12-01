// src/app/api/staff/bookings/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromReq } from "@/lib/authServer";

export async function PUT(req, { params }) {
  const session = await getSessionFromReq(req);
  if (!session) return NextResponse.json({ ok:false, error:"unauthenticated" }, { status:401 });

  const body = await req.json();
  const id = Number(params.id);

  const booking = await prisma.booking.findUnique({ where: { id }});
  if (!booking) return NextResponse.json({ ok:false, error:"not found" }, { status:404 });

  // check staff permission
  const staff = await prisma.staff.findFirst({ where: { stadiumId: booking.stadiumId, userId: session.userId }});
  if (!staff) return NextResponse.json({ ok:false, error:"forbidden" }, { status:403 });

  const dataToUpdate = {};
  if ("status" in body) dataToUpdate["status"] = body.status;
  if ("note" in body) dataToUpdate["note"] = body.note;
  if ("startAt" in body) dataToUpdate["startAt"] = new Date(body.startAt);
  if ("endAt" in body) dataToUpdate["endAt"] = new Date(body.endAt);

  const updated = await prisma.booking.update({ where: { id }, data: dataToUpdate });
  return NextResponse.json({ ok:true, data: updated });
}
