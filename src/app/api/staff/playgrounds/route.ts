// src/app/api/staff/playgrounds/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromReq } from "@/lib/authServer";

export async function GET(){
  const session = await getSessionFromReq(this as any || arguments[0]);
  if (!session) return NextResponse.json({ ok:false, error:"unauthenticated" }, { status:401 });

  // stadiums where this user is staff
  const staffs = await prisma.staff.findMany({ where: { userId: session.userId }, include: { stadium: true }});
  const stadiums = staffs.map(s => ({ ...s.stadium, staffId: s.id }));
  return NextResponse.json({ ok:true, data: stadiums });
}
