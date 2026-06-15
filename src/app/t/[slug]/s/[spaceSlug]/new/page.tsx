"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function NewPost() {
  const params = useParams();
  const slug = params.slug as string;
  const spaceSlug = params.spaceSlug as string;
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ids, setIds] = useState<{ tenantId: string; spaceId: string } | null>(null);

  useEffect(() => {
    fetch(`/api/spaces/resolve?tenantSlug=${slug}&spaceSlug=${spaceSlug}`)
      .then((r) => r.json())
      .then((d) => { if (d.tenantId) setIds(d); });
  }, [slug, spaceSlug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ids) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: ids.tenantId, spaceId: ids.spaceId, title, body }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Failed"); return; }
    router.push(`/t/${slug}/s/${spaceSlug}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <a href={`/t/${slug}/s/${spaceSlug}`} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 font-medium">
            ← Back to #{spaceSlug}
          </a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">New Post</h1>
          <p className="text-sm text-gray-500 mt-1">Posting to <span className="font-medium text-indigo-600">#{spaceSlug}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Body</label>
            <textarea
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share details, ask a question, or start a discussion..."
              rows={8}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors resize-none leading-relaxed"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3">
              <p className="text-red-600 text-xs">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !ids || !title.trim() || !body.trim()}
              className="flex-1 bg-indigo-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? "Posting..." : "Publish Post"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
