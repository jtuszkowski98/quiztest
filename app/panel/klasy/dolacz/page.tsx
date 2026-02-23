"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function DolaczDoKlasyPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = sp.get("token") ?? "";

  const [status, setStatus] = useState<"loading" | "ok" | "err">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      if (!token) {
        setStatus("err");
        setError("Brak tokenu zaproszenia.");
        return;
      }

      try {
        const res = await fetch("/api/groups/join", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          setStatus("err");
          setError(data?.error ?? "Nie udało się dołączyć do klasy.");
          return;
        }

        setStatus("ok");
        router.push(`/panel/klasy/${data.groupId}`);
        router.refresh();
      } catch {
        setStatus("err");
        setError("Błąd połączenia.");
      }
    }

    run();
  }, [token, router]);

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-extrabold text-blue-950">Dołączanie do klasy</h1>

      {status === "loading" ? (
        <p className="text-blue-950/70 mt-4">Trwa dołączanie...</p>
      ) : null}

      {status === "ok" ? (
        <p className="text-blue-950/70 mt-4">Gotowe. Przenoszę do klasy…</p>
      ) : null}

      {status === "err" ? (
        <div className="mt-6 rounded-2xl px-4 py-3 text-sm bg-red-50 text-red-800 border border-red-100">
          {error}
        </div>
      ) : null}
    </main>
  );
}