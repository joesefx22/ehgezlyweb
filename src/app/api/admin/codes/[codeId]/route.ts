// /src/app/api/admin/codes/[codeId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { requireRole } from "@/lib/authServer";

const UpdateSchema = z.object({
  isActive: z.boolean().optional(),
  maxUsage: z.number().int().optional(),
  expiresAt: z.string().nullable().optional()
});

export async function PUT(req: Request, { params }: { params: { codeId: string } }) {
  const auth = await requireRole(req, ["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ ok:false, error: auth.error }, { status: auth.status });

  const parsedBody = await req.json();
  const parsed = UpdateSchema.safeParse(parsedBody);
  if (!parsed.success) return NextResponse.json({ ok:false, error: "validation", issues: parsed.error.format() }, { status: 400 });

  try {
    const updated = await prisma.code.update({
      where: { id: params.codeId },
      data: {
        ...(parsed.data.isActive !== undefined ? { isActive: parsed.data.isActive } : {}),
        ...(parsed.data.maxUsage !== undefined ? { maxUsage: parsed.data.maxUsage } : {}),
        ...(parsed.data.expiresAt !== undefined ? { expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null } : {})
      }
    });
    return NextResponse.json({ ok:true, data: updated });
  } catch (err:any) {
    console.error("update code err", err);
    return NextResponse.json({ ok:false, error: "server_error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { codeId: string } }) {
  const auth = await requireRole(req, ["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ ok:false, error: auth.error }, { status: auth.status });

  try {
    await prisma.code.delete({ where: { id: params.codeId }});
    return NextResponse.json({ ok:true });
  } catch (err:any) {
    console.error("delete code err", err);
    return NextResponse.json({ ok:false, error: "server_error" }, { status: 500 });
  }
}
