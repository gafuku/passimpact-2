"use client";

import { IconChevronDown } from "../icons";
import { useAuth } from "./AuthContext";

/** The marketing nav dropdowns + links — hidden once a donor is signed in, so the nav doesn't invite them back to public pages. */
export function PublicNavLinks() {
  const { user, hydrated } = useAuth();
  if (hydrated && user) return null;

  return (
    <ul className="hidden items-center gap-1 lg:flex text-text-muted">
      <li>
        <button className="hover:text-text inline-flex items-center gap-1 px-3 py-2 text-xs transition-colors">
          Platform <IconChevronDown className="h-3 w-3 opacity-50" />
        </button>
      </li>
      <li>
        <button className="hover:text-text inline-flex items-center gap-1 px-3 py-2 text-xs transition-colors">
          Features <IconChevronDown className="h-3 w-3 opacity-50" />
        </button>
      </li>
      <li>
        <button className="hover:text-text inline-flex items-center gap-1 px-3 py-2 text-xs transition-colors">
          Resources <IconChevronDown className="h-3 w-3 opacity-50" />
        </button>
      </li>
      <li>
        <a href="/report" className="hover:text-text px-3 py-2 text-xs transition-colors">
          Institutions
        </a>
      </li>
      <li>
        <a href="/about" className="hover:text-text px-3 py-2 text-xs transition-colors">
          About
        </a>
      </li>
    </ul>
  );
}

/** The guest-facing "See a Sample Report" CTA — replaced with a portal shortcut once signed in. */
export function PublicNavCta() {
  const { user, hydrated } = useAuth();

  if (hydrated && user) {
    return (
      <a
        href="/portal"
        className="inline-flex items-center justify-center font-normal font-sans rounded transition-all duration-200 bg-text text-text-invert border border-white/10 hover:brightness-125 px-5 py-2 text-xs tracking-wide"
      >
        Go to my portal
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
