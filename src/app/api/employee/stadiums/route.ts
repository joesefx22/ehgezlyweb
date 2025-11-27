import { execQuery } from "@/db/db";
import { NextResponse } from "next/server";
import { authUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await authUser();

  if (!user || user.role !== "employee") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stadiums = await execQuery(`
    SELECT stadiums.*
    FROM employee_assignments
    JOIN stadiums ON stadiums.id = employee_assignments.stadium_id
    WHERE employee_assignments.user_id = $1
  `, [user.id]);

  return NextResponse.json({ stadiums });
}
