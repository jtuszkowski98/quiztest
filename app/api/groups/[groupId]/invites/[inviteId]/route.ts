import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth";

type Params = {
  groupId: string;
  inviteId: string;
};

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<Params> }
) {
  try {
    const { groupId, inviteId } = await ctx.params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: payload.userId,
        role: {
          in: ["OWNER", "TEACHER"],
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const invite = await prisma.groupInvite.findUnique({
      where: { id: inviteId },
    });

    if (!invite || invite.groupId !== groupId) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (invite.revokedAt) {
      return NextResponse.json(
        { error: "Invite already revoked" },
        { status: 400 }
      );
    }

    await prisma.groupInvite.update({
      where: { id: inviteId },
      data: {
        revokedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}