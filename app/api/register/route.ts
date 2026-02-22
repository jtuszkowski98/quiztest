import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "../../../lib/prisma";
import { messages } from "../../../lib/messages";
import { rateLimit } from "../../../lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    const rl = rateLimit(`register:${ip}`, 3, 60 * 1000);

    if (!rl.success) {
      return NextResponse.json(
        { error: messages.register.rateLimit },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);

    const email = body?.email ? String(body.email).toLowerCase().trim() : "";
    const password = body?.password ? String(body.password) : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: messages.register.required },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return NextResponse.json(
        { error: messages.register.exists },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: { email, password: hashed },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: messages.common.serverError },
      { status: 500 }
    );
  }
}