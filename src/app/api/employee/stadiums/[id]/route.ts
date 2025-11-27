// src/app/api/employee/stadiums/[id]/route.ts
import { NextResponse } from "next/server";
import { execQuery, execQueryOne } from "@/lib/db";
import { authUser } from "@/lib/auth";

export async function GET(req: Request, { params }: any) {
  const user = await authUser();
  const stadiumId = params.id;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Admin يمكنه الوصول لأي ملعب
  if (user.role !== "admin") {
    const assigned = await execQueryOne(
      `SELECT 1 FROM employee_assignments WHERE user_id = $1 AND stadium_id = $2`,
      [user.id, stadiumId]
    );
    if (!assigned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const stadium = await execQueryOne(`SELECT * FROM stadiums WHERE id = $1`, [stadiumId]);
  if (!stadium) return NextResponse.json({ error: "Not Found" }, { status: 404 });

  const bookings = await execQuery(
    `SELECT * FROM bookings WHERE stadium_id = $1 ORDER BY date DESC LIMIT 50`,
    [stadiumId]
  );

  const blocked = await execQuery(
    `SELECT * FROM blocked_slots WHERE stadium_id = $1 AND date >= CURRENT_DATE ORDER BY date, start_time`,
    [stadiumId]
  );

  return NextResponse.json({ stadium, bookings, blocked });
}
