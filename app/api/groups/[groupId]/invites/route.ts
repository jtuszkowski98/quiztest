import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth";

type Ctx = { params: Promise<{ groupId: string }> };

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
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { groupId } = await ctx.params;

    const member = await prisma.groupMember.findFirst({
      where: { groupId, userId },
      select: { role: true },
    });

    if (!member || (member.role !== "OWNER" && member.role !== "TEACHER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();

    // ✅ TYLKO AKTYWNE
    const invites = await prisma.groupInvite.findMany({
      where: {
        groupId,
        revokedAt: null,
        expiresAt: { gt: now },
        usedCount: { lt: prisma.groupInvite.fields.maxUses }, // turbopack/prisma: nie zawsze działa
      },
      orderBy: { createdAt: "desc" },
    });

    // Prisma nie wspiera usedCount < maxUses w taki sposób cross-field.
    // Więc filtrujemy w JS (bezpieczne, bo to tylko aktywne listowanie).
    const active = invites.filter((i) => i.usedCount < i.maxUses);

    return NextResponse.json(
      active.map((i) => ({
        id: i.id,
        token: i.token,
        maxUses: i.maxUses,
        usedCount: i.usedCount,
        expiresAt: i.expiresAt,
        // status tylko informacyjnie – zawsze ACTIVE w tej liście
        status: "ACTIVE" as const,
      }))
    );
  } catch (err) {
    console.error("GET invites error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}