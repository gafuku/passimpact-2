"use client";

import { useState } from "react";
import { useExtractReport } from "@/app/hooks/useExtractReport";
import { IconArrowRight, IconDatabase, IconFile, IconShield, IconSparkles, IconUploadCloud, IconX } from "@/app/components/icons";

const STEPS = ["Upload", "Extract", "Review & publish"];

const EXTRACTED_FIELDS = [
  { icon: IconDatabase, label: "Balance sheet", detail: "Assets, liabilities, net position, debt" },
  { icon: IconSparkles, label: "Revenue & expenses", detail: "By source and by function, year over year" },
  { icon: IconShield, label: "Endowment & lockbox", detail: "Spending rate, restricted vs. board-designated" },
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminExtractPage() {
  const { form, loading, onSubmit } = useExtractReport();
  const { register, setValue, watch, formState: { errors, isValid } } = form;
  const [isDragging, setIsDragging] = useState(false);

  const fileList: FileList | undefined = watch("file");
  const file = fileList?.[0];

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      setValue("file", e.dataTransfer.files, { shouldValidate: true, shouldDirty: true });
    }
  }

  function clearFile(e: React.MouseEvent) {
    e.preventDefault();
    setValue("file", undefined, { shouldValidate: true });
  }

  return (
    <div className="max-w-3xl w-full mx-auto p-8 md:p-10">
      <div className="border-b border-border pb-8 mb-10">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-[10px] font-mono tracking-wide text-text-muted">
            Admin · Data pipeline
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[10px] font-mono font-medium tracking-wide text-brand">
            <IconSparkles className="h-3 w-3" /> Gemini 3 Flash
          </span>
        </div>
        <h1 className="text-lg font-sans font-normal tracking-tight text-text">Upload a financial report</h1>
        <p className="mt-2 text-xs text-text-muted max-w-xl">
          Drop in a university&apos;s audited financial PDF. Gemini reads the statement of activities and the balance
          sheet and extracts the core figures for you to verify before anything reaches a donor.
        </p>
      </div>

      {/* Pipeline stepper */}
      <div className="flex items-center mb-10">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2 shrink-0">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold ${
                  i === 0 ? "border-text bg-text text-text-invert" : "border-border text-text-faint"
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-xs whitespace-nowrap ${i === 0 ? "text-text font-medium" : "text-text-faint"}`}>{step}</span>
            </div>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border mx-4" />}
          </div>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_260px]">
        <form onSubmit={onSubmit} className="space-y-4">
          <label
            htmlFor="report-file"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${
              isDragging ? "border-brand bg-brand/5" : "border-border bg-surface hover:bg-surface-raised"
            }`}
          >
            <input id="report-file" type="file" accept=".pdf" {...register("file")} className="sr-only" />
            {!file ? (
              <>
                <IconUploadCloud className="h-8 w-8 text-text-faint" />
                <div>
                  <p className="text-sm font-medium text-text">Drop a PDF here, or click to browse</p>
                  <p className="mt-1 text-xs text-text-faint">Audited financial statement · up to 20MB</p>
                </div>
              </>
            ) : (
              <div className="flex w-full items-center gap-3 rounded-lg border border-border bg-white p-4 text-left">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-brand/10 text-brand">
                  <IconFile className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-text">{file.name}</p>
                  <p className="text-xs text-text-faint">{formatBytes(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  aria-label="Remove file"
                  className="shrink-0 text-text-faint hover:text-text transition-colors"
                >
                  <IconX className="h-4 w-4" />
                </button>
              </div>
            )}
          </label>
          {errors.file && <p className="text-xs text-[#d03b3b]">{errors.file.message as string}</p>}

          <button
            type="submit"
            disabled={!isValid || loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded bg-text text-text-invert border border-white/10 px-5 py-3 text-xs font-medium hover:brightness-125 disabled:opacity-50 disabled:hover:brightness-100 transition-all"
          >
            {loading ? (
              <>
                <span className="h-3 w-3 rounded-full border-2 border-text-invert/30 border-t-text-invert animate-spin" />
                Extracting with Gemini…
              </>
            ) : (
              <>
                Extract data <IconArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="border border-border bg-white p-5 h-fit">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-faint mb-4">What gets extracted</h2>
          <ul className="flex flex-col gap-4">
            {EXTRACTED_FIELDS.map((f) => (
              <li key={f.label} className="flex gap-3">
                <f.icon className="h-4 w-4 shrink-0 text-text-faint mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-text">{f.label}</p>
                  <p className="text-xs text-text-muted mt-0.5">{f.detail}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-5 pt-4 border-t border-border text-xs text-text-faint">
            Nothing is published until you verify it on the next screen.
          </p>
        </div>
      </div>
    </div>
  );
}
