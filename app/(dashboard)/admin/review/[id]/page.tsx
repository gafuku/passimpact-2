import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/prisma";
import { ReviewForm } from "./ReviewForm";
import { IconFile } from "@/app/components/icons";

function parseExtracted(json: string | null) {
  if (!json) return {};
  try {
    return JSON.parse(json) as Record<string, any>;
  } catch {
    return {};
  }
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-text-faint">{label}</p>
      <p className="mt-1 text-sm font-medium text-text tabular-nums">{value}</p>
    </div>
  );
}

export default async function AdminReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const draft = await prisma.draftReport.findUnique({ where: { id } });
  if (!draft) notFound();

  const extracted = parseExtracted(draft.extractedData);
  const fileUrl = draft.fileUrl ? `/api/reports/drafts/${draft.id}/file` : null;

  if (draft.status === "PUBLISHED") {
    return (
      <div className="w-full mx-auto p-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link href="/admin/review" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text transition-colors">
            ← Back to uploaded reports
          </Link>
          <span className="inline-flex items-center rounded-full border border-[#0ca30c]/30 bg-[#0ca30c]/10 px-3 py-1 text-[10px] font-mono font-medium tracking-wide text-[#006300]">
            Published
          </span>
        </div>

        <div className="flex gap-8">
          <div className="w-1/2 bg-surface border border-border rounded-xl overflow-hidden flex flex-col h-[80vh]">
            {fileUrl ? (
              <iframe src={fileUrl} title={draft.fileName ?? "Uploaded report PDF"} className="h-full w-full" />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-8">
                <IconFile className="h-12 w-12 mb-4 text-border-strong" />
                <p>No file on record for this draft</p>
              </div>
            )}
          </div>

          <div className="w-1/2 bg-white rounded-xl border border-border p-6 h-fit">
            <h2 className="text-lg font-bold text-text">{typeof extracted.institutionName === "string" ? extracted.institutionName : "Unknown institution"}</h2>
            <p className="mt-1 text-xs text-text-muted">
              {draft.fileName ?? "Uploaded report"} · This report has already been published — the figures below are what
              Gemini originally extracted and may not reflect edits made during review.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6">
              <SummaryField label="Fiscal Year" value={typeof extracted.fy === "string" ? extracted.fy : "—"} />
              <SummaryField label="Audit Opinion" value={typeof extracted.auditOpinion === "string" ? extracted.auditOpinion : "—"} />
              <SummaryField label="Total Revenue" value={typeof extracted.totalRevenue === "number" ? `$${extracted.totalRevenue.toFixed(2)}B` : "—"} />
              <SummaryField label="Total Expenses" value={typeof extracted.totalExpenses === "number" ? `$${extracted.totalExpenses.toFixed(2)}B` : "—"} />
              <SummaryField label="Endowment" value={typeof extracted.endowment === "number" ? `$${extracted.endowment.toFixed(2)}B` : "—"} />
              <SummaryField label="Total Assets" value={typeof extracted.totalAssets === "number" ? `$${extracted.totalAssets.toFixed(2)}B` : "—"} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const institutions = await prisma.institution.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, shortName: true, type: true, location: true },
  });

  return <ReviewForm draftId={draft.id} fileName={draft.fileName} fileUrl={fileUrl} extracted={extracted} institutions={institutions} />;
}
