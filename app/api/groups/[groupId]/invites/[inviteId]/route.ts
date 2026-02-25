import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth";

type Ctx = { params: Promise<{ groupId: string; inviteId: string }> };

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await verifySession(token);
  return session?.sub ?? null;
}

function isActive(invite: {
  revokedAt: Date | null;
  expiresAt: Date;
  usedCount: number;
  maxUses: number;
}) {
  const now = new Date();
  return !invite.revokedAt && invite.expiresAt > now && invite.usedCount < invite.maxUses;
}

export async function DELETE(_: Request, ctx: Ctx) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId, inviteId } = await ctx.params;

    const member = await prisma.groupMember.findFirst({
      where: { groupId, userId },
      select: { role: true },
    });

    if (!member || (member.role !== "OWNER" && member.role !== "TEACHER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const invite = await prisma.groupInvite.findUnique({
      where: { id: inviteId },
      select: { id: true, groupId: true, revokedAt: true, expiresAt: true, usedCount: true, maxUses: true },
    });

    if (!invite || invite.groupId !== groupId) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    // ✅ anulować można tylko aktywne
    if (!isActive(invite)) {
      return NextResponse.json(
        { error: "Only active invites can be cancelled", code: "INVITE_NOT_ACTIVE" },
        { status: 400 }
      );
    }

    // “anuluj” = ustaw revokedAt; w Twoim UX to ma być “wygasłe”
    await prisma.groupInvite.update({
      where: { id: inviteId },
      data: { revokedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE invite error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}