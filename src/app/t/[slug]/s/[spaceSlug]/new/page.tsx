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
      .then(r => r.json())
      .then(d => { if (d.tenantId) setIds(d); });
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
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <a href={`/t/${slug}/s/${spaceSlug}`} className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to #{spaceSlug}
          </a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">New Post</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
            <textarea
              required
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Share details, ask a question, or start a discussion..."
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" disabled={loading || !ids} className="w-full bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {loading ? "Posting..." : "Post"}
          </button>
        </form>
      </main>
    </div>
  );
}
