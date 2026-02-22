"use client";

import { useState } from "react";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!currentPassword || !newPassword || !newPassword2) {
      setMsg({ type: "err", text: "Wypełnij wszystkie pola." });
      return;
    }
    if (newPassword.length < 8) {
      setMsg({ type: "err", text: "Nowe hasło musi mieć co najmniej 8 znaków." });
      return;
    }
    if (newPassword !== newPassword2) {
      setMsg({ type: "err", text: "Nowe hasła nie są identyczne." });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setMsg({ type: "err", text: data?.error ?? "Nie udało się zmienić hasła." });
        return;
      }

      setMsg({ type: "ok", text: "Hasło zostało zmienione." });
      setCurrentPassword("");
      setNewPassword("");
      setNewPassword2("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div>
        <label className="block text-sm text-blue-950/70">Aktualne hasło</label>
        <input
          type="password"
          className="mt-1 w-full rounded-2xl border border-blue-100 px-4 py-3 outline-none focus:border-blue-400"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>

      <div>
        <label className="block text-sm text-blue-950/70">Nowe hasło</label>
        <input
          type="password"
          className="mt-1 w-full rounded-2xl border border-blue-100 px-4 py-3 outline-none focus:border-blue-400"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>

      <div>
        <label className="block text-sm text-blue-950/70">Powtórz nowe hasło</label>
        <input
          type="password"
          className="mt-1 w-full rounded-2xl border border-blue-100 px-4 py-3 outline-none focus:border-blue-400"
          value={newPassword2}
          onChange={(e) => setNewPassword2(e.target.value)}
          autoComplete="new-password"
        />
      </div>

      {msg ? (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            msg.type === "ok"
              ? "bg-green-50 text-green-800 border border-green-100"
              : "bg-red-50 text-red-800 border border-red-100"
          }`}
        >
          {msg.text}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 inline-flex justify-center px-6 py-3 rounded-2xl bg-blue-950 text-white font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Zapisywanie..." : "Zmień hasło"}
      </button>
    </form>
  );
}