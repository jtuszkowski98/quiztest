import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../../../lib/prisma";
import { SESSION_COOKIE_NAME, verifySession } from "../../../../../../lib/auth";

type Ctx = { params: Promise<{ groupId: string; inviteId: string }> };

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await verifySession(token);
  return session?.sub ?? null;
}

export async function DELETE(_: Request, ctx: Ctx) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Brak sesji. Zaloguj się ponownie." },
        { status: 401 }
      );
    }

    const { groupId, inviteId } = await ctx.params;

    const member = await prisma.groupMember.findFirst({
      where: { groupId, userId },
      select: { role: true },
    });

    if (!member || (member.role !== "OWNER" && member.role !== "TEACHER")) {
      return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
    }

    const invite = await prisma.groupInvite.findUnique({
      where: { id: inviteId },
      select: { id: true, groupId: true, revokedAt: true },
    });

    if (!invite || invite.groupId !== groupId) {
      return NextResponse.json({ error: "Nie znaleziono zaproszenia." }, { status: 404 });
    }

    if (invite.revokedAt) {
      return NextResponse.json({ error: "Zaproszenie jest już unieważnione." }, { status: 400 });
    }

    await prisma.groupInvite.update({
      where: { id: inviteId },
      data: { revokedAt: new Date() },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/groups/[groupId]/invites/[inviteId] error:", err);
    return NextResponse.json(
      { error: "Wystąpił błąd serwera." },
      { status: 500 }
    );
  }
}