// src/lib/authServer.ts
import prisma from "@/lib/prisma";

const COOKIE_NAME = process.env.COOKIE_NAME || "ehg_token";

export async function getSessionFromReq(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.split(";").map(s => s.trim()).find(s => s.startsWith(`${COOKIE_NAME}=`));
  if (!m) return null;
  const token = m.split("=")[1];
  if (!token) return null;
  const session = await prisma.session.findUnique({ where: { token } });
  return session; // expected { token, userId, ... }
}

export async function requireRole(req: Request, roles: string[] = []) {
  const session = await getSessionFromReq(req);
  if (!session) return { ok:false, status: 401, error: "unauthenticated" };
  const user = await prisma.user.findUnique({ where: { id: session.userId }});
  if (!user) return { ok:false, status: 401, error: "invalid session" };
  if (roles.length > 0 && !roles.includes(user.role)) return { ok:false, status: 403, error: "forbidden" };
  return { ok:true, session, user };
}
