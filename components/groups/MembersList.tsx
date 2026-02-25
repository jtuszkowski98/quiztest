"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type DbRole = "OWNER" | "TEACHER" | "STUDENT";
type UiRole = "TEACHER" | "STUDENT";

type Member = {
  id: string; // GroupMember.id
  userId: string;
  email: string;
  role: DbRole;
};

function toUiRole(role: DbRole): UiRole {
  return role === "STUDENT" ? "STUDENT" : "TEACHER"; // OWNER ukryty jako TEACHER
}

function RolePill({ role }: { role: UiRole }) {
  const base = "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border";
  if (role === "TEACHER") {
    return <span className={`${base} border-blue-200 bg-blue-50 text-blue-700`}>🧑‍🏫 NAUCZYCIEL</span>;
  }
  return <span className={`${base} border-gray-200 bg-gray-50 text-gray-700`}>🎓 UCZEŃ</span>;
}

function canShowRemoveButton(params: {
  actorRole: DbRole;
  actorUserId: string;
  targetRole: DbRole;
  targetUserId: string;
}) {
  const { actorRole, actorUserId, targetRole, targetUserId } = params;

  if (actorUserId === targetUserId) return false;      // nie usuń siebie
  if (targetRole === "OWNER") return false;            // nie usuń założyciela

  if (targetRole === "TEACHER") return actorRole === "OWNER"; // tylko założyciel usuwa nauczyciela
  // STUDENT
  return actorRole === "OWNER" || actorRole === "TEACHER";
}

export default function MembersList(props: {
  groupId: string;
  actorUserId: string;
  actorRole: DbRole;
  members: Member[];
}) {
  const { groupId, actorUserId, actorRole } = props;
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const members = useMemo(() => props.members, [props.members]);

  async function remove(memberId: string) {
    setLoadingId(memberId);

    const res = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
      method: "DELETE",
    });

    setLoadingId(null);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error || "Nie udało się usunąć użytkownika.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((m) => {
        const initial = (m.email?.[0] || "?").toUpperCase();

        const showRemove = canShowRemoveButton({
          actorRole,
          actorUserId,
          targetRole: m.role,
          targetUserId: m.userId,
        });

        return (
          <div key={m.id} className="rounded-2xl border bg-white shadow-sm p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl border bg-gradient-to-b from-gray-50 to-white flex items-center justify-center font-semibold text-gray-800">
                {initial}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-gray-900 truncate">{m.email}</p>
                  {m.userId === actorUserId ? (
                    <span className="rounded-full border bg-gray-50 px-2 py-0.5 text-[11px] text-gray-700">
                      To Ty
                    </span>
                  ) : null}
                </div>

                <div className="mt-2">
                  <RolePill role={toUiRole(m.role)} />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
              <span>ID: {m.userId.slice(0, 8)}…</span>

              {showRemove ? (
                <button
                  onClick={() => remove(m.id)}
                  disabled={loadingId === m.id}
                  className="rounded-xl border bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100 transition"
                >
                  {loadingId === m.id ? "..." : "Usuń"}
                </button>
              ) : (
                <span className="text-gray-400"> </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}