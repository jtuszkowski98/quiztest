import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth";

import MembersList from "@/components/groups/MembersList";
// opcjonalnie
import CopyButton from "@/components/CopyButton";

type PageProps = {
  params: Promise<{ groupId: string }>;
};

type DbRole = "OWNER" | "TEACHER" | "STUDENT";
type UiRole = "TEACHER" | "STUDENT";

function toUiRole(role: DbRole): UiRole {
  return role === "STUDENT" ? "STUDENT" : "TEACHER";
}

function RolePill({ role }: { role: UiRole }) {
  const base =
    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border";
  if (role === "TEACHER")
    return (
      <span className={`${base} border-blue-200 bg-blue-50 text-blue-700`}>
        🧑‍🏫 NAUCZYCIEL
      </span>
    );
  return (
    <span className={`${base} border-gray-200 bg-gray-50 text-gray-700`}>
      🎓 UCZEŃ
    </span>
  );
}

function StatTile({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
            {value}
          </p>
          {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border bg-gray-50 text-sm">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default async function GroupDetailsPage({ params }: PageProps) {
  const { groupId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) redirect("/login");

  const session = await verifySession(token);
  if (!session) redirect("/login");

  const userId = session.sub;

  const membership = await prisma.groupMember.findFirst({
    where: { groupId, userId },
    include: { group: true },
  });

  if (!membership) notFound();

  const group = membership.group;

  const dbMembers = await prisma.groupMember.findMany({
    where: { groupId },
    include: { user: { select: { id: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  const members = dbMembers.map((m) => ({
    id: m.id, // GroupMember.id
    userId: m.user.id,
    email: m.user.email,
    role: m.role as DbRole,
  }));

  const teachers = dbMembers.filter((m) => m.role !== "STUDENT").length; // OWNER liczymy jako teacher
  const students = dbMembers.filter((m) => m.role === "STUDENT").length;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="rounded-[28px] border bg-white shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-50 via-white to-emerald-50">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                    {group.name}
                  </h1>
                  <RolePill role={toUiRole(membership.role as DbRole)} />
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  <span className="rounded-full border bg-white/60 px-2.5 py-1">
                    ID klasy
                  </span>
                  <span className="font-mono text-xs sm:text-sm bg-white/70 border rounded-xl px-3 py-1.5">
                    {group.id}
                  </span>
                  <CopyButton value={group.id} />
                </div>

                {group.description ? (
                  <p className="text-sm text-gray-700 max-w-2xl">
                    {group.description}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">
                    Brak opisu. Dodasz go w ustawieniach klasy.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-2xl border bg-white/70 px-3 py-2 text-sm text-gray-800">
                  👥 <span className="ml-2 font-semibold">{dbMembers.length}</span>
                  <span className="ml-1 text-gray-500">członków</span>
                </span>

                <Link
                  href={`/panel/klasy/${groupId}/ustawienia`}
                  className="inline-flex items-center justify-center rounded-2xl border bg-white/70 px-3 py-2 text-sm text-gray-800 hover:bg-white transition"
                  aria-label="Ustawienia klasy"
                  title="Ustawienia klasy"
                >
                  ⚙️
                </Link>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatTile label="Nauczyciele" value={String(teachers)} hint="Założyciel też tutaj" icon="🧑‍🏫" />
            <StatTile label="Uczniowie" value={String(students)} hint="Dostęp do quizów" icon="🎓" />
          </div>
        </div>

        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="p-5 sm:p-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Członkowie</h2>
              <p className="text-sm text-gray-600 mt-1">
                Nauczyciel może usuwać tylko uczniów. Nauczyciela może usunąć tylko założyciel.
              </p>
            </div>
          </div>

          <div className="px-5 sm:px-6 pb-6">
            <MembersList
              groupId={groupId}
              actorUserId={userId}
              actorRole={membership.role as DbRole}
              members={members}
            />
          </div>
        </div>

        <div className="text-xs text-gray-500 px-1">QuizTest • Panel klasy</div>
      </div>
    </div>
  );
}