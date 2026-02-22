import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "../../../lib/prisma";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  sessionCookieOptions,
  signSession,
} from "../../../lib/auth";
import { messages } from "../../../lib/messages";
import { rateLimit } from "../../../lib/ratelimit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    const rl = rateLimit(`login:${ip}`, 5, 60 * 1000);

    if (!rl.success) {
      return NextResponse.json(
        { error: messages.login.rateLimit },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);

    const email = body?.email ? String(body.email).toLowerCase().trim() : "";
    const password = body?.password ? String(body.password) : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: messages.login.required },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: messages.login.invalid },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json(
        { error: messages.login.invalid },
        { status: 401 }
      );
    }

    const token = await signSession(
      { sub: user.id, email: user.email },
      SESSION_TTL_SECONDS
    );

    const res = NextResponse.json({ ok: true }, { status: 200 });

    res.cookies.set(SESSION_COOKIE_NAME, token, {
      ...sessionCookieOptions(),
      maxAge: SESSION_TTL_SECONDS,
    });

    return res;
  } catch {
    return NextResponse.json(
      { error: messages.common.serverError },
      { status: 500 }
    );
  }
}