// src/app/api/stadiums/[id]/generate-slots/route.ts
import { NextResponse } from "next/server";
import { execQuery, withTransaction } from "@/lib/db";
import { authUser } from "@/lib/auth";

export async function POST(req: Request, { params }: any) {
  const user = await authUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stadiumId = params.id;
  // Allow only owner or admin or assigned staff
  const isAllowed = user.role === "admin" || user.role === "owner" ||
    await execQuery(
      `SELECT 1 FROM employee_assignments WHERE user_id = $1 AND stadium_id = $2`,
      [user.id, stadiumId]
    ).then(r => r.length > 0);

  if (!isAllowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  // body: { startDate?: '2025-12-01', days?: 14 }
  const startDate = body.startDate ? body.startDate : new Date().toISOString().slice(0,10);
  const days = body.days ? Math.min(body.days, 90) : 14; // منع توليد طويل جدًا

  // get stadium config
  const stadium = await execQuery(
    `SELECT opening_time, closing_time, slot_duration FROM stadiums WHERE id = $1`,
    [stadiumId]
  ).then(r => r[0]);

  if (!stadium) return NextResponse.json({ error: "Stadium not found" }, { status: 404 });

  // parse interval format in JS: stadium.slot_duration is INTERVAL (postgres returns string like '01:00:00')
  const slotParts = (stadium.slot_duration || '01:00:00').split(':').map(Number);
  const slotMinutes = (slotParts[0] * 60) + (slotParts[1] || 0);

  // transaction to insert slots safely, skip duplicates due to UNIQUE constraint
  try {
    const result = await withTransaction(async (client) => {
      const inserted = [];
      for (let d = 0; d < days; d++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + d);
        const dateStr = date.toISOString().slice(0,10);

        // calculate times from opening_time to closing_time using minutes
        const [openH, openM] = stadium.opening_time.split(':').map(Number);
        const [closeH, closeM] = stadium.closing_time.split(':').map(Number);
        const openMinutes = openH * 60 + openM;
        const closeMinutes = closeH * 60 + closeM;

        for (let t = openMinutes; t + slotMinutes <= closeMinutes; t += slotMinutes) {
          const startH = Math.floor(t / 60).toString().padStart(2,'0');
          const startM = (t % 60).toString().padStart(2,'0');
          const endT = t + slotMinutes;
          const endH = Math.floor(endT / 60).toString().padStart(2,'0');
          const endM = (endT % 60).toString().padStart(2,'0');

          const start_time = `${startH}:${startM}:00`;
          const end_time = `${endH}:${endM}:00`;

          // upsert: insert if not exists (UNIQUE constraint on stadium_id, slot_date, start_time)
          try {
            const insert = await client.query(
              `INSERT INTO generated_slots (stadium_id, slot_date, start_time, end_time, status)
               VALUES ($1, $2, $3, $4, 'available')
               ON CONFLICT (stadium_id, slot_date, start_time) DO NOTHING
               RETURNING *`,
              [stadiumId, dateStr, start_time, end_time]
            );
            if (insert.rows.length) inserted.push(insert.rows[0]);
          } catch (e) {
            // ignore individual conflicts; transaction will continue
          }
        }
      }
      return { created: inserted.length };
    });

    return NextResponse.json({ ok: true, created: result.created });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
