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

// src/app/api/employee/stadiums/route.ts
import { NextResponse } from "next/server";
import { execQuery } from "@/lib/db";
import { authUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await authUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // صحح شرط الدور وفق تسمياتك: staff/employee/owner
  if (!["staff", "owner", "admin"].includes(user.role)) {
    return NextResponse.json({ stadiums: [] });
  }

  const stadiums = await execQuery(
    `SELECT s.* FROM employee_assignments ea
     JOIN stadiums s ON s.id = ea.stadium_id
     WHERE ea.user_id = $1`,
    [user.id]
  );

  return NextResponse.json({ stadiums });
}
