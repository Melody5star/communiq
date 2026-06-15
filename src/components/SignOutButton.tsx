"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={className ?? "text-xs text-gray-400 hover:text-red-500 transition-colors"}
    >
      Sign out
    </button>
  );
}
