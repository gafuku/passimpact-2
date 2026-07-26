"use client";

import { useSession } from "next-auth/react";

/** The marketing nav links — hidden once a donor is signed in, so the nav doesn't invite them back to public pages. */
export function PublicNavLinks() {
  const { data: session, status } = useSession();
  if (status !== "loading" && session?.user) return null;

  return (
    <ul className="hidden items-center gap-1 lg:flex text-text-muted">
      <li>
        <a href="/report" className="hover:text-text px-3 py-2 text-xs transition-colors">
          Institutions
        </a>
      </li>
    </ul>
  );
}

/** The guest-facing "See a Sample Report" CTA — replaced with a portal shortcut once signed in. */
export function PublicNavCta() {
  const { data: session, status } = useSession();

  if (status !== "loading" && session?.user) {
    const isAdmin = session.user.role === "ADMIN";
    return (
      <a
        href={isAdmin ? "/admin/extract" : "/portal"}
        className="inline-flex items-center justify-center font-normal font-sans rounded transition-all duration-200 bg-text text-text-invert border border-white/10 hover:brightness-125 px-5 py-2 text-xs tracking-wide"
      >
        {isAdmin ? "Go to admin console" : "Go to my portal"}
      </a>
    );
  }

  return (
    <a
      href="/report"
      className="inline-flex items-center justify-center font-normal font-sans rounded transition-all duration-200 bg-text text-text-invert border border-white/10 hover:brightness-125 px-5 py-2 text-xs tracking-wide"
    >
      See a Sample Report
    </a>
  );
}
