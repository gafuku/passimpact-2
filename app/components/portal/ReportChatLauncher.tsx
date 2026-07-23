"use client";

import { useState } from "react";
import type { Institution, Report } from "../report/reportData";
import { LargeReportChat } from "./LargeReportChat";

export function ReportChatLauncher({ institution, report, previousReport }: { institution: Institution; report: Report; previousReport?: Report }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded bg-text text-text-invert border border-white/10 px-5 py-2 text-xs font-medium hover:brightness-125 transition-all"
      >
        Ask about {institution.shortName}
      </button>
      <LargeReportChat institution={institution} report={report} previousReport={previousReport} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
