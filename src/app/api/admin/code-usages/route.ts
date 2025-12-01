// /src/app/api/admin/code-usages/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/authServer";
import { arrayToCSV } from "@/lib/csv";

export async function GET(req: Request) {
  const auth = await requireRole(req, ["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ ok:false, error: auth.error }, { status: auth.status });

  const url = new URL(req.url);
  const codeId = url.searchParams.get("codeId");
  const exportCsv = url.searchParams.get("export") === "1";

  const where:any = {};
  if (codeId) where.codeId = codeId;

  const usages = await prisma.codeUsage.findMany({
    where,
    include: { code: true },
    orderBy: { usedAt: "desc" },
    take: 2000
  });

  if (exportCsv) {
    const rows = [["code","type","userId","bookingId","usedAt"]];
    for (const u of usages) rows.push([u.code.code, u.code.type, u.userId, u.bookingId ?? "", u.usedAt.toISOString()]);
    const csv = arrayToCSV(rows);
    return new NextResponse(csv, {
      status: 200,
      headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="code_usages_${new Date().toISOString().slice(0,10)}.csv"` }
    });
  }

  return NextResponse.json({ ok:true, data: usages });
}
