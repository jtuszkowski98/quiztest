"use client";

import { useState } from "react";

export default function CreateInviteForm({ groupId }: { groupId: string }) {
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [maxUses, setMaxUses] = useState(1);
  const [expiresInDays, setExpiresInDays] = useState(7);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  async function createInvite() {
    setError(null);
    setInviteUrl(null);

    try {
      setLoading(true);
      const res = await fetch(`/api/groups/${groupId}/invites`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role, maxUses, expiresInDays }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "Nie udało się utworzyć zaproszenia.");
        return;
      }

      const token = data?.invite?.token as string | undefined;
      if (!token) {
        setError("Nie udało się utworzyć zaproszenia (brak tokenu).");
        return;
      }

      const url = `${window.location.origin}/panel/klasy/dolacz?token=${token}`;
      setInviteUrl(url);
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm text-blue-950/70">Rola po dołączeniu</label>
        <select
          className="rounded-2xl border border-blue-100 px-4 py-3 outline-none focus:border-blue-400"
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
        >
          <option value="STUDENT">Uczeń (STUDENT)</option>
          <option value="TEACHER">Nauczyciel (TEACHER)</option>
        </select>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm text-blue-950/70">Limit użyć (1–50)</label>
          <input
            type="number"
            min={1}
            max={50}
            className="rounded-2xl border border-blue-100 px-4 py-3 outline-none focus:border-blue-400"
            value={maxUses}
            onChange={(e) => setMaxUses(Number(e.target.value))}
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-blue-950/70">Ważne (dni, 1–30)</label>
          <input
            type="number"
            min={1}
            max={30}
            className="rounded-2xl border border-blue-100 px-4 py-3 outline-none focus:border-blue-400"
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(Number(e.target.value))}
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl px-4 py-3 text-sm bg-red-50 text-red-800 border border-red-100">
          {error}
        </div>
      ) : null}

      <button
        onClick={createInvite}
        disabled={loading}
        className="inline-flex justify-center px-6 py-3 rounded-2xl bg-blue-950 text-white font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Tworzenie..." : "Wygeneruj link zaproszenia"}
      </button>

      {inviteUrl ? (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
          <div className="text-sm text-blue-950/70">Link zaproszenia</div>
          <div className="mt-1 break-all font-semibold text-blue-950">{inviteUrl}</div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={copy}
              className="px-4 py-2 rounded-xl border-2 border-blue-500 text-blue-950 font-semibold hover:bg-blue-900 hover:text-white transition"
              title="Skopiuj link"
            >
              Kopiuj
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}