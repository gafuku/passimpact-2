"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function PortalGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
    } else if (status === "authenticated" && isAdmin) {
      // The donor portal isn't part of the admin experience — admins live in /admin.
      router.replace("/admin/extract");
    }
  }, [status, isAdmin, pathname, router]);

  if (status === "loading") {
    return <div className="h-screen flex items-center justify-center bg-surface text-xs text-text-muted">Loading your portal…</div>;
  }
  if (status === "unauthenticated" || isAdmin) {
    return <div className="h-screen flex items-center justify-center bg-surface text-xs text-text-muted">Redirecting…</div>;
  }
  return <>{children}</>;
}
