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
