import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(_, { params }) {
  const { slotId } = params;

  try {
    await prisma.slot.delete({
      where: { id: Number(slotId) },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
