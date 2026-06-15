"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    communityName: "",
    slug: "",
    displayName: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "communityName"
        ? { slug: value.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 30) }
        : {}),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.detail || data.error || "Something went wrong"); setLoading(false); return; }

      const result = await signIn("credentials", { email: form.email, redirect: false });
      if (result?.error) {
        setError("Community created! Sign in at /login with your email.");
        setLoading(false);
        return;
      }
      router.push(`/t/${form.slug}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const steps = ["Your community", "Your account"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
              C
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create your community</h1>
            <p className="text-gray-500 mt-1 text-sm">Free forever · Powered by Aurora DSQL</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {steps.map((label, i) => (
              <div key={i} className="flex-1 flex flex-col gap-1">
                <div className={`h-1.5 rounded-full transition-colors ${i + 1 <= step ? "bg-indigo-600" : "bg-gray-200"}`} />
                <span className={`text-xs ${i + 1 === step ? "text-indigo-600 font-medium" : "text-gray-400"}`}>{label}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Community name</label>
                  <input
                    name="communityName"
                    required
                    autoFocus
                    value={form.communityName}
                    onChange={handleChange}
                    placeholder="Acme Corp Community"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Community URL</label>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 bg-gray-50 focus-within:bg-white transition-colors">
                    <span className="px-3 py-3 text-xs text-gray-400 border-r border-gray-200 shrink-0">communiq.app/t/</span>
                    <input
                      name="slug"
                      required
                      value={form.slug}
                      onChange={handleChange}
                      placeholder="acme-corp"
                      pattern="[a-z0-9\-]+"
                      title="Lowercase letters, numbers and hyphens only"
                      className="flex-1 px-3 py-3 text-sm focus:outline-none bg-transparent"
                    />
                  </div>
                  {form.slug && (
                    <p className="text-xs text-indigo-500 mt-1.5">Your community will live at /t/{form.slug}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your name</label>
                  <input
                    name="displayName"
                    required
                    autoFocus
                    value={form.displayName}
                    onChange={handleChange}
                    placeholder="Jane Smith"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-colors"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">Used to sign in — no password needed</p>
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                <p className="text-red-600 text-xs">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors font-medium"
                >
                  ←
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {loading ? "Creating..." : step === 1 ? "Next →" : "Launch Community 🚀"}
              </button>
            </div>
          </form>

          <div className="mt-5 text-center">
            <a href="/login" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Already have a community? Sign in →
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Runs on AWS Aurora DSQL · Active-active multi-region
        </p>
      </div>
    </div>
  );
}
