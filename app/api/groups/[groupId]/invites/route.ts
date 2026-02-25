import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../../../lib/prisma";
import { SESSION_COOKIE_NAME, verifySession } from "../../../../../../lib/auth";

type Ctx = { params: Promise<{ groupId: string }> };

function computeStatus(invite: {
  revokedAt: Date | null;
  expiresAt: Date;
  usedCount: number;
  maxUses: number;
}) {
  const now = new Date();

  if (invite.revokedAt) return "REVOKED";
  if (invite.expiresAt <= now) return "EXPIRED";
  if (invite.usedCount >= invite.maxUses) return "USED_UP";
  return "ACTIVE";
}

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await verifySession(token);
  return session?.sub ?? null;
}

export async function GET(_: Request, ctx: Ctx) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId } = await ctx.params;

    const member = await prisma.groupMember.findFirst({
      where: { groupId, userId },
      select: { role: true },
    });

    if (!member || (member.role !== "OWNER" && member.role !== "TEACHER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const invites = await prisma.groupInvite.findMany({
      where: { groupId },
      orderBy: { createdAt: "desc" },
    });

    const mapped = invites.map((invite) => ({
      ...invite,
      status: computeStatus(invite),
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET invites error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}