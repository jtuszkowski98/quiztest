import type { ReactNode } from "react";
import Link from "next/link";

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-blue-950">Panel</h1>

        <nav className="flex gap-3">
          <Link
            href="/panel"
            className="px-4 py-2 rounded-xl bg-blue-950 text-white font-semibold hover:opacity-90 transition"
          >
            Dashboard
          </Link>
        </nav>
      </div>

      <div className="mt-8">{children}</div>
    </div>
  );
}