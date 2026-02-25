import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth";

import InvitesList from "@/components/groups/InvitesList";
import CreateInviteForm from "@/components/groups/CreateInviteForm";

type PageProps = {
  params: Promise<{ groupId: string }>;
};

export default async function GroupSettingsPage({ params }: PageProps) {
  const { groupId } = await params;

  // ===== AUTH =====
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) redirect("/login");

  const session = await verifySession(token);
  if (!session) redirect("/login");

  const userId = session.sub;

  // ===== MEMBERSHIP + GROUP =====
  const membership = await prisma.groupMember.findFirst({
    where: { groupId, userId },
    include: { group: true },
  });

  if (!membership) notFound();

  // OWNER traktujemy jak TEACHER w UI/permission
  const canManage = membership.role === "OWNER" || membership.role === "TEACHER";

  if (!canManage) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="rounded-2xl border bg-white shadow-sm p-6">
            <h1 className="text-xl font-semibold">Ustawienia klasy</h1>
            <p className="mt-2 text-sm text-gray-600">
              Nie masz uprawnień do ustawień tej klasy.
            </p>
            <Link
              href={`/panel/klasy/${groupId}`}
              className="inline-flex mt-4 items-center rounded-xl border bg-gray-50 px-3 py-2 text-sm hover:bg-gray-100 transition"
            >
              ← Wróć do klasy
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const group = membership.group;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Ustawienia klasy
            </h1>
            <p className="text-sm text-gray-600 mt-1">{group.name}</p>
          </div>

          <Link
            href={`/panel/klasy/${groupId}`}
            className="inline-flex items-center rounded-2xl border bg-white px-3 py-2 text-sm hover:bg-gray-50 transition"
          >
            ← Wróć
          </Link>
        </div>

        {/* Dane klasy (placeholder pod nazwę/opis) */}
        <div className="rounded-2xl border bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900">Dane klasy</h2>
          <p className="text-sm text-gray-600 mt-1">
            Zmiana nazwy i opisu będzie tutaj (dodamy zapis w kolejnym commicie).
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4">
            <div className="rounded-2xl border bg-gray-50 p-4">
              <p className="text-xs font-medium text-gray-500">Nazwa</p>
              <p className="mt-1 text-sm text-gray-900">{group.name}</p>
            </div>

            <div className="rounded-2xl border bg-gray-50 p-4">
              <p className="text-xs font-medium text-gray-500">Opis</p>
              <p className="mt-1 text-sm text-gray-900">
                {group.description || "Brak opisu"}
              </p>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            Następny commit: formularz + PATCH /api/groups/[groupId] (name/description).
          </div>
        </div>

        {/* Zaproszenia */}
        <div className="rounded-2xl border bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900">Zaproszenia</h2>
          <p className="text-sm text-gray-600 mt-1">
            Twórz linki, kopiuj i unieważniaj.
          </p>

          {/* ✅ Tworzenie linku */}
          <div className="mt-4 rounded-2xl border bg-gray-50 p-4">
            <CreateInviteForm groupId={groupId} />
          </div>

          {/* ✅ Lista zaproszeń */}
          <div className="mt-4 rounded-2xl border bg-gray-50 p-4">
            <InvitesList groupId={groupId} />
          </div>
        </div>
      </div>
    </div>
  );
}