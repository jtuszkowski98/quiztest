import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-blue-100 bg-white/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-extrabold text-blue-950 text-xl">
          QuizTest
        </Link>

        <nav className="flex items-center gap-3">
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
          <Link
            href="/panel"
            className="px-4 py-2 rounded-xl bg-blue-950 text-white font-semibold hover:opacity-90 transition"
          >
            Panel
          </Link>
        </nav>
      </div>
    </header>
  );
}