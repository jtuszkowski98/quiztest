import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth";

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

function Card({
  title,
  desc,
  href,
  hrefLabel,
}: {
  title: string;
  desc: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border bg-white shadow-sm p-6">
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-gray-600">{desc}</p>
        {href ? (
          <a
            href={href}
            className="inline-flex mt-4 items-center rounded-xl border bg-gray-50 px-3 py-2 text-sm hover:bg-gray-100 transition"
          >
            {hrefLabel || "Przejdź"}
          </a>
        ) : null}
      </div>
    </div>
  );
}

export default async function JoinGroupPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token?.trim();

  if (!token) {
    return (
      <Card
        title="Brak tokenu"
        desc="Link jest niepoprawny lub niekompletny."
      />
    );
  }

  // ===== SESJA =====
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    redirect(`/login?next=/panel/klasy/dolacz?token=${encodeURIComponent(token)}`);
  }

  const session = await verifySession(sessionToken);
  if (!session) {
    redirect(`/login?next=/panel/klasy/dolacz?token=${encodeURIComponent(token)}`);
  }

  const userId = session.sub;

  // ===== INVITE =====
  const invite = await prisma.groupInvite.findUnique({
    where: { token },
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
    return (
      <Card
        title="Zaproszenie wygasło"
        desc="Ten link jest nieważny (minął czas lub został anulowany). Poproś nauczyciela o nowy link."
      />
    );
  }

  const now = new Date();

  // ===== WYKORZYSTANE =====
  if (invite.usedCount >= invite.maxUses) {
    return (
      <Card
        title="Zaproszenie zostało już wykorzystane"
        desc="Ten link osiągnął limit użyć. Poproś nauczyciela o nowy link."
      />
    );
  }

  // ===== WYGASŁE =====
  const expiredByTime = invite.expiresAt ? invite.expiresAt <= now : false;
  if (invite.revokedAt || expiredByTime) {
    return (
      <Card
        title="Zaproszenie wygasło"
        desc="Ten link jest nieważny (minął czas lub został anulowany). Poproś nauczyciela o nowy link."
      />
    );
  }

  // ✅ NOWE: jeśli user już jest w tej grupie — komunikat
  const existing = await prisma.groupMember.findFirst({
    where: { groupId: invite.groupId, userId },
    select: { id: true },
  });

  if (existing) {
    return (
      <Card
        title="Jesteś już w tej klasie"
        desc="Twoje konto jest już dodane do tej klasy. Nie musisz dołączać ponownie."
        href={`/panel/klasy/${invite.groupId}`}
        hrefLabel="Przejdź do klasy"
      />
    );
  }

  // ===== JOIN (race-safe) =====
  let groupIdToRedirect: string | null = null;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const fresh = await tx.groupInvite.findUnique({
        where: { id: invite.id },
        select: {
          usedCount: true,
          maxUses: true,
          expiresAt: true,
          revokedAt: true,
          groupId: true,
        },
      });

      if (!fresh) throw new Error("INVITE_EXPIRED");

      const now2 = new Date();

      if (fresh.usedCount >= fresh.maxUses) throw new Error("INVITE_USED");

      const expiredByTime2 = fresh.expiresAt ? fresh.expiresAt <= now2 : false;
      if (fresh.revokedAt || expiredByTime2) throw new Error("INVITE_EXPIRED");

      const already = await tx.groupMember.findFirst({
        where: { groupId: fresh.groupId, userId },
        select: { id: true },
      });

      // ✅ jeśli ktoś w międzyczasie dołączył — zamiast błędu też pokażemy komunikat
      if (already) {
        return { groupId: fresh.groupId, alreadyMember: true as const };
      }

      await tx.groupMember.create({
        data: { groupId: fresh.groupId, userId, role: "STUDENT" },
      });

      await tx.groupInvite.update({
        where: { id: invite.id },
        data: { usedCount: { increment: 1 } },
      });

      return { groupId: fresh.groupId, alreadyMember: false as const };
    });

    if (result.alreadyMember) {
      return (
        <Card
          title="Jesteś już w tej klasie"
          desc="Twoje konto jest już dodane do tej klasy. Nie musisz dołączać ponownie."
          href={`/panel/klasy/${result.groupId}`}
          hrefLabel="Przejdź do klasy"
        />
      );
    }

    groupIdToRedirect = result.groupId;
  } catch (e: any) {
    const msg = String(e?.message || "");

    if (msg.includes("INVITE_USED")) {
      return (
        <Card
          title="Zaproszenie zostało już wykorzystane"
          desc="Ten link osiągnął limit użyć. Poproś nauczyciela o nowy link."
        />
      );
    }

    return (
      <Card
        title="Zaproszenie wygasło"
        desc="Ten link jest nieważny (minął czas lub został anulowany). Poproś nauczyciela o nowy link."
      />
    );
  }

  redirect(`/panel/klasy/${groupIdToRedirect}`);
}