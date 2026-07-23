"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";

/** Renders nothing — bounces a signed-in visitor from a public/marketing page into the portal. */
export function SignedInRedirect({ to = "/portal" }: { to?: string }) {
  const { user, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && user) router.replace(to);
  }, [hydrated, user, to, router]);

  return null;
}
