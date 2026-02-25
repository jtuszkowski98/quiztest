"use client";

import { useState } from "react";

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <button
      onClick={copy}
      title="Skopiuj"
      className="ml-2 inline-flex items-center justify-center rounded-md border border-blue-200 bg-white p-1.5 text-blue-900 hover:bg-blue-50 transition"
    >
      {copied ? (
        <span className="text-green-600 text-xs font-semibold">✓</span>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="9" y="9" width="13" height="13" rx="2"></rect>
          <path d="M5 15V5a2 2 0 0 1 2-2h10"></path>
        </svg>
      )}
    </button>
  );
}