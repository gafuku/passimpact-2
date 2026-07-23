"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";

export function PortalGuard({ children }: { children: React.ReactNode }) {
  const { user, hydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (hydrated && !user) {
      router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, user, pathname, router]);

  if (!hydrated) {
    return <div className="h-screen flex items-center justify-center bg-surface text-xs text-text-muted">Loading your portal…</div>;
  }
  if (!user) {
    return <div className="h-screen flex items-center justify-center bg-surface text-xs text-text-muted">Redirecting to sign in…</div>;
  }
  return <>{children}</>;
}
