"use client";

import { signOut, useSession } from "next-auth/react";
import { useAuth } from "@/app/components/portal/AuthContext";

function Toggle({ checked, onChange, label, sub }: { checked: boolean; onChange: (v: boolean) => void; label: string; sub: string }) {
  return (
    <label className="flex items-center justify-between gap-4 py-4 cursor-pointer">
      <div>
        <p className="text-sm text-text">{label}</p>
        <p className="text-xs text-text-muted mt-0.5">{sub}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 h-6 w-11 rounded-full transition-colors ${checked ? "bg-text" : "bg-border"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </label>
  );
}

export default function PortalSettingsPage() {
  const { data: session } = useSession();
  const { notificationPrefs, updateNotificationPrefs } = useAuth();
  const user = session?.user;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-sans font-normal tracking-tight text-text">Settings</h1>
      <p className="mt-2 text-sm text-text-muted">Manage your profile and notification preferences.</p>

      <div className="mt-8 border border-border bg-white p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-faint mb-4">Profile</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 text-xs text-text-muted">
            Name
            <p className="rounded border border-border bg-surface px-3 py-2.5 text-sm text-text">{user?.name}</p>
          </div>
          <div className="flex flex-col gap-1.5 text-xs text-text-muted">
            Email
            <p className="rounded border border-border bg-surface px-3 py-2.5 text-sm text-text">{user?.email}</p>
          </div>
          <p className="text-xs text-text-faint">Editing your profile isn&apos;t available yet.</p>
        </div>
      </div>

      <div className="mt-6 border border-border bg-white p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-faint mb-2">Notifications</h2>
        <div className="divide-y divide-border">
          <Toggle
            checked={notificationPrefs.newReports}
            onChange={(v) => updateNotificationPrefs({ newReports: v })}
            label="New reports"
            sub="Let me know when a tracked institution publishes a new fiscal year report."
          />
          <Toggle
            checked={notificationPrefs.fundUpdates}
            onChange={(v) => updateNotificationPrefs({ fundUpdates: v })}
            label="Fund updates"
            sub="Let me know when a tracked named fund's payout or value changes."
          />
        </div>
        <p className="mt-4 text-xs text-text-faint">
          This is a demo preference — no emails are actually sent, since this prototype has no backend yet.
        </p>
      </div>

      <div className="mt-6 border border-border bg-white p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-faint mb-3">Session</h2>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded border border-border px-5 py-2.5 text-sm font-medium text-text hover:bg-surface-raised transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
