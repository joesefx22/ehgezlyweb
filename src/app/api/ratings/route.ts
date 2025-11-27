// src/app/api/ratings/route.ts
import { NextResponse } from "next/server";
import { execQuery, execQueryOne } from "@/lib/db";
import { authUser } from "@/lib/auth";
import { withTransaction } from "@/lib/db";

export async function POST(req: Request) {
  const user = await authUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { stadium_id, rating, comment } = await req.json();
  if (!rating || rating < 1 || rating > 5) return NextResponse.json({ error: "Invalid rating" }, { status: 400 });

  try {
    const created = await withTransaction(async (client) => {
      const upsert = await client.query(
        `INSERT INTO ratings (stadium_id, user_id, rating, comment)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (stadium_id, user_id) DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, created_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [stadium_id, user.id, rating, comment || null]
      );
      return upsert.rows[0];
    });

    return NextResponse.json({ rating: created });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const stadiumId = url.searchParams.get('stadium_id');
  if (!stadiumId) return NextResponse.json({ error: "stadium_id required" }, { status: 400 });

  const rows = await execQuery(`SELECT * FROM ratings WHERE stadium_id = $1 ORDER BY created_at DESC`, [stadiumId]);
  return NextResponse.json({ ratings: rows });
}
