"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

// Only ever rendered under /admin — middleware already redirects non-admins away from that route, so this is admin-only nav.
const ADMIN_LINKS = [
  { href: "/admin/extract", label: "Upload Report" },
  { href: "/admin/review", label: "Review Drafts" }, // Adjust if you have a general review page
];

export function DashboardSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  return (
    <aside className="w-64 bg-surface border-r border-border h-full flex flex-col hidden md:flex">
      <div className="p-6">
        <Link href="/" className="text-xl font-playfair font-semibold tracking-tight text-text">
          Pass Impact
        </Link>
        <div className="mt-2 text-xs text-text-muted">Admin Console</div>
      </div>

      <nav className="flex-1 px-4 mt-6 flex flex-col gap-2">
        {ADMIN_LINKS.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                isActive ? "bg-text text-text-invert" : "text-text-muted hover:text-text hover:bg-black/5"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border mt-auto">
        <div className="px-3 py-2 mb-2">
          <div className="text-sm font-medium text-text">{session.user?.name || "User"}</div>
          <div className="text-xs text-text-faint truncate">{session.user?.email}</div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full text-left px-3 py-2 text-sm font-medium text-[#d03b3b] hover:bg-black/5 rounded transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
