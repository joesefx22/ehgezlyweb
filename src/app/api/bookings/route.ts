// src/app/api/bookings/route.ts
import { NextResponse } from "next/server";
import { withTransaction, execQueryOne } from "@/lib/db";
import { authUser } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  const user = await authUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  // body: { stadium_id, date, start_time, end_time, total_price, deposit_paid }
  const { stadium_id, date, start_time, end_time, total_price, deposit_paid } = body;

  try {
    const result = await withTransaction(async (client) => {
      // 1. optional: check if the slot is blocked
      const blocked = await client.query(
        `SELECT 1 FROM blocked_slots WHERE stadium_id = $1 AND date = $2
         AND tstzrange((date + start_time),(date + end_time)) && tstzrange((date + start_time),(date + end_time))`,
        [stadium_id, date]
      );
      if (blocked.rows.length) throw new Error('Slot is blocked');

      // 2. insert booking
      const id = uuidv4();
      const insert = await client.query(
        `INSERT INTO bookings (id, user_id, stadium_id, date, start_time, end_time, total_price, deposit_paid, remaining_amount, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [id, user.id, stadium_id, date, start_time, end_time, total_price, deposit_paid, (total_price - (deposit_paid||0)), 'confirmed']
      );

      // optionally mark generated_slot as booked
      await client.query(
        `UPDATE generated_slots SET status = 'booked', booking_id = $1 WHERE stadium_id = $2 AND slot_date = $3 AND start_time = $4`,
        [id, stadium_id, date, start_time]
      );

      // return booking row
      return insert.rows[0];
    });

    return NextResponse.json({ booking: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
