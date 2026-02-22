"use client";

import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    try {
      setLoading(true);
      await fetch("/api/logout", { method: "POST" });
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        background: "white",
        cursor: loading ? "not-allowed" : "pointer",
      }}
    >
      {loading ? "Wylogowywanie..." : "Wyloguj się"}
    </button>
  );
}