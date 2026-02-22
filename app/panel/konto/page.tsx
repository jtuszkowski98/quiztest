import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/current-user";
import Link from "next/link";

export default async function KontoPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/logowanie");

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-blue-950">Konto</h1>
        <Link
          href="/panel"
          className="text-blue-950/80 hover:text-blue-950 underline"
        >
          ← Wróć do panelu
        </Link>
      </div>

      <section className="mt-8 bg-white rounded-3xl border border-blue-100 p-8 shadow-xl">
        <h2 className="text-xl font-bold text-blue-950">Dane konta</h2>

        <dl className="mt-6 grid gap-4">
          <div className="flex flex-col">
            <dt className="text-sm text-blue-950/60">Email</dt>
            <dd className="text-lg font-semibold text-blue-950">{user.email}</dd>
          </div>

          <div className="flex flex-col">
            <dt className="text-sm text-blue-950/60">Data utworzenia</dt>
            <dd className="text-lg font-semibold text-blue-950">
              {new Date(user.createdAt).toLocaleString("pl-PL")}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-8 bg-white rounded-3xl border border-blue-100 p-8 shadow-xl">
        <h2 className="text-xl font-bold text-blue-950">Bezpieczeństwo</h2>
        <p className="text-blue-950/70 mt-2">
          Zmień hasło, jeśli podejrzewasz, że ktoś mógł uzyskać dostęp do Twojego konta.
        </p>

        <div className="mt-6">
          <Link
            href="/panel/konto/haslo"
            className="inline-flex px-6 py-3 rounded-2xl bg-blue-950 text-white font-semibold hover:opacity-90 transition"
          >
            Zmień hasło
          </Link>
        </div>
      </section>
    </main>
  );
}