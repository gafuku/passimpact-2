"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePublishReport } from "@/app/hooks/usePublishReport";
import { IconFile } from "@/app/components/icons";

type InstitutionOption = { id: string; name: string; shortName: string; type: string; location: string };

function guessInstitutionId(name: string | undefined, institutions: InstitutionOption[]) {
  if (!name) return undefined;
  const norm = name.trim().toLowerCase();
  if (!norm) return undefined;
  const exact = institutions.find((i) => i.name.toLowerCase() === norm);
  if (exact) return exact.id;
  const partial = institutions.find((i) => i.name.toLowerCase().includes(norm) || norm.includes(i.name.toLowerCase()));
  return partial?.id;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-text-muted uppercase mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-[#d03b3b] mt-1">{error}</p>}
    </div>
  );
}

const inputClass = "w-full border border-border rounded p-2 text-sm text-text focus:outline-none focus:border-text";

export function ReviewForm({
  draftId,
  fileName,
  fileUrl,
  extracted,
  institutions,
}: {
  draftId: string;
  fileName: string | null;
  fileUrl: string | null;
  extracted: Record<string, any>;
  institutions: InstitutionOption[];
}) {
  const guessedInstitutionId = useMemo(() => guessInstitutionId(extracted.institutionName, institutions), [extracted.institutionName, institutions]);

  const defaultValues = useMemo(
    () => ({
      institutionMode: (guessedInstitutionId ? "existing" : "new") as "existing" | "new",
      institutionId: guessedInstitutionId ?? "",
      newInstitution: {
        name: extracted.institutionName ?? "",
        shortName: "",
        type: "",
        location: extracted.institutionLocation ?? "",
      },
      year: extracted.year ?? new Date().getFullYear(),
      fy: extracted.fy ?? "",
      fiscalYearEnd: extracted.fiscalYearEnd ?? "",
      published: extracted.published ?? "",
      auditOpinion: extracted.auditOpinion ?? "Unmodified",
      totalRevenue: extracted.totalRevenue ?? 0,
      totalExpenses: extracted.totalExpenses ?? 0,
      netPosition: extracted.netPosition ?? 0,
      privateGiftsOperating: extracted.privateGiftsOperating ?? 0,
      totalAssets: extracted.totalAssets ?? 0,
      totalLiabilities: extracted.totalLiabilities ?? 0,
      totalNetAssets: extracted.totalNetAssets ?? 0,
      totalDebt: extracted.totalDebt ?? 0,
      endowment: extracted.endowment ?? 0,
      lockboxEndowmentTotal: extracted.lockboxEndowmentTotal ?? extracted.endowment ?? 0,
      lockboxPermanentlyRestricted: extracted.lockboxPermanentlyRestricted ?? 0,
      lockboxBoardDesignated: extracted.lockboxBoardDesignated ?? 0,
      lockboxSpendingRate: extracted.lockboxSpendingRate ?? 0,
      lockboxAnnualPayout: extracted.lockboxAnnualPayout ?? 0,
      revenueBySource: Array.isArray(extracted.revenueBySource) ? extracted.revenueBySource : [],
      expenseByFunction: Array.isArray(extracted.expenseByFunction) ? extracted.expenseByFunction : [],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const {
    form: { register, watch, setValue, formState: { errors, isSubmitting } },
    revenueFields,
    appendRevenue,
    removeRevenue,
    expenseFields,
    appendExpense,
    removeExpense,
    onSubmit,
  } = usePublishReport(draftId, defaultValues);

  const institutionMode = watch("institutionMode");

  return (
   <main className="flex-1 flex flex-col bg-surface gap-4 items-start">
    <Link href="/admin/review" className="inline-flex items-center gap-1 mx-8 mt-8 text-xs text-text-muted bg-[#FFFFFF] px-4 py-3 rounded hover:text-text transition-colors">
       ← Back to uploaded reports
    </Link>
     <div className="w-full mx-auto p-8 flex gap-8">
      {/* Left Side: Original PDF */}
      <div className="w-1/2 bg-surface border border-border rounded-xl overflow-hidden flex flex-col">
        {fileUrl ? (
          <iframe src={fileUrl} title={fileName ?? "Uploaded report PDF"} className="h-full w-full" />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-8">
            <IconFile className="h-12 w-12 mb-4 text-border-strong" />
            <p>No file on record for this draft</p>
          </div>
        )}
      </div>

      {/* Right Side: Editable Form */}
      <div className="w-1/2 flex flex-col h-[85vh] bg-white rounded-xl border border-border overflow-hidden shadow-sm">
        <form onSubmit={onSubmit} className="flex flex-col h-full">
          <div className="p-6 border-b border-border bg-surface-raised flex justify-between items-center shrink-0">
            <div>
              <h2 className="text-lg font-bold text-text">Review Extracted Data</h2>
              <p className="text-xs text-text-muted">
                {fileName ? `${fileName} · ` : ""}Verify Gemini&apos;s output before publishing.
              </p>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-text text-text-invert border border-white/10 px-4 py-2 text-xs font-medium hover:brightness-125 disabled:opacity-50 transition-all shrink-0"
            >
              {isSubmitting ? "Publishing…" : "Publish Report"}
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Institution */}
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-3">Institution</label>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setValue("institutionMode", "existing", { shouldValidate: true })}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    institutionMode === "existing" ? "border-text bg-text text-text-invert" : "border-border text-text-muted hover:bg-surface-raised"
                  }`}
                >
                  Match existing
                </button>
                <button
                  type="button"
                  onClick={() => setValue("institutionMode", "new", { shouldValidate: true })}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    institutionMode === "new" ? "border-text bg-text text-text-invert" : "border-border text-text-muted hover:bg-surface-raised"
                  }`}
                >
                  Create new
                </button>
              </div>

              {institutionMode === "existing" ? (
                <Field label="Existing institution" error={errors.institutionId?.message}>
                  <select {...register("institutionId")} className={inputClass}>
                    <option value="">Select an institution…</option>
                    {institutions.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Field label="Full name" error={errors.newInstitution?.name?.message}>
                      <input {...register("newInstitution.name")} placeholder="University of Michigan" className={inputClass} />
                    </Field>
                  </div>
                  <Field label="Short name" error={errors.newInstitution?.shortName?.message}>
                    <input {...register("newInstitution.shortName")} placeholder="Michigan" className={inputClass} />
                  </Field>
                  <Field label="Type" error={errors.newInstitution?.type?.message}>
                    <input {...register("newInstitution.type")} placeholder="Public Research University" className={inputClass} />
                  </Field>
                  <div className="col-span-2">
                    <Field label="Location" error={errors.newInstitution?.location?.message}>
                      <input {...register("newInstitution.location")} placeholder="Ann Arbor, MI" className={inputClass} />
                    </Field>
                  </div>
                </div>
              )}
            </div>

            {/* Report identity */}
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-6">
              <Field label="Fiscal Year" error={errors.year?.message}>
                <input type="number" {...register("year")} className={inputClass} />
              </Field>
              <Field label="Fiscal Year Label" error={errors.fy?.message}>
                <input type="text" {...register("fy")} placeholder="FY2025" className={inputClass} />
              </Field>
              <Field label="Fiscal Year End" error={errors.fiscalYearEnd?.message}>
                <input type="text" {...register("fiscalYearEnd")} placeholder="June 30, 2025" className={inputClass} />
              </Field>
              <Field label="Published" error={errors.published?.message}>
                <input type="text" {...register("published")} placeholder="October 2025" className={inputClass} />
              </Field>
              <Field label="Audit Opinion" error={errors.auditOpinion?.message}>
                <input type="text" {...register("auditOpinion")} className={inputClass} />
              </Field>
            </div>

            {/* Headline figures */}
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-6">
              <Field label="Total Revenue ($B)" error={errors.totalRevenue?.message}>
                <input type="number" step="any" {...register("totalRevenue")} className={inputClass} />
              </Field>
              <Field label="Total Expenses ($B)" error={errors.totalExpenses?.message}>
                <input type="number" step="any" {...register("totalExpenses")} className={inputClass} />
              </Field>
              <Field label="Net Position ($B)" error={errors.netPosition?.message}>
                <input type="number" step="any" {...register("netPosition")} className={inputClass} />
              </Field>
              <Field label="Private Gifts, Operating ($B)" error={errors.privateGiftsOperating?.message}>
                <input type="number" step="any" {...register("privateGiftsOperating")} className={inputClass} />
              </Field>
            </div>

            {/* Balance sheet */}
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-6">
              <Field label="Total Assets ($B)" error={errors.totalAssets?.message}>
                <input type="number" step="any" {...register("totalAssets")} className={inputClass} />
              </Field>
              <Field label="Total Liabilities ($B)" error={errors.totalLiabilities?.message}>
                <input type="number" step="any" {...register("totalLiabilities")} className={inputClass} />
              </Field>
              <Field label="Total Net Assets ($B)" error={errors.totalNetAssets?.message}>
                <input type="number" step="any" {...register("totalNetAssets")} className={inputClass} />
              </Field>
              <Field label="Total Debt ($B)" error={errors.totalDebt?.message}>
                <input type="number" step="any" {...register("totalDebt")} className={inputClass} />
              </Field>
            </div>

            {/* Endowment / lockbox */}
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-6">
              <Field label="Endowment ($B)" error={errors.endowment?.message}>
                <input type="number" step="any" {...register("endowment")} className={inputClass} />
              </Field>
              <Field label="Lockbox Total ($B)" error={errors.lockboxEndowmentTotal?.message}>
                <input type="number" step="any" {...register("lockboxEndowmentTotal")} className={inputClass} />
              </Field>
              <Field label="Permanently Restricted (0–1)" error={errors.lockboxPermanentlyRestricted?.message}>
                <input type="number" step="any" {...register("lockboxPermanentlyRestricted")} className={inputClass} />
              </Field>
              <Field label="Board Designated (0–1)" error={errors.lockboxBoardDesignated?.message}>
                <input type="number" step="any" {...register("lockboxBoardDesignated")} className={inputClass} />
              </Field>
              <Field label="Spending Rate (0–1)" error={errors.lockboxSpendingRate?.message}>
                <input type="number" step="any" {...register("lockboxSpendingRate")} className={inputClass} />
              </Field>
              <Field label="Annual Payout ($B)" error={errors.lockboxAnnualPayout?.message}>
                <input type="number" step="any" {...register("lockboxAnnualPayout")} className={inputClass} />
              </Field>
            </div>

            {/* Revenue by source */}
            <div className="border-t border-border pt-6">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-xs font-semibold text-text-muted uppercase">Revenue By Source</label>
                <button type="button" onClick={() => appendRevenue({ label: "", value: 0 })} className="text-xs text-brand hover:underline">
                  + Add
                </button>
              </div>
              {revenueFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 mb-2 items-start">
                  <div className="flex-1">
                    <input type="text" {...register(`revenueBySource.${index}.label` as const)} placeholder="Label" className={inputClass} />
                    {errors?.revenueBySource?.[index]?.label && (
                      <p className="text-[#d03b3b] text-[10px] mt-1">{errors.revenueBySource[index]?.label?.message}</p>
                    )}
                  </div>
                  <div>
                    <input type="number" step="any" {...register(`revenueBySource.${index}.value` as const)} className={`w-24 ${inputClass}`} />
                    {errors?.revenueBySource?.[index]?.value && (
                      <p className="text-[#d03b3b] text-[10px] mt-1">{errors.revenueBySource[index]?.value?.message}</p>
                    )}
                  </div>
                  <button type="button" onClick={() => removeRevenue(index)} className="text-[#d03b3b] p-2 hover:bg-red-50 rounded">
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Expense by function */}
            <div className="border-t border-border pt-6 pb-6">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-xs font-semibold text-text-muted uppercase">Expense By Function</label>
                <button type="button" onClick={() => appendExpense({ label: "", value: 0 })} className="text-xs text-brand hover:underline">
                  + Add
                </button>
              </div>
              {expenseFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 mb-2 items-start">
                  <div className="flex-1">
                    <input type="text" {...register(`expenseByFunction.${index}.label` as const)} placeholder="Label" className={inputClass} />
                    {errors?.expenseByFunction?.[index]?.label && (
                      <p className="text-[#d03b3b] text-[10px] mt-1">{errors.expenseByFunction[index]?.label?.message}</p>
                    )}
                  </div>
                  <div>
                    <input type="number" step="any" {...register(`expenseByFunction.${index}.value` as const)} className={`w-24 ${inputClass}`} />
                    {errors?.expenseByFunction?.[index]?.value && (
                      <p className="text-[#d03b3b] text-[10px] mt-1">{errors.expenseByFunction[index]?.value?.message}</p>
                    )}
                  </div>
                  <button type="button" onClick={() => removeExpense(index)} className="text-[#d03b3b] p-2 hover:bg-red-50 rounded">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
   </main>
  );
}
