"use client";

import { useState } from "react";

interface Result {
  id: string;
  title: string;
  body: string;
  space: { name: string; slug: string };
  author: { displayName: string };
}

export default function SearchBar({ tenantId, tenantSlug }: { tenantId: string; tenantSlug: string }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&tenantId=${tenantId}`);
    const data = await res.json();
    setResults(data.results || []);
    setLoading(false);
  }

  return (
    <div className="mb-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={q}
          onChange={e => { setQ(e.target.value); if (!e.target.value) { setResults([]); setSearched(false); } }}
          placeholder="Search posts..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
          {loading ? "..." : "Search"}
        </button>
      </form>

      {searched && (
        <div className="mt-3 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {results.length === 0 ? (
            <p className="text-sm text-gray-400 p-4">No results for &quot;{q}&quot;</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {results.map(r => (
                <li key={r.id}>
                  <a href={`/t/${tenantSlug}/s/${r.space.slug}/${r.id}`} className="block p-4 hover:bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">{r.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">#{r.space.name} · {r.author.displayName}</p>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
