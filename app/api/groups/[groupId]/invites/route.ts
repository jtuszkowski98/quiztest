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

function parseRole(v: unknown): "STUDENT" | "TEACHER" {
  if (v === "TEACHER") return "TEACHER";
  return "STUDENT";
}

function clampInt(v: unknown, min: number, max: number, fallback: number) {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.floor(n), min), max);
}

export async function GET(_: Request, ctx: { params: { groupId: string } }) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Brak sesji. Zaloguj się ponownie." }, { status: 401 });
  }

  const groupId = ctx.params.groupId;

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
    select: { role: true },
  });

  if (!member || (member.role !== "OWNER" && member.role !== "TEACHER")) {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
  }

  const invites = await prisma.groupInvite.findMany({
    where: { groupId },
    select: {
      id: true,
      token: true,
      role: true,
      maxUses: true,
      usedCount: true,
      expiresAt: true,
      revokedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ invites }, { status: 200 });
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

  if (!member || (member.role !== "OWNER" && member.role !== "TEACHER")) {
    return NextResponse.json({ error: "Brak uprawnień do zapraszania." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);

  const role = parseRole(body?.role);
  const maxUses = clampInt(body?.maxUses, 1, 50, 1);         // 1..50
  const expiresInDays = clampInt(body?.expiresInDays, 1, 30, 7); // 1..30

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

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