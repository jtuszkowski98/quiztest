import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { getCookieName, signSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email i hasło są wymagane" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Nieprawidłowy email lub hasło" },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(String(password), user.password);
    if (!ok) {
      return NextResponse.json(
        { error: "Nieprawidłowy email lub hasło" },
        { status: 401 }
      );
    }

    const token = await signSession({
      sub: user.id,
      email: user.email,
    });

    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: getCookieName(),
      value: token,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false, // ← WAŻNE: localhost
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}