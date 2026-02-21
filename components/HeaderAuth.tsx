"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type User = { id: string; email: string } | null;

export default function HeaderAuth() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User>(null);
  const [ready, setReady] = useState(false);

  async function refreshMe() {
    try {
      const res = await fetch("/api/me", {
        cache: "no-store",
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
      } else {
        const data = await res.json();
        setUser(data?.user ?? null);
      }
    } finally {
      setReady(true);
    }
  }

  async function logout() {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    router.push("/");
    router.refresh();
  }

  // odśwież przy starcie i zmianie strony
  useEffect(() => {
    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!ready) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-10 w-24 rounded-xl bg-white/60 border border-blue-100 animate-pulse" />
        <div className="h-10 w-28 rounded-xl bg-white/60 border border-blue-100 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/logowanie"
          className="px-4 py-2 rounded-xl text-blue-950 hover:bg-blue-100 transition font-semibold"
        >
          Logowanie
        </Link>

        <Link
          href="/rejestracja"
          className="px-4 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition shadow-md font-semibold"
        >
          Rejestracja
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/panel"
        className="px-4 py-2 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 transition font-semibold text-blue-950"
      >
        Panel
      </Link>

      <button
        onClick={logout}
        className="px-4 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition shadow-md font-semibold"
      >
        Wyloguj
      </button>
    </div>
  );
}