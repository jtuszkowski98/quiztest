"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type User = {
  id: string;
  email: string;
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  async function loadUser() {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLoading(true);
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await fetch("/api/logout", { method: "POST" });
      setUser(null);
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="border-b border-blue-100 bg-white/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-extrabold text-blue-950 text-xl">
          QuizTest
        </Link>

        <nav className="flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <Link
                href="/panel"
                className="px-4 py-2 rounded-xl bg-blue-950 text-white font-semibold hover:opacity-90 transition"
              >
                Panel
              </Link>

              <Link
                href="/panel/konto"
                className="px-4 py-2 rounded-xl border-2 border-blue-500 text-blue-950 font-semibold hover:bg-blue-900 hover:text-white transition"
              >
                Konto
              </Link>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="px-4 py-2 rounded-xl border-2 border-blue-500 text-blue-950 font-semibold hover:bg-blue-900 hover:text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loggingOut ? "Wylogowywanie..." : "Wyloguj się"}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/rejestracja"
                className="px-4 py-2 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
              >
                Rejestracja
              </Link>
              <Link
                href="/logowanie"
                className="px-4 py-2 rounded-xl border-2 border-blue-500 text-blue-950 font-semibold hover:bg-blue-900 hover:text-white transition"
              >
                Logowanie
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}