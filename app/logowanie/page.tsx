"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-white" />
  );
}

export default function Logowanie() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!isValidEmail(email)) return false;
    if (password.length < 1) return false;
    return true;
  }, [email, password]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError("Podaj poprawny adres email.");
      return;
    }
    if (!password) {
      setError("Wpisz hasło.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Nie udało się zalogować.");
        return;
      }

      router.push("/panel");
      router.refresh();
    } catch {
      setError("Błąd połączenia. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto px-6 py-24">
      <div className="bg-white rounded-3xl border border-blue-100 shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-blue-950">Zaloguj się</h1>
        <p className="mt-2 text-sm text-blue-950/70">
          Zaloguj się do swojego konta QuizTest.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-semibold text-blue-950">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="np. jtuszkowski98@gmail.com"
              className="mt-1 w-full rounded-2xl border border-blue-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              autoComplete="email"
              inputMode="email"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-blue-950">Hasło</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Twoje hasło"
              className="mt-1 w-full rounded-2xl border border-blue-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              autoComplete="current-password"
              type="password"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="w-full rounded-2xl bg-orange-500 text-white py-3.5 font-semibold hover:bg-orange-600 transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner />
                Logowanie…
              </>
            ) : (
              "Zaloguj"
            )}
          </button>
        </form>

        <div className="mt-7 text-sm text-blue-950/70">
          Nie masz konta?{" "}
          <Link href="/rejestracja" className="font-semibold underline">
            Zarejestruj się
          </Link>
        </div>
      </div>
    </main>
  );
}