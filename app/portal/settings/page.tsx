"use client";

import { useState } from "react";
import { useAuth } from "../../components/portal/AuthContext";

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
  const { user, updateProfile, notificationPrefs, updateNotificationPrefs, signOut } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    updateProfile(name.trim(), email.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-sans font-normal tracking-tight text-text">Settings</h1>
      <p className="mt-2 text-sm text-text-muted">Manage your profile and notification preferences.</p>

      <div className="mt-8 border border-border bg-white p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-faint mb-4">Profile</h2>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-xs text-text-muted">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded border border-border bg-white px-3 py-2.5 text-sm text-text focus:outline-none focus:border-text"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs text-text-muted">
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="rounded border border-border bg-white px-3 py-2.5 text-sm text-text focus:outline-none focus:border-text"
            />
          </label>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="rounded bg-text text-text-invert border border-white/10 px-5 py-2.5 text-sm font-medium hover:brightness-125 transition-all"
            >
              Save changes
            </button>
            {saved && <span className="text-xs text-[#006300]">Saved</span>}
          </div>
        </form>
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
          onClick={signOut}
          className="rounded border border-border px-5 py-2.5 text-sm font-medium text-text hover:bg-surface-raised transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
