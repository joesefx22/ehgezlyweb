// src/app/api/owner/bookings/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const COOKIE_NAME = process.env.COOKIE_NAME || "ehg_token";
async function getSessionFromReq(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.split(";").map(s=>s.trim()).find(s=>s.startsWith(`${COOKIE_NAME}=`));
  if (!m) return null;
  const token = m.split("=")[1];
  return prisma.session.findUnique({ where: { token } });
}

export async function GET(req: Request) {
  const session = await getSessionFromReq(req);
  if (!session) return NextResponse.json({ ok:false, error: "unauthenticated" }, { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status"); // optional
  const dateFrom = url.searchParams.get("dateFrom");
  const dateTo = url.searchParams.get("dateTo");

  // find fields owned by this owner
  const fields = await prisma.field.findMany({ where: { ownerId: session.userId }, select: { id: true } });
  const fieldIds = fields.map(f => f.id);

  const where:any = { fieldId: { in: fieldIds } };
  if (status) where.status = status;
  if (dateFrom || dateTo) {
    where.startAt = {};
    if (dateFrom) where.startAt.gte = new Date(dateFrom);
    if (dateTo) where.startAt.lte = new Date(dateTo);
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: { field: true, user: true },
    orderBy: { startAt: "desc" }
  });

  return NextResponse.json({ ok:true, data: bookings });
}
