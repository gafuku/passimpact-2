import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReportOverview } from "../../../../components/report/ReportOverview";
import { YearLens } from "../../../../components/report/YearLens";
import { Explorer } from "../../../../components/report/Explorer";
import { Lockbox } from "../../../../components/report/Lockbox";
import { ReportChatLauncher } from "../../../../components/portal/ReportChatLauncher";
import { institutions, getInstitution, getReportsForInstitution, getReport } from "../../../../components/report/reportData";

export async function generateStaticParams() {
  return institutions.flatMap((i) => getReportsForInstitution(i.slug).map((r) => ({ institution: i.slug, year: String(r.year) })));
}

export async function generateMetadata({ params }: { params: Promise<{ institution: string; year: string }> }): Promise<Metadata> {
  const { institution: slug, year } = await params;
  const institution = getInstitution(slug);
  const report = institution ? getReport(slug, Number(year)) : undefined;
  if (!institution || !report) return { title: "Report not found | Pass Impact" };
  return { title: `${institution.name} ${report.fy} Report | Pass Impact Portal` };
}

export default async function PortalReportDetailPage({ params }: { params: Promise<{ institution: string; year: string }> }) {
  const { institution: slug, year } = await params;
  const institution = getInstitution(slug);
  if (!institution) notFound();

  const reports = getReportsForInstitution(slug);
  const report = getReport(slug, Number(year));
  if (!report) notFound();

  const chronological = [...reports].sort((a, b) => a.year - b.year);
  const idx = chronological.findIndex((r) => r.year === report.year);
  const previousReport = idx > 0 ? chronological[idx - 1] : undefined;

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/portal/institutions" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text transition-colors">
            ← My Institutions
          </Link>
          <span className="text-text-faint text-xs">/</span>
          <Link href={`/portal/reports/${slug}`} className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text transition-colors">
            {institution.name} reports
          </Link>
        </div>
        <ReportChatLauncher institution={institution} report={report} previousReport={previousReport} />
      </div>

      {reports.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {reports.map((r) => (
            <Link
              key={r.year}
              href={`/portal/reports/${slug}/${r.year}`}
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
  );
}
