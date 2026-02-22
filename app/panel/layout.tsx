import type { ReactNode } from "react";

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh" }}>
      <header
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontWeight: 700 }}>QuizTest — Panel</div>
        <nav style={{ display: "flex", gap: 12 }}>
          <a href="/panel" style={{ textDecoration: "none" }}>Dashboard</a>
          <a href="/panel/konto" style={{ textDecoration: "none" }}>Konto</a>
        </nav>
      </header>

      <main style={{ padding: 24 }}>{children}</main>
    </div>
  );
}