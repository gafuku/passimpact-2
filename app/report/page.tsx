"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { usePublicInstitutions } from "../hooks/usePublicInstitutions";
import { InstitutionCardSkeletonGrid } from "../components/Skeleton";

export default function UniversitiesBrowsePage() {
  const { institutions, loading, error } = usePublicInstitutions();
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [query, setQuery] = useState("");

  const institutionTypes = useMemo(() => Array.from(new Set(institutions.map((i) => i.type))), [institutions]);

  const filtered = institutions.filter((institution) => {
    const matchesType = typeFilter === "All" || institution.type === typeFilter;
    const matchesQuery = query.trim() === "" || institution.name.toLowerCase().includes(query.trim().toLowerCase());
    return matchesType && matchesQuery;
  });

  return (
    <div className="flex min-h-screen flex-col font-sans bg-background text-foreground">
      <Navbar />
      <main id="main-content" className="flex flex-1 flex-col">
        <section className="bg-surface py-16 md:py-20 border-b border-border">
          <div className="mx-auto max-w-6xl px-inset">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-faint">Institutions</span>
            <h1 className="mt-3 text-lg md:text-lg font-sans font-normal tracking-tight text-text max-w-xl">
              Pick a university to start exploring
            </h1>
            <p className="mt-4 text-text-muted text-lg max-w-2xl">
              Every institution below has multiple years of audited reports on file — open one to see the full history,
              latest first, each with its own dedicated AI assistant.
            </p>

            {/* Filters */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex flex-wrap gap-2">
                {["All", ...institutionTypes].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      typeFilter === t ? "border-text bg-text text-text-invert" : "border-border text-text-muted hover:bg-surface-raised"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by institution…"
                className="sm:ml-auto w-full sm:w-64 rounded border border-border bg-white px-3 py-2 text-xs text-text placeholder:text-text-faint focus:outline-none focus:border-text"
              />
            </div>
          </div>
        </section>

        <section className="bg-surface py-12 flex-1">
          <div className="mx-auto max-w-6xl px-inset">
            {loading ? (
              <InstitutionCardSkeletonGrid />
            ) : error ? (
              <p className="text-xs text-[#d03b3b]">Couldn&apos;t load institutions: {error}</p>
            ) : filtered.length === 0 ? (
              <p className="text-xs text-text-muted italic">
                {institutions.length === 0 ? "No institutions have been published yet." : "No institutions match that search."}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-border">
                {filtered.map((institution) => (
                  <Link
                    key={institution.slug}
                    href={`/report/${institution.slug}`}
                    className="group border-r border-b border-border bg-white p-8 transition-colors hover:bg-surface-raised flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-text text-text-invert text-xs font-semibold shrink-0">
                        {institution.shortName.slice(0, 1)}
                      </div>
                      <div>
                        <h2 className="text-base font-sans text-text leading-tight">{institution.name}</h2>
                        <p className="text-xs text-text-muted">{institution.location}</p>
                      </div>
                    </div>

                    <p className="text-xs text-text-muted mb-6">{institution.type}</p>

                    {institution.latest && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-text-faint">Latest revenue</p>
                            <p className="mt-1 text-xs font-semibold text-text tabular-nums">${institution.latest.totalRevenue.toFixed(2)}B</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-text-faint">Endowment</p>
                            <p className="mt-1 text-xs font-semibold text-text tabular-nums">${institution.latest.endowment.toFixed(1)}B</p>
                          </div>
                        </div>

                        <div className="mt-auto pt-6 flex items-center justify-between text-xs">
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#0ca30c]/30 bg-[#0ca30c]/10 px-2.5 py-0.5 text-[10px] font-mono font-medium text-[#006300]">
                            ✓ {institution.latest.fy} on file
                          </span>
                          <span className="text-text font-medium group-hover:translate-x-1 transition-transform">View reports →</span>
                        </div>
                      </>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
