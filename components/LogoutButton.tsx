"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={logout}
      disabled={loading}
      className="px-4 py-2 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 transition font-semibold text-blue-950 disabled:opacity-60"
    >
      {loading ? "Wylogowywanie..." : "Wyloguj"}
    </button>
  );
}