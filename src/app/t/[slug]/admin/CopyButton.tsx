"use client";

export default function CopyButton({ text }: { text: string }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text)}
      className="shrink-0 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-700"
    >
      Copy
    </button>
  );
}
