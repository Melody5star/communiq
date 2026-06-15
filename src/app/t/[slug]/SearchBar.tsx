"use client";

import { useState, useEffect, useRef } from "react";

interface Result {
  id: string;
  title: string;
  body: string;
  upvotes: number;
  space: { name: string; slug: string };
  author: { displayName: string };
}

export default function SearchBar({ tenantId, tenantSlug }: { tenantId: string; tenantSlug: string }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&tenantId=${tenantId}`);
      const data = await res.json();
      setResults(data.results || []);
      setOpen(true);
      setLoading(false);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q, tenantId]);

  return (
    <div ref={containerRef} className="relative mb-6">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => { if (results.length) setOpen(true); }}
          placeholder="Search posts..."
          className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm"
        />
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 animate-pulse">searching...</span>
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-gray-200 shadow-xl z-20 overflow-hidden">
          {results.length === 0 ? (
            <p className="text-sm text-gray-400 px-4 py-3">No results for &quot;{q}&quot;</p>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
              {results.map((r) => (
                <li key={r.id}>
                  <a
                    href={`/t/${tenantSlug}/s/${r.space.slug}/${r.id}`}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <span className="text-gray-400 text-sm mt-0.5 shrink-0">#</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{r.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{r.space.name} · {r.author.displayName} · ▲ {r.upvotes}</p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400">{results.length} result{results.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      )}
    </div>
  );
}
