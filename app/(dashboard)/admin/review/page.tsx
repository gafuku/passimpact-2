import Link from "next/link";
import { prisma } from "@/prisma";
import { IconArrowRight, IconFile } from "@/app/components/icons";

const STEPS = ["Upload", "Extract", "Review & publish"];

function parseExtracted(json: string | null) {
  if (!json) return {};
  try {
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function StatusBadge({ status }: { status: string }) {
  if (status === "PUBLISHED") {
    return (
      <span className="inline-flex items-center rounded-full border border-[#0ca30c]/30 bg-[#0ca30c]/10 px-2.5 py-0.5 text-[10px] font-mono font-medium tracking-wide text-[#006300]">
        Published
      </span>
    );
  }
  if (status === "FAILED") {
    return (
      <span className="inline-flex items-center rounded-full border border-[#d03b3b]/30 bg-[#d03b3b]/10 px-2.5 py-0.5 text-[10px] font-mono font-medium tracking-wide text-[#d03b3b]">
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-[10px] font-mono tracking-wide text-text-muted">
      Pending review
    </span>
  );
}

export default async function AdminReviewListPage() {
  const drafts = await prisma.draftReport.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl w-full mx-auto p-8 md:p-10">
      <div className="border-b border-border pb-8 mb-10">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-[10px] font-mono tracking-wide text-text-muted">
            Admin · Data pipeline
          </span>
        </div>
        <h1 className="text-lg font-sans font-normal tracking-tight text-text">Uploaded reports</h1>
        <p className="mt-2 text-xs text-text-muted max-w-xl">
          Every report that&apos;s been through Gemini extraction, whether it&apos;s still waiting on review or already
          published to donors.
        </p>
      </div>

      <div className="flex items-center mb-10">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2 shrink-0">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold ${
                  i <= 1 ? "border-text bg-text text-text-invert" : "border-border text-text-faint"
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-xs whitespace-nowrap ${i <= 1 ? "text-text font-medium" : "text-text-faint"}`}>{step}</span>
            </div>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border mx-4" />}
          </div>
        ))}
      </div>

      {drafts.length === 0 ? (
        <div className="border border-border bg-white p-10 flex flex-col items-center text-center gap-3">
          <IconFile className="h-8 w-8 text-border-strong" />
          <p className="text-sm font-medium text-text">No reports uploaded yet</p>
          <p className="text-xs text-text-muted max-w-xs">
            Upload a financial report and it&apos;ll show up here once Gemini has extracted it.
          </p>
          <Link
            href="/admin/extract"
            className="mt-2 inline-flex items-center gap-1.5 rounded bg-text text-text-invert border border-white/10 px-4 py-2 text-xs font-medium hover:brightness-125 transition-all"
          >
            Upload a report <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {drafts.map((draft) => {
            const data = parseExtracted(draft.extractedData);
            const institutionName = typeof data.institutionName === "string" ? data.institutionName : "Unknown institution";
            const fy = typeof data.fy === "string" ? data.fy : null;
            const totalRevenue = typeof data.totalRevenue === "number" ? data.totalRevenue : null;

            return (
              <li key={draft.id} className="border border-border bg-white p-5 transition-all hover:border-border-strong">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-brand/10 text-brand">
                    <IconFile className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-text truncate">{institutionName}</p>
                      <StatusBadge status={draft.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-text-faint truncate">
                      {draft.fileName ?? "Uploaded report"} · {formatDate(draft.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 sm:w-40 shrink-0 text-xs">
                    {fy && <span className="text-text-muted">{fy}</span>}
                    {totalRevenue !== null && <span className="font-medium text-text tabular-nums">${totalRevenue.toFixed(2)}B</span>}
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {draft.fileUrl && (
                      <a
                        href={`/api/reports/drafts/${draft.id}/file`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-text-muted hover:text-text transition-colors underline underline-offset-2"
                      >
                        View PDF
                      </a>
                    )}
                    <Link
                      href={`/admin/review/${draft.id}`}
                      className="group text-text text-xs font-medium flex items-center gap-1"
                    >
                      {draft.status === "PUBLISHED" ? "View" : "Review"}{" "}
                      <IconArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
