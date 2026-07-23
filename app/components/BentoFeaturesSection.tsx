import { IconDatabase, IconLock, IconGitBranch } from "./icons";
import { BentoCell } from "./BentoCell";

export function BentoFeaturesSection() {
  return (
    <section className="bg-surface border-t border-border">
      <div className="mx-auto max-w-6xl px-inset pt-16 md:pt-24">
        <div className="mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-faint">Platform</span>
          <h2 className="mt-3 text-lg md:text-lg font-sans tracking-tight text-text font-normal max-w-xl">
            From audited filing to a visual donor story
          </h2>
          <p className="mt-4 text-text-muted text-lg max-w-2xl">
            Interactive Sankey diagrams, historical trends, and multi-institution comparisons — built to reveal how a university actually runs on money.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-12 border-t border-l border-border">
          {/* Feature Hero Item */}
          <BentoCell className="md:col-span-12 p-0">
            <div className="grid md:grid-cols-[1fr_1.2fr] items-stretch min-h-[400px]">
              <div className="p-10 md:p-16 flex flex-col justify-center">
                <h3 className="text-base font-sans text-text">The Interactive Cash Flow Story</h3>
                <p className="mt-4 text-xs leading-relaxed text-text-muted">
                  A dynamic, dual-sided flow chart that instantly maps university
                  revenue (money in) against operational expenses (money out) —
                  from patient care and tuition to research, instruction, and
                  student fellowships.
                </p>
                <div className="mt-8">
                  <a href="/flow" className="inline-flex items-center justify-center rounded bg-surface-raised text-text border border-border hover:bg-border/40 px-5 py-2 text-xs font-medium transition-all">
                    Explore the flow chart
                  </a>
                </div>
              </div>
              <div className="relative overflow-hidden bg-surface-raised border-l border-border p-8 flex items-center justify-center min-h-[300px]">
                {/* Background texture overlay */}
                <div className="absolute inset-0 opacity-40 mix-blend-multiply" style={{ backgroundImage: 'url(https://conversion.ai/images/textures/2.webp)', backgroundSize: 'cover' }}></div>

                {/* Video Card */}
                <div className="relative z-10 w-full max-w-md rounded-xl overflow-hidden border border-border/50 shadow-2xl backdrop-blur-md bg-white/50">
                  <video
                    className="w-full h-auto"
                    src="https://conversion.ai/videos/data-model.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                </div>
              </div>
            </div>
          </BentoCell>

          {/* Row 2 */}
          <BentoCell className="md:col-span-4 p-10 md:p-12">
            <IconDatabase className="h-6 w-6 text-text-faint mb-6" />
            <h3 className="text-base font-sans text-text">The Explorer</h3>
            <p className="mt-4 text-xs leading-relaxed text-text-muted">
              Toggle individual line items over a 5-year trend window and view them as absolute dollars, stacked totals, percentage share, or indexed growth.
            </p>
          </BentoCell>

          <BentoCell className="md:col-span-4 p-10 md:p-12">
            <IconLock className="h-6 w-6 text-text-faint mb-6" />
            <h3 className="text-base font-sans text-text">The Lockbox</h3>
            <p className="mt-4 text-xs leading-relaxed text-text-muted">
              Demystifies why massive endowments still need current gifts — how much capital is legally locked, and how spending-pacing rules limit what reaches the budget each year.
            </p>
          </BentoCell>

          <BentoCell className="md:col-span-4 p-10 md:p-12">
            <IconGitBranch className="h-6 w-6 text-text-faint mb-6" />
            <h3 className="text-base font-sans text-text">Peer Comparison</h3>
            <p className="mt-4 text-xs leading-relaxed text-text-muted">
              Line up a university against its peer set — Harvard, Stanford, Yale, MIT, and more — to see how funding trends actually compare.
            </p>
          </BentoCell>
        </div>
      </div>
    </section>
  );
}
