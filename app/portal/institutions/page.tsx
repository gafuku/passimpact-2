"use client";

import Link from "next/link";
import { useAuth } from "../../components/portal/AuthContext";
import { usePublicInstitutions } from "../../hooks/usePublicInstitutions";

export default function PortalInstitutionsPage() {
  const { followedInstitutions, toggleFollowInstitution } = useAuth();
  const { institutions, loading, error } = usePublicInstitutions();

  const tracked = institutions.filter((i) => followedInstitutions.includes(i.slug));
  const others = institutions.filter((i) => !followedInstitutions.includes(i.slug));

  return (
    <div>
      <h1 className="text-2xl font-sans font-normal tracking-tight text-text">My Institutions</h1>
      <p className="mt-2 text-sm text-text-muted max-w-xl">
        Track a university to see it on your overview and get its reports surfaced first. This reflects your interest,
        not verified giving history.
      </p>

      {loading ? (
        <p className="mt-8 text-xs text-text-muted italic">Loading institutions…</p>
      ) : error ? (
        <p className="mt-8 text-xs text-[#d03b3b]">Couldn&apos;t load institutions: {error}</p>
      ) : (
        <>
          {tracked.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-faint mb-3">Tracking ({tracked.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tracked.map((institution) => (
                  <div key={institution.slug} className="border border-border bg-white p-5 flex flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-text">{institution.name}</p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {institution.type} · {institution.location}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleFollowInstitution(institution.slug)}
                        className="shrink-0 text-xs rounded-full border border-border px-3 py-1 text-text-muted hover:bg-surface-raised hover:text-text transition-colors"
                      >
                        Untrack
                      </button>
                    </div>
                    {institution.latest && (
                      <div className="mt-4 flex items-center gap-4 text-xs text-text-muted">
                        <span>
                          {institution.latest.fy} revenue: <span className="text-text font-medium">${institution.latest.totalRevenue.toFixed(2)}B</span>
                        </span>
                        <span>
                          Endowment: <span className="text-text font-medium">${institution.latest.endowment.toFixed(1)}B</span>
                        </span>
                      </div>
                    )}
                    <Link href={`/portal/reports/${institution.slug}`} className="mt-4 text-xs text-brand hover:underline">
                      View all reports →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-faint mb-3">All institutions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {others.map((institution) => (
                <div key={institution.slug} className="border border-border bg-white p-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-text">{institution.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {institution.type} · {institution.location}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFollowInstitution(institution.slug)}
                    className="shrink-0 text-xs rounded-full bg-text text-text-invert border border-white/10 px-3 py-1 hover:brightness-125 transition-all"
                  >
                    Track
                  </button>
                </div>
              ))}
              {others.length === 0 && (
                <p className="col-span-full text-xs text-text-faint italic py-4">You're tracking every institution we have on file.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
