// /src/app/api/admin/codes/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { requireRole } from "@/lib/authServer";

const CreateSchema = z.object({
  code: z.string().min(3),
  type: z.enum(["DISCOUNT","COMPENSATION","PAYMENT"]),
  amount: z.number().optional(),
  percent: z.number().optional(),
  maxUsage: z.number().int().min(1).optional(),
  expiresAt: z.string().optional(),
  ownerId: z.string().optional()
});

export async function GET(req: Request) {
  const auth = await requireRole(req, ["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  const url = new URL(req.url);
  const activeOnly = url.searchParams.get("activeOnly") === "1";
  const where: any = {};
  if (activeOnly) where.isActive = true;

  const codes = await prisma.code.findMany({ where, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ ok: true, data: codes });
}

export async function POST(req: Request) {
  const auth = await requireRole(req, ["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok:false, error: "validation", issues: parsed.error.format() }, { status: 400 });

  try {
    const created = await prisma.code.create({
      data: {
        code: parsed.data.code.toUpperCase(),
        type: parsed.data.type,
        amount: parsed.data.amount ?? null,
        percent: parsed.data.percent ?? null,
        maxUsage: parsed.data.maxUsage ?? 1,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
        createdById: auth.user.id,
        ownerId: parsed.data.ownerId ?? null,
        isActive: true
      }
    });
    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (err:any) {
    console.error("create code err:", err);
    return NextResponse.json({ ok:false, error: "server_error" }, { status: 500 });
  }
}
