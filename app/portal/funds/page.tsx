"use client";

import Link from "next/link";
import { useAuth } from "../../components/portal/AuthContext";
import { namedFunds, getInstitution } from "../../components/report/reportData";

export default function PortalFundsPage() {
  const { followedFunds, toggleFollowFund } = useAuth();

  const tracked = namedFunds.filter((f) => followedFunds.includes(f.id));
  const others = namedFunds.filter((f) => !followedFunds.includes(f.id));

  return (
    <div>
      <h1 className="text-2xl font-sans font-normal tracking-tight text-text">My Funds</h1>
      <p className="mt-2 text-sm text-text-muted max-w-xl">
        Track a named fund to see its market value, purpose, and payout here. This is what "not disclosed in this
        report" looks like once it is disclosed — full detail for the funds you're following.
      </p>

      {tracked.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-faint mb-3">Tracking ({tracked.length})</h2>
          <div className="flex flex-col gap-4">
            {tracked.map((fund) => {
              const institution = getInstitution(fund.institutionSlug)!;
              const payout = fund.marketValue * fund.spendingRate;
              return (
                <div key={fund.id} className="border border-border bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-text">{fund.name}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {institution.name} · {fund.restrictionType} · established {fund.established}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleFollowFund(fund.id)}
                      className="shrink-0 text-xs rounded-full border border-border px-3 py-1 text-text-muted hover:bg-surface-raised hover:text-text transition-colors"
                    >
                      Untrack
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-text-muted">{fund.purpose}</p>
                  <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-text-faint">Market value</p>
                      <p className="mt-1 text-sm font-semibold text-text tabular-nums">${fund.marketValue}M</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-text-faint">Annual payout</p>
                      <p className="mt-1 text-sm font-semibold text-text tabular-nums">${payout.toFixed(2)}M</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-text-faint">Spending rate</p>
                      <p className="mt-1 text-sm font-semibold text-text tabular-nums">{(fund.spendingRate * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                  <Link href={`/portal/reports/${institution.slug}`} className="mt-4 inline-block text-xs text-brand hover:underline">
                    View {institution.shortName}'s reports →
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-faint mb-3">All named funds on file</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {others.map((fund) => {
            const institution = getInstitution(fund.institutionSlug)!;
            return (
              <div key={fund.id} className="border border-border bg-white p-5 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text">{fund.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">{institution.name} · {fund.restrictionType}</p>
                </div>
                <button
                  onClick={() => toggleFollowFund(fund.id)}
                  className="shrink-0 text-xs rounded-full bg-text text-text-invert border border-white/10 px-3 py-1 hover:brightness-125 transition-all"
                >
                  Track
                </button>
              </div>
            );
          })}
          {others.length === 0 && (
            <p className="col-span-full text-xs text-text-faint italic py-4">You're tracking every named fund we have on file.</p>
          )}
        </div>
      </div>
    </div>
  );
}
