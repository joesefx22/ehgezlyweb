import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const codes = await prisma.code.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(codes);
}
