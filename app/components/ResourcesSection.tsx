import { IconArrowRight } from "./icons";

export function ResourcesSection() {
  return (
    <section className="bg-surface py-24 border-t border-border">
      <div className="mx-auto max-w-6xl px-inset">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-faint">Notes</span>
            <h2 className="mt-3 text-lg md:text-lg font-sans font-normal tracking-tight text-text">
              Notes from the build
            </h2>
          </div>
          <a href="/notes" className="mt-4 md:mt-0 flex items-center gap-1 text-xs font-medium text-text hover:text-brand transition-colors group">
            All posts <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 border-t border-l border-border">
          {/* Featured Card */}
          <a href="#" className="group md:row-span-2 flex flex-col border-r border-b border-border bg-white transition-colors hover:bg-surface-raised">
            <div className="aspect-video w-full overflow-hidden border-b border-border bg-surface-raised relative">
              <img
                src="https://conversion.ai/images/blog/conversion-agents.webp"
                alt="Endowment lockbox breakdown"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="p-8 flex flex-col flex-1">
              <span className="text-xs font-semibold text-text-muted mb-4 block uppercase tracking-wider">Endowment 101</span>
              <h3 className="text-base font-sans font-normal text-text mb-3">Why a $21.2B endowment still needs your gift</h3>
              <p className="mt-2 text-xs text-text-muted leading-relaxed">
                Locked capital and strict spending-pacing rules mean the endowment covers only a fraction of the operating budget — active giving remains the growth capital.
              </p>
              <div className="mt-auto pt-6 flex items-center text-xs font-medium text-brand">
                Read article <IconArrowRight className="ml-2 h-3.5 w-3.5" />
              </div>
            </div>
          </a>

          {/* Secondary Card 1 */}
          <a href="#" className="group flex flex-col justify-center border-r border-b border-border bg-white p-8 transition-colors hover:bg-surface-raised">
            <span className="text-xs font-semibold text-text-muted mb-4 block uppercase tracking-wider">Product</span>
            <h3 className="text-base font-sans font-normal text-text mb-3">Reading a Sankey diagram in 30 seconds</h3>
            <p className="mt-2 text-xs text-text-muted leading-relaxed">
              How the Cash Flow Story maps money in against money out — from tuition and patient care to research and financial aid.
            </p>
            <div className="mt-6 flex items-center text-xs font-medium text-brand">
              Read article <IconArrowRight className="ml-2 h-3.5 w-3.5" />
            </div>
          </a>

          {/* Secondary Card 2 */}
          <a href="#" className="group flex flex-col justify-center border-r border-b border-border bg-white p-8 transition-colors hover:bg-surface-raised">
            <span className="text-xs font-semibold text-text-muted mb-4 block uppercase tracking-wider">Insights</span>
            <h3 className="text-base font-sans font-normal text-text mb-3">Private gifts grew 75% at Michigan — here's why it matters</h3>
            <p className="mt-2 text-xs text-text-muted leading-relaxed">
              Earned income still drives the budget, but flexible individual giving was the fastest-growing revenue line between FY22 and FY25.
            </p>
            <div className="mt-6 flex items-center text-xs font-medium text-brand">
              Read article <IconArrowRight className="ml-2 h-3.5 w-3.5" />
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
