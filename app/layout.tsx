import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import HeaderAuth from "@/components/HeaderAuth";

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
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-512.png"
            alt="QuizTest"
            width={34}
            height={34}
            priority
          />
          <span className="font-semibold text-lg text-blue-950">QuizTest</span>
        </Link>

        <HeaderAuth />
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
        {/* TŁO: boki białe, środek jasny błękit */}
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