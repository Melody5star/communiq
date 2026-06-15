"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Comment {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
}

export default function CommentSection({
  tenantId,
  postId,
  comments: initial,
}: {
  tenantId: string;
  postId: string;
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

    setComments(prev => [...prev, {
      id: data.commentId,
      body,
      authorName: "You",
      createdAt: new Date().toISOString(),
    }]);
    setBody("");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-gray-900">{comments.length} {comments.length === 1 ? "Reply" : "Replies"}</h2>

      {comments.map(c => (
        <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
              {c.authorName[0].toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700">{c.authorName}</span>
            <span className="text-xs text-gray-400 ml-auto">{new Date(c.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.body}</p>
        </div>
      ))}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Write a reply..."
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={loading || !body.trim()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Posting..." : "Reply"}
        </button>
      </form>
    </div>
  );
}
