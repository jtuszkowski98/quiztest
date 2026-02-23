import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../lib/prisma";
import { SESSION_COOKIE_NAME, verifySession } from "../../../lib/auth";

function normalizeName(value: unknown) {
  const name = typeof value === "string" ? value.trim() : "";
  return name.length >= 3 ? name : "";
}

async function getSessionUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await verifySession(token);
  return session?.sub ?? null;
}

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Brak sesji. Zaloguj się ponownie." }, { status: 401 });
  }

  const groups = await prisma.group.findMany({
    where: { members: { some: { userId } } },
    select: {
      id: true,
      name: true,
      ownerId: true,
      createdAt: true,
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ groups }, { status: 200 });
}

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Brak sesji. Zaloguj się ponownie." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const name = normalizeName(body?.name);

  if (!name) {
    return NextResponse.json({ error: "Nazwa klasy musi mieć co najmniej 3 znaki." }, { status: 400 });
  }

  const created = await prisma.$transaction(async (tx) => {
    const group = await tx.group.create({
      data: { name, ownerId: userId },
      select: { id: true, name: true, ownerId: true, createdAt: true },
    });

    await tx.groupMember.create({
      data: { groupId: group.id, userId, role: "OWNER" },
    });

    return group;
  });

  return NextResponse.json({ group: created }, { status: 201 });
}