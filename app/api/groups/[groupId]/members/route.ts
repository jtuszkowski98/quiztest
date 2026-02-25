import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../../lib/prisma";
import { SESSION_COOKIE_NAME, verifySession } from "../../../../../lib/auth";

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await verifySession(token);
  return session?.sub ?? null;
}

type Ctx = { params: Promise<{ groupId: string }> };

export async function GET(_: Request, ctx: Ctx) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Brak sesji. Zaloguj się ponownie." },
        { status: 401 }
      );
    }

    const { groupId } = await ctx.params;

    // ✅ stabilnie: nie zależy od nazwy constraintu
    const membership = await prisma.groupMember.findFirst({
      where: { groupId, userId },
      select: { id: true },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Brak dostępu do tej klasy." },
        { status: 403 }
      );
    }

    const members = await prisma.groupMember.findMany({
      where: { groupId },
      select: {
        id: true,
        role: true,
        createdAt: true,
        user: {
          select: { id: true, email: true, name: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ members }, { status: 200 });
  } catch (err) {
    console.error("GET /api/groups/[groupId]/members error:", err);
    return NextResponse.json(
      { error: "Wystąpił błąd serwera." },
      { status: 500 }
    );
  }
}