// src/app/api/admin/users/[id]/route.ts
import { NextResponse } from "next/server";
import { execQueryOne, withTransaction } from "@/lib/db";
import { authUser } from "@/lib/auth";

export async function PUT(req: Request, { params }: any) {
  const admin = await authUser();
  if (!admin || admin.role !== 'admin') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = params.id;
  const { role, assigned_stadiums } = await req.json(); // assigned_stadiums: array of stadium UUIDs

  try {
    const updated = await withTransaction(async (client) => {
      // update role
      await client.query(`UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [role, id]);

      // restore assignments: delete existing then insert new (simple approach)
      await client.query(`DELETE FROM employee_assignments WHERE user_id = $1`, [id]);

      if (Array.isArray(assigned_stadiums) && assigned_stadiums.length) {
        for (const sid of assigned_stadiums) {
          await client.query(
            `INSERT INTO employee_assignments (user_id, stadium_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
            [id, sid]
          );
        }
      }

      return client.query(`SELECT id, name, email, role FROM users WHERE id = $1`, [id]).then(r=>r.rows[0]);
    });

    return NextResponse.json({ user: updated });
  } catch (err:any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
