import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth";

type Ctx = { params: Promise<{ groupId: string; memberId: string }> };

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await verifySession(token);
  return session?.sub ?? null;
}

function canRemoveTarget(params: {
  actorRole: "OWNER" | "TEACHER" | "STUDENT";
  actorUserId: string;
  targetRole: "OWNER" | "TEACHER" | "STUDENT";
  targetUserId: string;
}) {
  const { actorRole, actorUserId, targetRole, targetUserId } = params;

  // blokujemy usunięcie samego siebie
  if (actorUserId === targetUserId) return { ok: false, code: "CANNOT_REMOVE_SELF" };

  // założyciela nie da się usunąć nigdy
  if (targetRole === "OWNER") return { ok: false, code: "CANNOT_REMOVE_FOUNDER" };

  // tylko założyciel może usuwać nauczycieli
  if (targetRole === "TEACHER") {
    if (actorRole !== "OWNER") return { ok: false, code: "ONLY_FOUNDER_CAN_REMOVE_TEACHER" };
    return { ok: true as const };
  }

  // target STUDENT
  if (actorRole === "OWNER" || actorRole === "TEACHER") return { ok: true as const };

  return { ok: false, code: "FORBIDDEN" };
}

export async function DELETE(_: Request, ctx: Ctx) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { groupId, memberId } = await ctx.params;

    // aktor
    const actor = await prisma.groupMember.findFirst({
      where: { groupId, userId },
      select: { role: true },
    });

    if (!actor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (actor.role !== "OWNER" && actor.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // target
    const target = await prisma.groupMember.findUnique({
      where: { id: memberId },
      select: { id: true, groupId: true, userId: true, role: true },
    });

    if (!target || target.groupId !== groupId) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const permission = canRemoveTarget({
      actorRole: actor.role,
      actorUserId: userId,
      targetRole: target.role,
      targetUserId: target.userId,
    });

    if (!permission.ok) {
      const msg =
        permission.code === "CANNOT_REMOVE_SELF"
          ? "Nie możesz usunąć samego siebie."
          : permission.code === "CANNOT_REMOVE_FOUNDER"
          ? "Nie można usunąć założyciela klasy."
          : permission.code === "ONLY_FOUNDER_CAN_REMOVE_TEACHER"
          ? "Tylko założyciel klasy może usunąć nauczyciela."
          : "Brak uprawnień.";

      return NextResponse.json({ error: msg, code: permission.code }, { status: 403 });
    }

    await prisma.groupMember.delete({ where: { id: target.id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/groups/[groupId]/members/[memberId] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}