import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromReq } from "@/lib/authServer";

export async function GET() {
  const session = await getSessionFromReq(this as any);
  if (!session || session.role !== "ADMIN") return NextResponse.json({ ok:false, error:"forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }});
  return NextResponse.json({ ok:true, data: users });
}
