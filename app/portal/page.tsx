"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useAuth } from "@/app/components/portal/AuthContext";
import { usePublicInstitutions } from "@/app/hooks/usePublicInstitutions";
import { usePublicNamedFunds } from "@/app/hooks/usePublicNamedFunds";
import { useRecentChats } from "@/app/hooks/useRecentChats";
import { IconBuilding, IconWallet, IconArrowRight } from "@/app/components/icons";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-white p-5">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-text">{value}</p>
    </div>
  );
}

function RecentChatsPanel() {
  const { chats, loading } = useRecentChats();

  return (
    <div className="xl:w-80 shrink-0">
      <div className="border border-border bg-white p-5 xl:sticky xl:top-8">
        <h2 className="text-sm font-semibold text-text mb-1">Recent AI chats</h2>
        <p className="text-xs text-text-muted mb-4">Conversations you&apos;ve had across your reports, saved to your portal.</p>

        {loading ? (
          <p className="text-xs text-text-faint italic">Loading…</p>
        ) : chats.length === 0 ? (
          <p className="text-xs text-text-faint italic">
            No conversations yet — open a report and ask its assistant something to see it here.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {chats.map((chat) => (
              <li key={`${chat.institutionSlug}-${chat.year}`}>
                <Link
                  href={`/portal/reports/${chat.institutionSlug}/${chat.year}`}
                  className="block rounded border border-border p-3 hover:bg-surface-raised transition-colors"
                >
                  <p className="text-xs font-semibold text-text">
                    {chat.institutionName} · FY{chat.year}
                  </p>
                  <p className="mt-1 text-xs text-text-muted line-clamp-2">{chat.lastMessage}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function PortalOverviewPage() {
  const { followedInstitutions, followedFunds } = useAuth();
  const { data: session } = useSession();
  const user = session?.user;

  const { institutions: allInstitutions, loading: institutionsLoading } = usePublicInstitutions();
  const { namedFunds: allNamedFunds, loading: fundsLoading } = usePublicNamedFunds();

  const institutions = allInstitutions.filter((i) => followedInstitutions.includes(i.slug) && i.latest);
  const funds = allNamedFunds.filter((f) => followedFunds.includes(f.id));

  const totalEndowmentTracked = institutions.reduce((sum, i) => sum + (i.latest?.endowment ?? 0), 0);
  const totalFundValue = funds.reduce((sum, f) => sum + f.marketValue, 0);

  const activity = [
    ...institutions.map((i) => ({
      key: `report-${i.slug}`,
      text: `${i.latest!.fy} report published for ${i.name}`,
      date: i.latest!.published,
    })),
    ...funds.map((f) => ({
      key: `fund-${f.id}`,
      text: `${f.name} is available to track`,
      date: `established ${f.established}`,
    })),
  ].slice(0, 6);

  const loading = institutionsLoading || fundsLoading;

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-sans font-normal tracking-tight text-text">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="mt-2 text-sm text-text-muted max-w-xl">
          Here&apos;s what&apos;s new across the institutions and named funds you&apos;re tracking.
        </p>

        {loading ? (
          <p className="mt-8 text-xs text-text-muted italic">Loading your portal…</p>
        ) : (
          <>
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
                    <IconBuilding className="h-4 w-4 text-text-faint" /> Institutions you&apos;re tracking
                  </h2>
                  <Link href="/portal/institutions" className="text-xs text-brand hover:underline">
                    Manage →
                  </Link>
                </div>
                {institutions.length === 0 ? (
                  <p className="text-xs text-text-faint italic">You&apos;re not tracking any institutions yet.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {institutions.map((institution) => (
                      <li key={institution.slug}>
                        <Link
                          href={`/portal/reports/${institution.slug}/${institution.latest!.year}`}
                          className="flex items-center justify-between rounded px-3 py-2.5 text-sm hover:bg-surface-raised transition-colors"
                        >
                          <span className="text-text">{institution.name}</span>
                          <span className="text-text-faint text-xs flex items-center gap-1">
                            {institution.latest!.fy} · ${institution.latest!.totalRevenue.toFixed(2)}B <IconArrowRight className="h-3 w-3" />
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
                    <IconWallet className="h-4 w-4 text-text-faint" /> Funds you&apos;re tracking
                  </h2>
                  <Link href="/portal/funds" className="text-xs text-brand hover:underline">
                    Manage →
                  </Link>
                </div>
                {funds.length === 0 ? (
                  <p className="text-xs text-text-faint italic">You&apos;re not tracking any named funds yet.</p>
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
          </>
        )}
      </div>

      <RecentChatsPanel />
    </div>
  );
}
