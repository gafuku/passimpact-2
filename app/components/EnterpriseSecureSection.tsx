import { IconArrowRight, IconShield, IconDatabase, IconGitBranch } from "./icons";

export function EnterpriseSecureSection() {
  return (
    <section className="bg-surface-invert text-text-invert py-24 relative overflow-hidden">
      {/* Background Textures */}
      <div
        className="absolute inset-0 opacity-40"
        style={{ backgroundImage: 'url(https://conversion.ai/images/textures/6.webp)', backgroundSize: 'cover' }}
      ></div>
      {/* Grain overlay */}
      <div className="absolute inset-0 opacity-50 mix-blend-overlay" style={{ backgroundImage: 'url(https://conversion.ai/images/textures/grain.avif)' }}></div>

      <div className="mx-auto max-w-6xl px-inset relative z-10 text-center">
        <h2 className="text-lg md:text-lg font-sans font-normal tracking-tight mb-6">See it in action</h2>
        <p className="text-text-invert/70 max-w-2xl mx-auto mb-10 text-lg">
          Real, audited FY2025 financial data for the University of Michigan, mapped alongside a pipeline of 13 peer institutions — including Harvard, Stanford, Yale, and MIT.
        </p>
        <a href="/report/michigan/2025" className="inline-flex items-center justify-center rounded border border-white/15 bg-white/10 px-5 py-2 text-xs font-medium text-text-invert hover:bg-white/15 transition-all mb-20 group backdrop-blur-md">
          View the Michigan report <IconArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </a>
      </div>

      <div className="mx-auto max-w-6xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-white/10 text-left">
          {/* Card 1 */}
          <div className="border-r border-b border-white/10 bg-white/5 p-8 relative overflow-hidden">
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex-1 min-h-[160px] flex flex-col justify-center items-center mb-6">
                <div className="relative h-16 w-16 flex items-center justify-center bg-white/10 rounded-2xl border border-white/20 shadow-lg backdrop-blur-md mb-6">
                  <IconShield className="h-8 w-8 text-white" />
                  <div className="absolute -bottom-2 -right-2 h-6 w-6 bg-[#006e8e] rounded-full flex items-center justify-center border-2 border-[#1a1a19]">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5.5L4 8.5L9 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-mono text-[10px] tracking-wide text-white/80">FY2025</span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-mono text-[10px] tracking-wide text-white/80">Audited</span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-mono text-[10px] tracking-wide text-white/80">Public</span>
                </div>
              </div>
              <div>
                <h3 className="text-base font-sans">Audited, Not Modeled</h3>
                <p className="mt-3 text-xs text-white/60 leading-relaxed">Every figure comes from the University of Michigan's actual FY2025 audited financial statements — not projections or estimates.</p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="border-r border-b border-white/10 bg-white/5 p-8 relative overflow-hidden">
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex-1 min-h-[160px] flex items-center justify-center relative mb-6">
                <div className="w-full flex justify-between items-center px-4 relative">
                  <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-y-1/2"></div>
                  <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 relative z-10 backdrop-blur-md">
                    <IconDatabase className="h-5 w-5 text-white" />
                  </div>
                  <div className="h-16 w-16 rounded-full bg-brand flex items-center justify-center border-4 border-[#1a1a19] shadow-[0_0_20px_rgba(0,110,142,0.5)] relative z-10">
                    <IconGitBranch className="h-6 w-6 text-white" />
                  </div>
                  <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 relative z-10 backdrop-blur-md">
                    <IconShield className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-base font-sans">A Growing Peer Set</h3>
                <p className="mt-3 text-xs text-white/60 leading-relaxed">Fourteen institutions and counting, including Harvard, Stanford, Yale, and MIT, so every number has context.</p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="border-r border-b border-white/10 bg-white/5 p-8 relative overflow-hidden">
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex-1 min-h-[160px] flex flex-col justify-center gap-3 mb-6 font-mono text-xs">
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded border border-white/10">
                  <span className="h-2 w-2 rounded-full bg-green-400"></span>
                  <span className="text-white/80 flex-1">Total Revenue (FY22→FY25)</span>
                  <span className="text-white/40">+28.1%</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded border border-white/10">
                  <span className="h-2 w-2 rounded-full bg-brand"></span>
                  <span className="text-white/80 flex-1">Private Gifts (Operating)</span>
                  <span className="text-white/40">+75%</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded border border-white/10">
                  <span className="h-2 w-2 rounded-full bg-green-400"></span>
                  <span className="text-white/80 flex-1">Endowment</span>
                  <span className="text-white/40">$21.2B</span>
                </div>
              </div>
              <div>
                <h3 className="text-base font-sans">The FY22→FY25 Story</h3>
                <p className="mt-3 text-xs text-white/60 leading-relaxed">Earned income from patient care remains the largest driver, but private gifts were the fastest-growing line item — flexible giving still matters most.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
