import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/current-user";
import { modules } from "../../lib/panel-modules";

export default async function PanelPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/logowanie");

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-950">Dashboard</h1>
          <p className="text-blue-950/70 mt-2">
            Witaj, <span className="font-semibold">{user.email}</span>. Wybierz moduł, aby kontynuować.
          </p>
        </div>

        <Link
          href="/panel/konto"
          className="px-5 py-3 rounded-2xl border-2 border-blue-500 text-blue-950 font-semibold hover:bg-blue-900 hover:text-white transition"
        >
          Ustawienia konta
        </Link>
      </div>

      <section className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <Link
            key={m.slug}
            href={m.href}
            className="group bg-white rounded-3xl border border-blue-100 p-7 shadow-xl hover:shadow-2xl transition"
          >
            <div className="text-3xl">{m.icon}</div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-blue-950 group-hover:underline">
                {m.title}
              </h2>
              {m.status ? (
                <span
                  className={`text-xs px-3 py-1 rounded-full border ${
                    m.status === "Wkrótce"
                      ? "border-orange-200 bg-orange-50 text-orange-800"
                      : "border-green-200 bg-green-50 text-green-800"
                  }`}
                >
                  {m.status}
                </span>
              ) : null}
            </div>
            <p className="text-blue-950/70 mt-3">{m.description}</p>
          </Link>
        ))}
      </section>

      <section className="mt-10 bg-white rounded-3xl border border-blue-100 p-8 shadow-xl">
        <h2 className="text-xl font-bold text-blue-950">Szybkie akcje</h2>
        <p className="text-blue-950/70 mt-2">
          Najczęściej używane działania — ułatwiają start pracy.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/panel/quizy/nowy"
            className="px-5 py-3 rounded-2xl bg-blue-950 text-white font-semibold hover:opacity-90 transition"
          >
            + Nowy quiz
          </Link>
          <Link
            href="/panel/klasy/nowa"
            className="px-5 py-3 rounded-2xl border-2 border-blue-500 text-blue-950 font-semibold hover:bg-blue-900 hover:text-white transition"
          >
            + Nowa klasa
          </Link>
          <Link
            href="/panel/wyniki"
            className="px-5 py-3 rounded-2xl border-2 border-blue-500 text-blue-950 font-semibold hover:bg-blue-900 hover:text-white transition"
          >
            Zobacz wyniki
          </Link>
        </div>

        <p className="text-blue-950/60 text-sm mt-4">
          Uwaga: część modułów jest jeszcze w budowie — kafelki są już przygotowane pod cały projekt.
        </p>
      </section>
    </main>
  );
}