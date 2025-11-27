// src/app/api/player-requests/route.ts
import { NextResponse } from "next/server";
import { withTransaction } from "@/lib/db";
import { authUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await authUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { booking_id, players_needed, details } = await req.json();
  if (!booking_id || !players_needed) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  try {
    const created = await withTransaction(async (client) => {
      const res = await client.query(
        `INSERT INTO player_requests (booking_id, requester_id, players_needed, details) VALUES ($1,$2,$3,$4) RETURNING *`,
        [booking_id, user.id, players_needed, details || null]
      );
      return res.rows[0];
    });

    return NextResponse.json({ request: created });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
