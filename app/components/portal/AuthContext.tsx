"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type NotificationPrefs = { newReports: boolean; fundUpdates: boolean };

type AuthState = {
  followedInstitutions: string[];
  followedFunds: string[];
  notificationPrefs: NotificationPrefs;
};

type AuthContextValue = AuthState & {
  hydrated: boolean;
  updateNotificationPrefs: (prefs: Partial<NotificationPrefs>) => void;
  toggleFollowInstitution: (slug: string) => void;
  toggleFollowFund: (id: string) => void;
  isFollowingInstitution: (slug: string) => boolean;
  isFollowingFund: (id: string) => boolean;
};

const STORAGE_KEY = "pass-impact:portal-follows";

// Follows start empty — institutions/funds now come from whatever's actually been
// published to the database, so there's no fixed slug we can safely pre-populate.
const DEFAULT_STATE: AuthState = {
  followedInstitutions: [],
  followedFunds: [],
  notificationPrefs: { newReports: true, fundUpdates: true },
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState((prev) => ({ ...prev, ...JSON.parse(raw) }));
    } catch {
      // ignore malformed/blocked storage — fall back to signed-out state
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage unavailable (private browsing, etc.) — session just won't persist
    }
  }, [state, hydrated]);

  const updateNotificationPrefs = useCallback((prefs: Partial<NotificationPrefs>) => {
    setState((prev) => ({ ...prev, notificationPrefs: { ...prev.notificationPrefs, ...prefs } }));
  }, []);

  const toggleFollowInstitution = useCallback((slug: string) => {
    setState((prev) => ({
      ...prev,
      followedInstitutions: prev.followedInstitutions.includes(slug)
        ? prev.followedInstitutions.filter((s) => s !== slug)
        : [...prev.followedInstitutions, slug],
    }));
  }, []);

  const toggleFollowFund = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      followedFunds: prev.followedFunds.includes(id) ? prev.followedFunds.filter((f) => f !== id) : [...prev.followedFunds, id],
    }));
  }, []);

  const value: AuthContextValue = {
    ...state,
    hydrated,
    updateNotificationPrefs,
    toggleFollowInstitution,
    toggleFollowFund,
    isFollowingInstitution: (slug) => state.followedInstitutions.includes(slug),
    isFollowingFund: (id) => state.followedFunds.includes(id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
