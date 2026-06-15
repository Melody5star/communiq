"use client";

import { useState } from "react";

export default function UpvoteButton({
  postId,
  initialCount,
  initialVoted,
}: {
  postId: string;
  initialCount: number;
  initialVoted: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    const res = await fetch("/api/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entityType: "post", entityId: postId, reaction: "upvote" }),
    });
    if (res.ok) {
      const data = await res.json();
      const added = data.action === "added";
      setVoted(added);
      setCount((prev) => added ? prev + 1 : Math.max(0, prev - 1));
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={voted ? "Remove upvote" : "Upvote"}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        voted
          ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
          : "bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200"
      } disabled:opacity-50 cursor-pointer`}
    >
      <span className="text-xs">▲</span>
      <span>{count}</span>
    </button>
  );
}
