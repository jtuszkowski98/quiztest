import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { getCookieName, signSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const email = body?.email ? String(body.email).toLowerCase().trim() : "";
    const password = body?.password ? String(body.password) : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email i hasło są wymagane" },
        { status: 400 }
      );
    }

    // 1) test DB
    let user;
    try {
      user = await prisma.user.findUnique({ where: { email } });
    } catch (e: any) {
      // bezpieczny debug (bez URL, bez haseł)
      return NextResponse.json(
        {
          error: "Błąd bazy danych (DB)",
          detail: e?.name || "unknown",
        },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "Nieprawidłowy email lub hasło" },
        { status: 401 }
      );
    }

    // 2) bcrypt
    let ok = false;
    try {
      ok = await bcrypt.compare(password, user.password);
    } catch (e: any) {
      return NextResponse.json(
        {
          error: "Błąd porównania hasła (bcrypt)",
          detail: e?.name || "unknown",
        },
        { status: 500 }
      );
    }

    if (!ok) {
      return NextResponse.json(
        { error: "Nieprawidłowy email lub hasło" },
        { status: 401 }
      );
    }

    // 3) JWT
    let token: string;
    try {
      token = await signSession({ sub: user.id, email: user.email });
    } catch (e: any) {
      return NextResponse.json(
        {
          error: "Błąd JWT (JWT_SECRET?)",
          detail: e?.name || "unknown",
        },
        { status: 500 }
      );
    }

    const res = NextResponse.json({ message: "OK" }, { status: 200 });

    res.cookies.set(getCookieName(), token, {
      httpOnly: true,
      secure: true, // na Vercel zawsze HTTPS
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (e: any) {
    return NextResponse.json(
      { error: "Błąd serwera", detail: e?.name || "unknown" },
      { status: 500 }
    );
  }
}