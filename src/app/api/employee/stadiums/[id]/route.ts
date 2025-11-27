import { execQueryOne, execQuery } from "@/db/db";
import { NextResponse } from "next/server";
import { authUser } from "@/lib/auth";

export async function GET(req: Request, { params }: any) {
  const user = await authUser();
  const stadiumId = params.id;

  if (!user || user.role !== "employee") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // check assignment
  const assigned = await execQueryOne(`
    SELECT * FROM employee_assignments 
    WHERE user_id = $1 AND stadium_id = $2
  `, [user.id, stadiumId]);

  if (!assigned) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const stadium = await execQueryOne(`SELECT * FROM stadiums WHERE id = $1`, [stadiumId]);

  const bookings = await execQuery(`
    SELECT * FROM bookings WHERE stadium_id = $1 ORDER BY date DESC LIMIT 20
  `, [stadiumId]);

  return NextResponse.json({
    stadium,
    bookings
  });
}
