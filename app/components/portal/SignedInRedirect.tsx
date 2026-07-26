"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

/** Renders nothing — bounces a signed-in visitor from a public/marketing page into their home (portal for donors, admin console for admins). */
export function SignedInRedirect({ to = "/portal" }: { to?: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    if (status === "authenticated") router.replace(isAdmin ? "/admin/extract" : to);
  }, [status, isAdmin, to, router]);

  return null;
}
