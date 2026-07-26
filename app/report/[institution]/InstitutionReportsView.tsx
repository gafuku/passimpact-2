"use client";

import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { useInstitutionReports } from "../../hooks/useInstitutionReports";
import { FollowInstitutionButton } from "../../components/portal/FollowInstitutionButton";

export function InstitutionReportsView({ slug }: { slug: string }) {
  const { institution, reports, loading, error } = useInstitutionReports(slug);

  return (
    <div className="flex min-h-screen flex-col font-sans bg-background text-foreground">
      <Navbar />
      <main id="main-content" className="flex flex-1 flex-col">
        <section className="bg-surface py-16 md:py-20 flex-1">
          <div className="mx-auto max-w-3xl px-inset">
            <Link href="/report" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text transition-colors mb-8">
              ← All institutions
            </Link>

            {loading ? (
              <p className="text-xs text-text-muted italic">Loading…</p>
            ) : error || !institution ? (
              <p className="text-xs text-[#d03b3b]">{error ? `Couldn't load this institution: ${error}` : "Institution not found."}</p>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-text text-text-invert text-lg font-semibold shrink-0">
                      {institution.shortName.slice(0, 1)}
                    </div>
                    <div>
                      <h1 className="text-lg md:text-lg font-sans font-normal tracking-tight text-text">{institution.name}</h1>
                      <p className="text-xs text-text-muted">
                        {institution.type} · {institution.location}
                      </p>
                    </div>
                  </div>
                  <FollowInstitutionButton slug={institution.slug} />
                </div>
                <p className="mt-4 text-text-muted max-w-xl">
                  {reports.length} audited {reports.length === 1 ? "report" : "reports"} on file for {institution.shortName}, most
                  recent first. Open one to explore the full breakdown and chat with the assistant built for that report.
                </p>

                <div className="mt-10 flex flex-col gap-4">
                  {reports.map((report, i) => (
                    <Link
                      key={report.year}
                      href={`/report/${institution.slug}/${report.year}`}
                      className="group flex flex-col sm:flex-row sm:items-center gap-4 border border-border bg-white p-6 transition-all hover:border-border-strong hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-4 sm:w-40 shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-raised border border-border text-xs font-semibold text-text shrink-0">
                          {report.year}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-text">{report.fy}</p>
                          {i === 0 && (
                            <span className="inline-flex mt-1 items-center rounded-full bg-brand/10 border border-brand/20 px-2 py-0.5 text-[10px] font-medium text-brand">
                              Most recent
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-text-faint">Revenue</p>
                          <p className="mt-1 text-xs font-semibold text-text tabular-nums">${report.totalRevenue.toFixed(2)}B</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-text-faint">Endowment</p>
                          <p className="mt-1 text-xs font-semibold text-text tabular-nums">${report.endowment.toFixed(1)}B</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-text-faint">Opinion</p>
                          <p className="mt-1 text-xs font-medium text-[#006300]">✓ {report.auditOpinion}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-text-faint">Published</p>
                          <p className="mt-1 text-xs text-text-muted">{report.published}</p>
                        </div>
                      </div>

                      <span className="text-text text-xs font-medium flex items-center gap-1 sm:ml-4 shrink-0 group-hover:translate-x-1 transition-transform">
                        Explore →
                      </span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
