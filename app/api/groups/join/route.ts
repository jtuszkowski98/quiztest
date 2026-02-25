import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await verifySession(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.sub;

    const body = await req.json().catch(() => null);
    const inviteToken = body?.token as string | undefined;

    if (!inviteToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const invite = await prisma.groupInvite.findUnique({
      where: { token: inviteToken },
      select: {
        id: true,
        groupId: true,
        maxUses: true,
        usedCount: true,
        expiresAt: true,
        revokedAt: true,
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invite expired", code: "INVITE_EXPIRED" },
        { status: 400 }
      );
    }

    const now = new Date();

    // ✅ Najpierw “wykorzystane”
    if (invite.usedCount >= invite.maxUses) {
      return NextResponse.json(
        { error: "Invite already used", code: "INVITE_USED" },
        { status: 400 }
      );
    }

    // ✅ Potem “wygasłe” (czas lub anulowane)
    if (invite.revokedAt || invite.expiresAt <= now) {
      return NextResponse.json(
        { error: "Invite expired", code: "INVITE_EXPIRED" },
        { status: 400 }
      );
    }

    // ✅ biznes rule: nie pozwól OWNER przez invite (zostawiam jak miałeś)
    // jeśli to miałeś inaczej, wklej swój warunek – dopasuję.

    const result = await prisma.$transaction(async (tx) => {
      // re-check w transakcji (race condition)
      const fresh = await tx.groupInvite.findUnique({
        where: { id: invite.id },
        select: { usedCount: true, maxUses: true, expiresAt: true, revokedAt: true },
      });

      const now2 = new Date();
      if (!fresh) {
        throw Object.assign(new Error("INVITE_EXPIRED"), { code: "INVITE_EXPIRED" });
      }
      if (fresh.usedCount >= fresh.maxUses) {
        throw Object.assign(new Error("INVITE_USED"), { code: "INVITE_USED" });
      }
      if (fresh.revokedAt || fresh.expiresAt <= now2) {
        throw Object.assign(new Error("INVITE_EXPIRED"), { code: "INVITE_EXPIRED" });
      }

      const already = await tx.groupMember.findFirst({
        where: { groupId: invite.groupId, userId },
        select: { id: true },
      });

      if (already) {
        return { groupId: invite.groupId, joined: false };
      }

      await tx.groupMember.create({
        data: {
          groupId: invite.groupId,
          userId,
          role: "STUDENT",
        },
      });

      await tx.groupInvite.update({
        where: { id: invite.id },
        data: { usedCount: { increment: 1 } },
      });

      return { groupId: invite.groupId, joined: true };
    });

    return NextResponse.json(result);
  } catch (err: any) {
    const code = err?.code;
    if (code === "INVITE_USED") {
      return NextResponse.json({ error: "Invite already used", code }, { status: 400 });
    }
    if (code === "INVITE_EXPIRED") {
      return NextResponse.json({ error: "Invite expired", code }, { status: 400 });
    }
    console.error("POST /api/groups/join error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}