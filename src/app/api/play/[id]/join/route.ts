import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    const id = context.params.id;

    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const match = await prisma.playRequest.findUnique({
      where: { id },
      include: { players: true },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    if (match.players.some((p) => p.id === user.id)) {
      return NextResponse.json(
        { error: "أنت منضم بالفعل لهذا الماتش" },
        { status: 400 }
      );
    }

    if (match.players.length >= match.maxPlayers) {
      return NextResponse.json(
        { error: "الماتش مكتمل ولا يمكن الانضمام" },
        { status: 400 }
      );
    }

    await prisma.playRequest.update({
      where: { id },
      data: {
        players: {
          connect: { id: user.id },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = (req.headers.get("cookie") || "").split(";").map(s=>s.trim()).find(s=>s.startsWith("ehg_token="))?.split("=")[1];
    if (!token) return NextResponse.json({ ok:false, error: "unauthenticated" }, { status: 401 });
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session) return NextResponse.json({ ok:false, error: "invalid session" }, { status: 401 });

    const id = params.id;

    const participant = await prisma.$transaction(async (tx) => {
      const reqDoc = await tx.playRequest.findUnique({
        where: { id },
        include: { participants: true },
        lock: { // note: Prisma doesn't support explicit row locks across adapters; use transaction logic and select then update
        },
      });

      if (!reqDoc) throw { code: "NOT_FOUND" };

      const currentCount = reqDoc.participants?.length ?? 0;
      if (currentCount >= reqDoc.playersNeeded) throw { code: "FULL" };

      // prevent duplicate
      const already = reqDoc.participants.find(p => p.userId === session.userId);
      if (already) throw { code: "ALREADY_JOINED" };

      const created = await tx.participation.create({
        data: { userId: session.userId, playRequestId: id }
      });

      if (currentCount + 1 >= reqDoc.playersNeeded) {
        await tx.playRequest.update({ where: { id }, data: { status: "FULL" } });
      }

      return created;
    });

    return NextResponse.json({ ok: true, data: participant }, { status: 201 });
  } catch (err: any) {
    console.error("join error", err);
    if (err?.code === "NOT_FOUND") return NextResponse.json({ ok:false, error: "not found" }, { status: 404 });
    if (err?.code === "FULL") return NextResponse.json({ ok:false, error: "full" }, { status: 409 });
    if (err?.code === "ALREADY_JOINED") return NextResponse.json({ ok:false, error: "already joined" }, { status: 400 });
    return NextResponse.json({ ok:false, error: "server error" }, { status: 500 });
  }
}
