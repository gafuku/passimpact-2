"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../components/portal/AuthContext";
import { getInstitution, getLatestReport, getNamedFund } from "../components/report/reportData";
import { getRecentChats, type RecentChat } from "../components/report/recentChats";
import { IconBuilding, IconWallet, IconArrowRight } from "../components/icons";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-white p-5">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-text">{value}</p>
    </div>
  );
}

function RecentChatsPanel() {
  const { user, hydrated } = useAuth();
  const [chats, setChats] = useState<RecentChat[]>([]);

  useEffect(() => {
    if (hydrated && user) setChats(getRecentChats(user.email));
  }, [hydrated, user]);

  return (
    <div className="xl:w-80 shrink-0">
      <div className="border border-border bg-white p-5 xl:sticky xl:top-8">
        <h2 className="text-sm font-semibold text-text mb-1">Recent AI chats</h2>
        <p className="text-xs text-text-muted mb-4">Conversations you've had across your reports, saved to your portal.</p>

        {chats.length === 0 ? (
          <p className="text-xs text-text-faint italic">
            No conversations yet — open a report and ask its assistant something to see it here.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {chats.map((chat) => {
              const institution = getInstitution(chat.institutionSlug);
              if (!institution) return null;
              return (
                <li key={`${chat.institutionSlug}-${chat.year}`}>
                  <Link
                    href={`/portal/reports/${chat.institutionSlug}/${chat.year}`}
                    className="block rounded border border-border p-3 hover:bg-surface-raised transition-colors"
                  >
                    <p className="text-xs font-semibold text-text">{institution.name} · FY{chat.year}</p>
                    <p className="mt-1 text-xs text-text-muted line-clamp-2">{chat.lastMessage}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function PortalOverviewPage() {
  const { user, followedInstitutions, followedFunds } = useAuth();

  const institutions = followedInstitutions.map((slug) => ({ institution: getInstitution(slug), latest: getLatestReport(slug) })).filter((x) => x.institution && x.latest);
  const funds = followedFunds.map((id) => getNamedFund(id)).filter((f): f is NonNullable<typeof f> => !!f);

  const totalEndowmentTracked = institutions.reduce((sum, x) => sum + (x.latest?.endowment ?? 0), 0);
  const totalFundValue = funds.reduce((sum, f) => sum + f.marketValue, 0);

  const activity = [
    ...institutions.map((x) => ({
      key: `report-${x.institution!.slug}`,
      text: `${x.latest!.fy} report published for ${x.institution!.name}`,
      date: x.latest!.published,
    })),
    ...funds.map((f) => ({
      key: `fund-${f.id}`,
      text: `${f.name} payout updated for FY2025`,
      date: "November 2025",
    })),
  ].slice(0, 6);

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-sans font-normal tracking-tight text-text">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="mt-2 text-sm text-text-muted max-w-xl">
          Here's what's new across the institutions and named funds you're tracking.
        </p>

        {/* Summary stats */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Institutions tracked" value={String(followedInstitutions.length)} />
          <StatCard label="Named funds tracked" value={String(followedFunds.length)} />
          <StatCard label="Combined endowment" value={`$${totalEndowmentTracked.toFixed(1)}B`} />
          <StatCard label="Combined fund value" value={`$${totalFundValue.toFixed(0)}M`} />
        </div>

        {/* Institutions + Funds quick lists */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="border border-border bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text flex items-center gap-2">
                <IconBuilding className="h-4 w-4 text-text-faint" /> Institutions you're tracking
              </h2>
              <Link href="/portal/institutions" className="text-xs text-brand hover:underline">Manage →</Link>
            </div>
            {institutions.length === 0 ? (
              <p className="text-xs text-text-faint italic">You're not tracking any institutions yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {institutions.map(({ institution, latest }) => (
                  <li key={institution!.slug}>
                    <Link
                      href={`/portal/reports/${institution!.slug}/${latest!.year}`}
                      className="flex items-center justify-between rounded px-3 py-2.5 text-sm hover:bg-surface-raised transition-colors"
                    >
                      <span className="text-text">{institution!.name}</span>
                      <span className="text-text-faint text-xs flex items-center gap-1">
                        {latest!.fy} · ${latest!.totalRevenue.toFixed(2)}B <IconArrowRight className="h-3 w-3" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border border-border bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text flex items-center gap-2">
                <IconWallet className="h-4 w-4 text-text-faint" /> Funds you're tracking
              </h2>
              <Link href="/portal/funds" className="text-xs text-brand hover:underline">Manage →</Link>
            </div>
            {funds.length === 0 ? (
              <p className="text-xs text-text-faint italic">You're not tracking any named funds yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {funds.map((fund) => (
                  <li key={fund.id}>
                    <Link
                      href="/portal/funds"
                      className="flex items-center justify-between rounded px-3 py-2.5 text-sm hover:bg-surface-raised transition-colors"
                    >
                      <span className="text-text">{fund.name}</span>
                      <span className="text-text-faint text-xs flex items-center gap-1">
                        ${fund.marketValue}M <IconArrowRight className="h-3 w-3" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Activity */}
        <div className="mt-8 border border-border bg-white p-5">
          <h2 className="text-sm font-semibold text-text mb-4">Recent activity</h2>
          {activity.length === 0 ? (
            <p className="text-xs text-text-faint italic">No activity yet — track an institution or fund to see updates here.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {activity.map((a) => (
                <li key={a.key} className="flex items-center gap-3 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
                  <span className="text-text-muted flex-1">{a.text}</span>
                  <span className="text-text-faint text-xs shrink-0">{a.date}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <RecentChatsPanel />
    </div>
  );
}
