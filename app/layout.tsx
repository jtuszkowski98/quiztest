import "./globals.css";
import type { ReactNode } from "react";
import Header from "../components/Header";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl">
      <body className="min-h-screen bg-slate-50 text-blue-950">
        <Header />
        {children}
      </body>
    </html>
  );
}