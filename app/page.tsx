import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section className="max-w-6xl mx-auto px-6 pt-28 pb-28">
        <div className="max-w-3xl">
          <h1 className="text-6xl font-extrabold leading-tight text-blue-950">
            Quizy, testy i fiszki.
            <span className="block bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
              Nowoczesna platforma do nauki.
            </span>
          </h1>

          <p className="text-xl text-blue-950/80 mt-8 leading-relaxed">
            Twórz egzaminy, zarządzaj klasami, analizuj wyniki i ucz się szybciej.
            Prosty interfejs, szybkie działanie i przemyślany design.
          </p>

          <div className="mt-10 flex gap-5">
            <Link
              href="/rejestracja"
              className="px-8 py-4 rounded-2xl bg-orange-500 text-white text-lg font-semibold hover:bg-orange-600 transition shadow-lg"
            >
              Zacznij za darmo
            </Link>

            <Link
              href="/logowanie"
              className="px-8 py-4 rounded-2xl border-2 border-blue-500 text-blue-950 text-lg font-semibold hover:bg-blue-900 hover:text-white transition"
            >
              Zaloguj się
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="bg-white rounded-3xl border border-blue-100 p-8 shadow-xl hover:shadow-2xl transition">
            <div className="text-3xl">🎓</div>
            <h3 className="font-bold text-xl text-blue-950 mt-4">
              Dla ucznia
            </h3>
            <p className="text-blue-950/70 mt-4">
              Rozwiązuj quizy, egzaminy i ucz się z fiszek.
              Śledź postępy i poprawiaj swoje wyniki.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-blue-100 p-8 shadow-xl hover:shadow-2xl transition">
            <div className="text-3xl">🧑‍🏫</div>
            <h3 className="font-bold text-xl text-blue-950 mt-4">
              Dla nauczyciela
            </h3>
            <p className="text-blue-950/70 mt-4">
              Twórz klasy, publikuj testy, analizuj wyniki
              i oceniaj uczniów w jednym miejscu.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-blue-100 p-8 shadow-xl hover:shadow-2xl transition">
            <div className="text-3xl">🚀</div>
            <h3 className="font-bold text-xl text-blue-950 mt-4">
              Startupowy flow
            </h3>
            <p className="text-blue-950/70 mt-4">
              Szybkie działanie, przejrzysty interfejs,
              łatwe udostępnianie i rozwój funkcji.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}