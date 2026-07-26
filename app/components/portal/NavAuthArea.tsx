"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export function NavAuthArea() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="hidden sm:inline h-4 w-16" aria-hidden />;
  }

  if (!session?.user) {
    return (
      <Link href="/sign-in" className="hidden text-xs text-text-muted hover:text-text transition-colors sm:inline">
        Log in
      </Link>
    );
  }

  const isAdmin = session.user.role === "ADMIN";

  return (
    <Link
      href={isAdmin ? "/admin/extract" : "/portal"}
      className="hidden sm:flex items-center gap-2 text-xs text-text-muted hover:text-text transition-colors"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-text text-text-invert text-[10px] font-semibold">
        {(session.user.name ?? "?").slice(0, 1).toUpperCase()}
      </span>
      {isAdmin ? "Admin Console" : "My Portal"}
    </Link>
  );
}
