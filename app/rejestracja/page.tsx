import Link from "next/link";

export default function Rejestracja() {
  return (
    <main className="max-w-md mx-auto px-6 py-24">
      <div className="bg-white rounded-3xl border border-blue-100 shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-blue-950">Załóż konto</h1>

        <form className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Imię"
            className="w-full rounded-2xl border border-blue-200 px-4 py-3 focus:ring-2 focus:ring-blue-300 outline-none"
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-2xl border border-blue-200 px-4 py-3 focus:ring-2 focus:ring-blue-300 outline-none"
          />

          <input
            type="password"
            placeholder="Hasło"
            className="w-full rounded-2xl border border-blue-200 px-4 py-3 focus:ring-2 focus:ring-blue-300 outline-none"
          />

          <button className="w-full rounded-2xl bg-orange-500 text-white py-3 font-semibold hover:bg-orange-600 transition">
            Utwórz konto
          </button>
        </form>

        <div className="mt-6 text-sm text-blue-950/70">
          Masz konto?{" "}
          <Link href="/logowanie" className="font-semibold underline">
            Zaloguj się
          </Link>
        </div>
      </div>
    </main>
  );
}