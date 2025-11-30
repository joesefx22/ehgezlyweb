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

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromReq(req);
    if (!session) return NextResponse.json({ ok:false, error: "unauthenticated" }, { status: 401 });

    const booking = await prisma.booking.findUnique({ where: { id: params.id }, include: { field: true } });
    if (!booking) return NextResponse.json({ ok:false, error: "not found" }, { status: 404 });
    if (booking.field.ownerId !== session.userId) return NextResponse.json({ ok:false, error: "forbidden" }, { status: 403 });

    if (booking.status !== "PENDING") return NextResponse.json({ ok:false, error: "invalid status" }, { status: 400 });

    const updated = await prisma.booking.update({ where: { id: params.id }, data: { status: "CONFIRMED" } });

    // TODO: trigger notification/email, optional payment link
    return NextResponse.json({ ok:true, data: updated });
  } catch (err) {
    console.error("confirm booking error", err);
    return NextResponse.json({ ok:false, error: "server error" }, { status: 500 });
  }
}
