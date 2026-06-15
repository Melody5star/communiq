"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Comment {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
}

function timeAgoClient(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const COLORS = ["bg-indigo-100 text-indigo-600", "bg-purple-100 text-purple-600", "bg-pink-100 text-pink-600", "bg-teal-100 text-teal-600", "bg-orange-100 text-orange-600"];

export default function CommentSection({
  tenantId,
  postId,
  currentUserName,
  comments: initial,
}: {
  tenantId: string;
  postId: string;
  currentUserName: string;
  comments: Comment[];
}) {
  const [comments, setComments] = useState(initial);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, postId, body }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error || "Failed"); return; }

    setComments((prev) => [...prev, {
      id: data.commentId,
      body,
      authorName: currentUserName,
      createdAt: new Date().toISOString(),
    }]);
    setBody("");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-400">
        {comments.length} {comments.length === 1 ? "Reply" : "Replies"}
      </h2>

      {comments.length === 0 && (
        <div className="text-center py-6 text-gray-400 text-sm">
          No replies yet — be the first to respond!
        </div>
      )}

      {comments.map((c, i) => (
        <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${COLORS[i % COLORS.length]}`}>
            {c.authorName[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm font-semibold text-gray-800">{c.authorName}</span>
              <span className="text-xs text-gray-400">{timeAgoClient(c.createdAt)}</span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{c.body}</p>
          </div>
        </div>
      ))}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a reply..."
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-gray-50 focus:bg-white transition-colors"
        />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !body.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 transition-colors"
          >
            {loading ? "Posting..." : "Reply"}
          </button>
        </div>
      </form>
    </div>
  );
}
