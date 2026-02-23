import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../lib/prisma";
import { SESSION_COOKIE_NAME, verifySession } from "../../../../lib/auth";

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifySession(token);
  return session?.sub ?? null;
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Brak sesji. Zaloguj się ponownie." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token.trim() : "";

  if (!token) {
    return NextResponse.json({ error: "Brak tokenu zaproszenia." }, { status: 400 });
  }

  const invite = await prisma.groupInvite.findUnique({
    where: { token },
    select: {
      id: true,
      groupId: true,
      role: true,
      maxUses: true,
      usedCount: true,
      expiresAt: true,
      revokedAt: true,
    },
  });

  if (!invite) {
    return NextResponse.json({ error: "Nieprawidłowy link zaproszenia." }, { status: 404 });
  }

  if (invite.revokedAt) {
    return NextResponse.json({ error: "Zaproszenie zostało unieważnione." }, { status: 410 });
  }

  if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "Zaproszenie wygasło." }, { status: 410 });
  }

  if (invite.usedCount >= invite.maxUses) {
    return NextResponse.json({ error: "Limit użyć zaproszenia został wyczerpany." }, { status: 410 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.groupMember.findUnique({
      where: { groupId_userId: { groupId: invite.groupId, userId } },
      select: { id: true },
    });

    if (existing) {
      return { alreadyMember: true, groupId: invite.groupId };
    }

    // bezpieczeństwo: nie da się dołączyć jako OWNER z invite
    const role = invite.role === "OWNER" ? "STUDENT" : invite.role;

    await tx.groupMember.create({
      data: { groupId: invite.groupId, userId, role },
    });

    // increment użyć
    await tx.groupInvite.update({
      where: { id: invite.id },
      data: { usedCount: { increment: 1 } },
    });

    return { alreadyMember: false, groupId: invite.groupId };
  });

  return NextResponse.json({ ok: true, ...result }, { status: 200 });
}