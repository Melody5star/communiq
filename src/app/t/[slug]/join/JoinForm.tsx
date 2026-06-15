"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function JoinForm({ tenantId, tenantSlug }: { tenantId: string; tenantSlug: string }) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, displayName, email }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed"); setLoading(false); return; }

    await signIn("credentials", { email, redirect: false });
    router.push(`/t/${tenantSlug}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-center text-sm text-gray-600 mb-4">Join this community</p>
      <input
        required
        value={displayName}
        onChange={e => setDisplayName(e.target.value)}
        placeholder="Your name"
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email address"
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
        {loading ? "Joining..." : "Join Community"}
      </button>
    </form>
  );
}
