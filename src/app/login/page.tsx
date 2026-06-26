"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", { email, redirect: false });
    setLoading(false);

    if (result?.error) {
      setError("No account found with that email. Ask your community admin for an invite link.");
    } else {
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      if (session?.user?.tenantSlug) {
        router.push(`/t/${session.user.tenantSlug}`);
      } else {
        router.push("/");
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
              C
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 mt-1 text-sm">Sign in to your community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                <p className="text-red-600 text-xs">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? "Signing in..." : "Continue with Email"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500 mb-2">Don&apos;t have a community yet?</p>
            <a href="/onboarding" className="text-indigo-600 text-sm font-semibold hover:text-indigo-700 transition-colors">
              Create your community →
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Powered by AWS Aurora DSQL · Active-active multi-region
        </p>
      </div>
    </div>
  );
}
