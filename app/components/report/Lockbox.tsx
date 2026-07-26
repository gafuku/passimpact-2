import type { Report } from "./reportData";

const FILL = "#2a78d6";
const TRACK = "#cde2fb";

function Meter({ label, valueLabel, share }: { label: string; valueLabel: string; share: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-xs font-semibold text-text tabular-nums">{valueLabel}</p>
      </div>
      <div className="h-3 w-full rounded-full overflow-hidden" style={{ backgroundColor: TRACK }}>
        <div className="h-full rounded-full" style={{ width: `${Math.min(share, 100)}%`, backgroundColor: FILL }} />
      </div>
    </div>
  );
}

export function Lockbox({ report }: { report: Report }) {
  const { lockbox } = report;
  const payoutShareOfBudget = (lockbox.annualPayout / report.totalRevenue) * 100;
  const lockedShare = lockbox.permanentlyRestricted * 100;

  return (
    <div className="border-t border-border pt-16 mb-16">
      <span className="text-xs font-semibold uppercase tracking-wider text-text-faint">The Lockbox</span>
      <h2 className="mt-2 text-lg font-sans text-text">Why a ${lockbox.endowmentTotal.toFixed(1)}B endowment still needs your gift</h2>
      <p className="mt-2 text-xs text-text-muted max-w-2xl">
        Most of the endowment is bound by permanent legal restrictions, and strict annual spending-pacing rules mean it
        only reaches a small slice of the operating budget each year.
      </p>

      <div className="mt-8 flex flex-col gap-10 max-w-3xl">
        <Meter
          label="Permanently restricted — legally locked forever"
          valueLabel={`${lockedShare.toFixed(0)}% of endowment`}
          share={lockedShare}
        />
        <Meter
          label="Annual payout as a share of the operating budget"
          valueLabel={`$${lockbox.annualPayout.toFixed(2)}B (${payoutShareOfBudget.toFixed(1)}%)`}
          share={payoutShareOfBudget}
        />
      </div>

      <p className="mt-6 text-xs text-text-muted max-w-2xl">
        At a {(lockbox.spendingRate * 100).toFixed(1)}% spending rate, the endowment funds roughly{" "}
        <span className="text-text font-medium">{payoutShareOfBudget.toFixed(1)}%</span> of this year's ${report.totalRevenue.toFixed(2)}B
        budget — proof that current, flexible gifts remain the university's real growth capital.
      </p>
    </div>
  );
}
