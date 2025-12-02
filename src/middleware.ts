// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

const COOKIE_NAME = process.env.COOKIE_NAME || "ehg_token";

async function getSession(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_NAME)?.value || "";
  if (!cookie) return null;
  try {
    const session = await prisma.session.findUnique({ where: { token: cookie } });
    return session;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = url;

  // dont protect static files, api webhook etc.
  if (pathname.startsWith("/_next") || pathname.startsWith("/api/payments/webhook") || pathname.startsWith("/api/public")) {
    return NextResponse.next();
  }

  // owner routes
  if (pathname.startsWith("/owner")) {
    const session = await getSession(req);
    if (!session) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    // additionally check role = OWNER or ADMIN
    const user = await prisma.user.findUnique({ where: { id: session.userId }});
    if (!user || (user.role !== "OWNER" && user.role !== "ADMIN")) {
      url.pathname = "/403";
      return NextResponse.redirect(url);
    }
  }

  // admin routes
  if (pathname.startsWith("/admin")) {
    const session = await getSession(req);
    if (!session) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    const user = await prisma.user.findUnique({ where: { id: session.userId }});
    if (!user || user.role !== "ADMIN") {
      url.pathname = "/403";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/owner/:path*", "/admin/:path*"],
};

// src/middleware/rateLimit.ts
const MAP = new Map<string, { tokens: number, last: number }>();
export function allowRate(key: string, limit = 10, perSeconds = 60) {
  const now = Date.now();
  const rec = MAP.get(key) || { tokens: limit, last: now };
  const elapsed = (now - rec.last) / 1000;
  rec.tokens = Math.min(limit, rec.tokens + elapsed * (limit / perSeconds));
  rec.last = now;
  if (rec.tokens >= 1) {
    rec.tokens -= 1;
    MAP.set(key, rec);
    return true;
  }
  MAP.set(key, rec);
  return false;
}

// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

const COOKIE_NAME = "ehg_token";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ignore public assets and auth routes
  if (pathname.startsWith("/_next") || pathname.startsWith("/api/auth") || pathname.startsWith("/public") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  // protect dashboard and api routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api")) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // optional: check role for specific paths (example)
    // const session = await prisma.session.findUnique({ where: { token }, include: { user: true }});
    // if (!session) return NextResponse.redirect(new URL('/login', req.url));
    // if (pathname.startsWith('/dashboard/admin') && session.user.role !== 'ADMIN') {
    //   return NextResponse.redirect(new URL('/unauthorized', req.url));
    // }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"]
};

// src/middleware/rateLimit.ts
const MAP = new Map<string, { tokens: number, last: number }>();
export function allowRate(key: string, limit = 10, perSeconds = 60) {
  const now = Date.now();
  const rec = MAP.get(key) || { tokens: limit, last: now };
  const elapsed = (now - rec.last) / 1000;
  rec.tokens = Math.min(limit, rec.tokens + elapsed * (limit / perSeconds));
  rec.last = now;
  if (rec.tokens >= 1) {
    rec.tokens -= 1;
    MAP.set(key, rec);
    return true;
  }
  MAP.set(key, rec);
  return false;
}


import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimiter } from "./src/lib/rateLimiter";

const ADMIN_PATHS = ["/admin", "/api/admin"];
const STAFF_PATHS = ["/staff", "/api/staff"];

export async function middleware(req: NextRequest) {
  // 1) Basic security headers (applied for all)
  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "no-referrer-when-downgrade");
  res.headers.set("Permissions-Policy", "geolocation=(), microphone=()");
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.headers.set("Content-Security-Policy", "default-src 'self'; frame-ancestors 'self' https://accept.paymob.com;"); // allow paymob iframe
  // 2) Rate limit (global per IP)
  const ip = req.ip ?? req.headers.get("x-forwarded-for") ?? "unknown";
  const rl = rateLimiter(ip);
  if (!rl.allowed) return new Response("Too Many Requests", { status: 429 });

  // 3) Protect admin/staff pages (simple check for cookie - use your real session validation)
  const pathname = req.nextUrl.pathname;
  if (ADMIN_PATHS.some(p => pathname.startsWith(p))) {
    const token = req.cookies.get("ehg_token")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    // optionally call backend to validate role — keep fast checks here
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/staff/:path*", "/api/staff/:path*", "/api/payment/webhook"]
};
