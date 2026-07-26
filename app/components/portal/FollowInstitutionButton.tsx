"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useAuth } from "./AuthContext";

export function FollowInstitutionButton({ slug }: { slug: string }) {
  const { status } = useSession();
  const { isFollowingInstitution, toggleFollowInstitution } = useAuth();

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    return (
      <Link
        href={`/sign-in?redirect=${encodeURIComponent(`/report/${slug}`)}`}
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-text-muted hover:bg-surface-raised hover:text-text transition-colors"
      >
        Sign in to track
      </Link>
    );
  }

  const following = isFollowingInstitution(slug);
  return (
    <button
      onClick={() => toggleFollowInstitution(slug)}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
        following ? "border-border bg-surface-raised text-text" : "border-white/10 bg-text text-text-invert hover:brightness-125"
      }`}
    >
      {following ? "✓ Tracking" : "Track this institution"}
    </button>
  );
}
