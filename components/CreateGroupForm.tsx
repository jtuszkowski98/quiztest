"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateGroupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (trimmed.length < 3) {
      setError("Nazwa klasy musi mieć co najmniej 3 znaki.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "Nie udało się utworzyć klasy.");
        return;
      }

      router.push("/panel/klasy");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div>
        <label className="block text-sm text-blue-950/70">Nazwa klasy</label>
        <input
          className="mt-1 w-full rounded-2xl border border-blue-100 px-4 py-3 outline-none focus:border-blue-400"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="np. 3A Matematyka"
          maxLength={80}
        />
      </div>

      {error ? (
        <div className="rounded-2xl px-4 py-3 text-sm bg-red-50 text-red-800 border border-red-100">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 inline-flex justify-center px-6 py-3 rounded-2xl bg-blue-950 text-white font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Tworzenie..." : "Utwórz klasę"}
      </button>

      <p className="text-blue-950/60 text-sm">
        Po utworzeniu klasy automatycznie zostaniesz jej właścicielem (OWNER).
      </p>
    </form>
  );
}