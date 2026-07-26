"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { IconLogo, IconHome, IconBuilding, IconWallet, IconSettings } from "../icons";
import type { SVGProps } from "react";

const LINKS: { href: string; label: string; icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement }[] = [
  { href: "/portal", label: "Overview", icon: IconHome },
  { href: "/portal/institutions", label: "My Institutions", icon: IconBuilding },
  { href: "/portal/funds", label: "My Funds", icon: IconWallet },
  { href: "/portal/settings", label: "Settings", icon: IconSettings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <>
      <Link href="/portal" onClick={onNavigate} className="flex items-center gap-2 px-5 h-16 border-b border-border shrink-0">
        <IconLogo className="h-5 w-auto text-text" />
        <span className="text-lg font-bold tracking-tight text-text">Pass Impact</span>
      </Link>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="flex flex-col gap-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-2.5 rounded px-3 py-2.5 text-xs font-medium transition-colors ${
                    active ? "bg-text text-text-invert" : "text-text-muted hover:bg-surface-raised hover:text-text"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-border shrink-0">
        <div className="flex items-center gap-3 rounded px-3 py-2 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-text text-text-invert text-xs font-semibold shrink-0">
            {(user?.name ?? "?").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text truncate">{user?.name}</p>
            <p className="text-xs text-text-faint truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-2.5 rounded px-3 py-2.5 text-xs font-medium text-text-muted hover:bg-surface-raised hover:text-text transition-colors"
        >
          Sign out
        </button>
      </div>
    </>
  );
}

export function PortalNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop: permanent fixed sidebar */}
      <aside className="hidden lg:flex lg:w-64 shrink-0 h-screen sticky top-0 border-r border-border bg-white flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile: slim topbar + slide-over sidebar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-4 border-b border-border bg-white">
        <Link href="/portal" className="flex items-center gap-2">
          <IconLogo className="h-5 w-auto text-text" />
          <span className="text-base font-bold tracking-tight text-text">Pass Impact</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded border border-border text-text"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-4 w-4">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>

      <div
        onClick={() => setMobileOpen(false)}
        className={`lg:hidden fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-border flex flex-col transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        <SidebarContent onNavigate={() => setMobileOpen(false)} />
      </aside>
    </>
  );
}
