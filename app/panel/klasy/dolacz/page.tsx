import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "../../../../lib/current-user";
import { prisma } from "../../../../lib/prisma";

type Props = {
  searchParams?: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;
};

function getToken(sp: Record<string, string | string[] | undefined> | undefined) {
  const raw = sp?.token;
  if (!raw) return "";
  if (Array.isArray(raw)) return (raw[0] ?? "").trim();
  return String(raw).trim();
}

export default async function DolaczDoKlasyPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/logowanie");

  const resolved = await Promise.resolve(searchParams ?? {});
  const token = getToken(resolved);

  if (!token) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-extrabold text-blue-950">Dołączanie do klasy</h1>
        <div className="mt-6 rounded-2xl px-4 py-3 text-sm bg-red-50 text-red-800 border border-red-100">
          Brak tokenu zaproszenia.
        </div>
        <div className="mt-6">
          <Link href="/panel/klasy" className="underline text-blue-950/80 hover:text-blue-950">
            ← Wróć do klas
          </Link>
        </div>
      </main>
    );
  }

  const invite = await prisma.groupInvite.findUnique({
    where: { token },
    select: {
      id: true,
      groupId: true,
      role: true,
      maxUses: true,
      usedCount: true,
      expiresAt: true,
      revokedAt: true,
    },
  });

  if (!invite) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-extrabold text-blue-950">Dołączanie do klasy</h1>
        <div className="mt-6 rounded-2xl px-4 py-3 text-sm bg-red-50 text-red-800 border border-red-100">
          Nieprawidłowy link zaproszenia.
        </div>
        <div className="mt-6">
          <Link href="/panel/klasy" className="underline text-blue-950/80 hover:text-blue-950">
            ← Wróć do klas
          </Link>
        </div>
      </main>
    );
  }

  if (invite.revokedAt) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-extrabold text-blue-950">Dołączanie do klasy</h1>
        <div className="mt-6 rounded-2xl px-4 py-3 text-sm bg-red-50 text-red-800 border border-red-100">
          Zaproszenie zostało unieważnione.
        </div>
        <div className="mt-6">
          <Link href="/panel/klasy" className="underline text-blue-950/80 hover:text-blue-950">
            ← Wróć do klas
          </Link>
        </div>
      </main>
    );
  }

  if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-extrabold text-blue-950">Dołączanie do klasy</h1>
        <div className="mt-6 rounded-2xl px-4 py-3 text-sm bg-red-50 text-red-800 border border-red-100">
          Zaproszenie wygasło.
        </div>
        <div className="mt-6">
          <Link href="/panel/klasy" className="underline text-blue-950/80 hover:text-blue-950">
            ← Wróć do klas
          </Link>
        </div>
      </main>
    );
  }

  if (invite.usedCount >= invite.maxUses) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-extrabold text-blue-950">Dołączanie do klasy</h1>
        <div className="mt-6 rounded-2xl px-4 py-3 text-sm bg-red-50 text-red-800 border border-red-100">
          Limit użyć zaproszenia został wyczerpany.
        </div>
        <div className="mt-6">
          <Link href="/panel/klasy" className="underline text-blue-950/80 hover:text-blue-950">
            ← Wróć do klas
          </Link>
        </div>
      </main>
    );
  }

  // Dołączanie transakcyjnie
  await prisma.$transaction(async (tx) => {
    const existing = await tx.groupMember.findFirst({
      where: { groupId: invite.groupId, userId: user.id },
      select: { id: true },
    });

    if (existing) return;

    const role = invite.role === "OWNER" ? "STUDENT" : invite.role;

    await tx.groupMember.create({
      data: { groupId: invite.groupId, userId: user.id, role },
    });

    await tx.groupInvite.update({
      where: { id: invite.id },
      data: { usedCount: { increment: 1 } },
    });
  });

  redirect(`/panel/klasy/${invite.groupId}`);
}