"use client";

import Link from "next/link";
import { Navbar } from "../../../components/Navbar";
import { Footer } from "../../../components/Footer";
import { ReportOverview } from "../../../components/report/ReportOverview";
import { YearLens } from "../../../components/report/YearLens";
import { Explorer } from "../../../components/report/Explorer";
import { Lockbox } from "../../../components/report/Lockbox";
import { ReportChat } from "../../../components/report/ReportChat";
import { useInstitutionReports } from "../../../hooks/useInstitutionReports";

export function ReportDetailView({ slug, year }: { slug: string; year: number }) {
  const { institution, reports, loading, error } = useInstitutionReports(slug);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col font-sans bg-background text-foreground">
        <Navbar />
        <main id="main-content" className="flex flex-1 items-center justify-center">
          <p className="text-xs text-text-muted italic">Loading report…</p>
        </main>
        <Footer />
      </div>
    );
  }

  const report = reports.find((r) => r.year === year);

  if (error || !institution || !report) {
    return (
      <div className="flex min-h-screen flex-col font-sans bg-background text-foreground">
        <Navbar />
        <main id="main-content" className="flex flex-1 items-center justify-center">
          <p className="text-xs text-[#d03b3b]">{error ? `Couldn't load this report: ${error}` : "Report not found."}</p>
        </main>
        <Footer />
      </div>
    );
  }

  const chronological = [...reports].sort((a, b) => a.year - b.year);
  const idx = chronological.findIndex((r) => r.year === report.year);
  const previousReport = idx > 0 ? chronological[idx - 1] : undefined;

  return (
    <div className="flex min-h-screen flex-col font-sans bg-background text-foreground">
      <Navbar />
      <main id="main-content" className="flex flex-1 flex-col">
        <section className="bg-surface py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-inset">
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <Link href="/report" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text transition-colors">
                ← All institutions
              </Link>
              <span className="text-text-faint text-xs">/</span>
              <Link href={`/report/${slug}`} className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text transition-colors">
                {institution.name} reports
              </Link>
            </div>

            {reports.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {reports.map((r) => (
                  <Link
                    key={r.year}
                    href={`/report/${slug}/${r.year}`}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      r.year === report.year ? "border-text bg-text text-text-invert" : "border-border text-text-muted hover:bg-surface-raised"
                    }`}
                  >
                    {r.fy}
                  </Link>
                ))}
              </div>
            )}

            <ReportOverview institution={institution} report={report} previousReport={previousReport} />
            <YearLens reports={reports} />
            <Explorer reports={reports} />
            <Lockbox report={report} />
          </div>
        </section>
      </main>
      <Footer />
      <ReportChat institution={institution} report={report} previousReport={previousReport} />
    </div>
  );
}
