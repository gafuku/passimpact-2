"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import axiosInstance from "../../lib/axiosInstance";

export type NotificationPrefs = { newReports: boolean; fundUpdates: boolean };

type AuthContextValue = {
  followedInstitutions: string[];
  followedFunds: string[];
  notificationPrefs: NotificationPrefs;
  hydrated: boolean;
  updateNotificationPrefs: (prefs: Partial<NotificationPrefs>) => void;
  toggleFollowInstitution: (slug: string) => void;
  toggleFollowFund: (id: string) => void;
  isFollowingInstitution: (slug: string) => boolean;
  isFollowingFund: (id: string) => boolean;
};

// This is a demo preference with no email delivery behind it (see the portal
// settings page), so it isn't worth a DB column — just namespaced by user id so
// one account's toggle doesn't visually bleed into the next account signed into
// the same browser.
const DEFAULT_PREFS: NotificationPrefs = { newReports: true, fundUpdates: true };
const prefsKey = (userId: string) => `pass-impact:notification-prefs:${userId}`;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const userId = session?.user?.id ?? null;

  const [followedInstitutions, setFollowedInstitutions] = useState<string[]>([]);
  const [followedFunds, setFollowedFunds] = useState<string[]>([]);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [hydrated, setHydrated] = useState(false);
  const loadedForUser = useRef<string | null>(null);

  // Followed institutions/funds are real, DB-backed per-user data — fetched fresh
  // whenever the signed-in user id changes (including sign-out then sign-in as a
  // different account in the same browser) so one donor never inherits another's
  // tracked institutions the way a single shared localStorage key used to allow.
  useEffect(() => {
    if (status === "loading") return;

    if (!userId) {
      setFollowedInstitutions([]);
      setFollowedFunds([]);
      setNotificationPrefs(DEFAULT_PREFS);
      loadedForUser.current = null;
      setHydrated(true);
      return;
    }

    if (loadedForUser.current === userId) return;
    loadedForUser.current = userId;
    setHydrated(false);

    try {
      const raw = localStorage.getItem(prefsKey(userId));
      setNotificationPrefs(raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS);
    } catch {
      setNotificationPrefs(DEFAULT_PREFS);
    }

    axiosInstance
      .get("/api/portal/follows")
      .then((res) => {
        setFollowedInstitutions(res.data.institutionSlugs ?? []);
        setFollowedFunds(res.data.fundIds ?? []);
      })
      .catch(() => {
        setFollowedInstitutions([]);
        setFollowedFunds([]);
      })
      .finally(() => setHydrated(true));
  }, [userId, status]);

  const updateNotificationPrefs = useCallback(
    (prefs: Partial<NotificationPrefs>) => {
      setNotificationPrefs((prev) => {
        const next = { ...prev, ...prefs };
        if (userId) {
          try {
            localStorage.setItem(prefsKey(userId), JSON.stringify(next));
          } catch {
            // storage unavailable (private browsing, etc.) — preference just won't persist
          }
        }
        return next;
      });
    },
    [userId]
  );

  const toggleFollowInstitution = useCallback(
    (slug: string) => {
      if (!userId) return;
      const wasFollowing = followedInstitutions.includes(slug);
      setFollowedInstitutions((prev) => (wasFollowing ? prev.filter((s) => s !== slug) : [...prev, slug]));
      axiosInstance.post("/api/portal/follows/institutions", { slug }).catch(() => {
        setFollowedInstitutions((prev) => (wasFollowing ? [...prev, slug] : prev.filter((s) => s !== slug)));
      });
    },
    [userId, followedInstitutions]
  );

  const toggleFollowFund = useCallback(
    (id: string) => {
      if (!userId) return;
      const wasFollowing = followedFunds.includes(id);
      setFollowedFunds((prev) => (wasFollowing ? prev.filter((f) => f !== id) : [...prev, id]));
      axiosInstance.post("/api/portal/follows/funds", { id }).catch(() => {
        setFollowedFunds((prev) => (wasFollowing ? [...prev, id] : prev.filter((f) => f !== id)));
      });
    },
    [userId, followedFunds]
  );

  const value: AuthContextValue = {
    followedInstitutions,
    followedFunds,
    notificationPrefs,
    hydrated,
    updateNotificationPrefs,
    toggleFollowInstitution,
    toggleFollowFund,
    isFollowingInstitution: (slug) => followedInstitutions.includes(slug),
    isFollowingFund: (id) => followedFunds.includes(id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
