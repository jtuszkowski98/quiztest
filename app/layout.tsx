import "./globals.css";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "QuizTest",
  description: "Quizy, testy i fiszki w nowoczesnej platformie.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-blue-100 bg-white/70 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-512.png"
            alt="QuizTest"
            width={34}
            height={34}
            priority
          />
          <span className="font-semibold text-lg text-blue-950">
            QuizTest
          </span>
        </Link>

        {/* PRAWA STRONA */}
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

      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className="min-h-screen text-gray-900 relative">
        
        {/* TŁO: jasny błękit w środku, boki białe */}
        <div
          className="fixed inset-0 -z-10"
          style={{
            background:
              "radial-gradient(circle at center, #e6f2ff 0%, #f0f7ff 40%, #ffffff 75%)",
          }}
        />

        <Header />
        {children}
      </body>
    </html>
  );
}