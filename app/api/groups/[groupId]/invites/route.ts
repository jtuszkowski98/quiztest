import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "../../../../../lib/prisma";
import { SESSION_COOKIE_NAME, verifySession } from "../../../../../lib/auth";

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifySession(token);
  return session?.sub ?? null;
}

function toRole(v: unknown) {
  if (v === "STUDENT" || v === "TEACHER") return v;
  return "STUDENT";
}

export async function POST(req: Request, ctx: { params: { groupId: string } }) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Brak sesji. Zaloguj się ponownie." }, { status: 401 });
  }

  const groupId = ctx.params.groupId;

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
    select: { role: true },
  });

  // tylko OWNER/TEACHER może zapraszać
  if (!member || (member.role !== "OWNER" && member.role !== "TEACHER")) {
    return NextResponse.json({ error: "Brak uprawnień do zapraszania." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);

  const role = toRole(body?.role);
  const maxUsesRaw = typeof body?.maxUses === "number" ? body.maxUses : 1;
  const maxUses = Math.min(Math.max(maxUsesRaw, 1), 50); // 1..50

  const expiresInDaysRaw = typeof body?.expiresInDays === "number" ? body.expiresInDays : 7;
  const expiresInDays = Math.min(Math.max(expiresInDaysRaw, 1), 30); // 1..30
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  const token = crypto.randomBytes(24).toString("hex");

  const invite = await prisma.groupInvite.create({
    data: {
      groupId,
      token,
      role,
      maxUses,
      expiresAt,
    },
    select: {
      id: true,
      token: true,
      role: true,
      maxUses: true,
      usedCount: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ invite }, { status: 201 });
}