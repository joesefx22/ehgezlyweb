// src/app/api/blocked-slots/route.ts
import { NextResponse } from "next/server";
import { withTransaction } from "@/lib/db";
import { authUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await authUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  // { stadium_id, date, start_time, end_time, reason }
  const { stadium_id, date, start_time, end_time, reason } = body;

  // only admin/owner/staff can block
  if (!['admin','owner','staff'].includes(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const inserted = await withTransaction(async (client) => {
      const res = await client.query(
        `INSERT INTO blocked_slots (stadium_id, date, start_time, end_time, reason, blocked_by_user_id)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [stadium_id, date, start_time, end_time, reason || null, user.id]
      );
      return res.rows[0];
    });
    return NextResponse.json({ blocked: inserted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
