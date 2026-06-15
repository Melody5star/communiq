"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className={`shrink-0 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
        copied
          ? "bg-green-500 text-white"
          : "bg-indigo-600 text-white hover:bg-indigo-700"
      }`}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
