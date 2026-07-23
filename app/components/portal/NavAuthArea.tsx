"use client";

import Link from "next/link";
import { useAuth } from "./AuthContext";

export function NavAuthArea() {
  const { user, hydrated } = useAuth();

  if (!hydrated) {
    return <span className="hidden sm:inline h-4 w-16" aria-hidden />;
  }

  if (!user) {
    return (
      <Link href="/sign-in" className="hidden text-xs text-text-muted hover:text-text transition-colors sm:inline">
        Log in
      </Link>
    );
  }

  return (
    <Link href="/portal" className="hidden sm:flex items-center gap-2 text-xs text-text-muted hover:text-text transition-colors">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-text text-text-invert text-[10px] font-semibold">
        {user.name.slice(0, 1).toUpperCase()}
      </span>
      My Portal
    </Link>
  );
}
