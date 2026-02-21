import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, getCookieName } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/panel")) {
    const token = req.cookies.get(getCookieName())?.value;

    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/logowanie";
      return NextResponse.redirect(url);
    }

    const session = await verifySession(token);
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/logowanie";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*"],
};