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
