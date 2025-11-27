// src/app/api/bookings/[id]/route.ts
import { NextResponse } from "next/server";
import { execQueryOne, withTransaction } from "@/lib/db";
import { authUser } from "@/lib/auth";

export async function GET(req: Request, { params }: any) {
  const user = await authUser();
  const id = params.id;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const booking = await execQueryOne(`SELECT * FROM bookings WHERE id = $1`, [id]);
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // allow owner/admin or the user who booked
  if (booking.user_id !== user.id && user.role !== 'admin') {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ booking });
}

export async function DELETE(req: Request, { params }: any) {
  const user = await authUser();
  const id = params.id;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await withTransaction(async (client) => {
      const booking = await client.query(`SELECT * FROM bookings WHERE id = $1 FOR UPDATE`, [id]);
      if (booking.rows.length === 0) throw new Error('Not found');
      const b = booking.rows[0];

      if (b.user_id !== user.id && user.role !== 'admin') throw new Error('Forbidden');

      // mark generated_slot available again
      await client.query(`UPDATE generated_slots SET status = 'available', booking_id = NULL WHERE booking_id = $1`, [id]);

      // update booking status
      await client.query(`UPDATE bookings SET status = 'cancelled' WHERE id = $1`, [id]);

      return { ok: true };
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
