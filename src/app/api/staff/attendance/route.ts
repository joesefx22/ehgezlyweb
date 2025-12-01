// src/app/api/staff/attendance/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromReq } from "@/lib/authServer";

export async function POST(req){
  const session = await getSessionFromReq(req);
  if (!session) return NextResponse.json({ ok:false, error:"unauthenticated" }, { status:401 });
  const body = await req.json();
  const { bookingId, present, note } = body;
  if (!bookingId) return NextResponse.json({ ok:false, error:"bookingId required" }, { status:400 });

  // find booking
  const booking = await prisma.booking.findUnique({ where: { id: Number(bookingId) }});
  if (!booking) return NextResponse.json({ ok:false, error:"booking not found" }, { status:404 });

  // find staff record for this user on that stadium
  const staff = await prisma.staff.findFirst({ where: { stadiumId: booking.stadiumId, userId: session.userId }});
  if (!staff) return NextResponse.json({ ok:false, error:"forbidden" }, { status:403 });

  // create attendance record for staff for the booking date (use booking.startAt as date)
  const date = booking.startAt;
  // If existing attendance for same staff/date exists, update it.
  const existing = await prisma.staffAttendance.findFirst({ where: { staffId: staff.id, date } });
  if (existing) {
    const updated = await prisma.staffAttendance.update({ where: { id: existing.id }, data: { present: present === undefined ? existing.present : Boolean(present), note: note ?? existing.note }});
    return NextResponse.json({ ok:true, data: updated });
  } else {
    const created = await prisma.staffAttendance.create({ data: { staff: { connect: { id: staff.id }}, date, present: present === undefined ? true : Boolean(present), note: note ?? null }});
    return NextResponse.json({ ok:true, data: created });
  }
}
