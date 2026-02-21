"use client";

import { useEffect, useState } from "react";

export default function MeBar() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await fetch("/api/me");
      if (!res.ok) return;
      const data = await res.json().catch(() => null);
      if (!cancelled) setEmail(data?.user?.email ?? null);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!email) return null;

  return (
    <div className="mt-2 text-blue-950/70">
      Zalogowano jako: <span className="font-semibold">{email}</span>
    </div>
  );
}