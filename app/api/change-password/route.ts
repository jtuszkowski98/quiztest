import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "../../../lib/prisma";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySession } from "../../../lib/auth";

export async function POST(req: Request) {
  try {
    // Next 15/16: cookies() bywa async
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: "Brak sesji. Zaloguj się ponownie." }, { status: 401 });
    }

    const session = await verifySession(token);
    if (!session) {
      return NextResponse.json({ error: "Sesja wygasła. Zaloguj się ponownie." }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const currentPassword = body?.currentPassword ? String(body.currentPassword) : "";
    const newPassword = body?.newPassword ? String(body.newPassword) : "";

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Wypełnij wszystkie pola." }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Nowe hasło musi mieć co najmniej 8 znaków." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { id: true, password: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Nie znaleziono użytkownika." }, { status: 404 });
    }

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      return NextResponse.json({ error: "Aktualne hasło jest nieprawidłowe." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Wystąpił błąd serwera." }, { status: 500 });
  }
}