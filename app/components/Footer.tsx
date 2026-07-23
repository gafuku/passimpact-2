import { IconLogo, IconShield, IconLock } from "./icons";

export function Footer() {
  return (
    <footer className="bg-surface-raised pt-20 border-t border-border overflow-hidden relative">
      <div className="mx-auto max-w-6xl px-inset">
        <div className="flex flex-col lg:flex-row gap-16 mb-20 relative z-10">
          {/* Brand Col */}
          <div className="lg:w-1/3 flex flex-col items-start">
            <a href="/" className="mb-6 flex items-center gap-2">
              <IconLogo className="h-5 w-auto text-text" />
              <span className="text-lg font-bold tracking-tight text-text">Pass Impact</span>
            </a>
            <p className="text-xs text-text-muted mb-8 max-w-xs leading-relaxed">
              Turning dense university financial filings into clear, visual donor stories — interactive cash flow, year-over-year trends, and endowment literacy for 14 institutions.
            </p>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[10px] font-mono tracking-wide text-text-muted">
                <IconShield className="h-3 w-3" /> Audited Data
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[10px] font-mono tracking-wide text-text-muted">
                <IconLock className="h-3 w-3" /> FY2025
              </span>
            </div>
          </div>

          {/* Link Columns */}
          <div className="lg:w-2/3 grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-12">
            <div>
              <h4 className="font-semibold text-text mb-5 text-xs uppercase tracking-wider">Product</h4>
              <ul className="space-y-4 text-xs text-text-muted font-medium">
                <li><a href="#" className="hover:text-text transition-colors">Cash Flow Story</a></li>
                <li><a href="#" className="hover:text-text transition-colors">The Year Lens</a></li>
                <li><a href="#" className="hover:text-text transition-colors">The Explorer</a></li>
                <li><a href="#" className="hover:text-text transition-colors">The Lockbox</a></li>
                <li><a href="#" className="hover:text-text transition-colors">Institutions</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-text mb-5 text-xs uppercase tracking-wider">Solutions</h4>
              <ul className="space-y-4 text-xs text-text-muted font-medium">
                <li><a href="#" className="hover:text-text transition-colors">For Donors & Alumni</a></li>
                <li><a href="#" className="hover:text-text transition-colors">For Advancement Teams</a></li>
                <li><a href="#" className="hover:text-text transition-colors">For Educational Analysts</a></li>
                <li><a href="#" className="hover:text-text transition-colors">Sample Report</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-text mb-5 text-xs uppercase tracking-wider">Resources</h4>
              <ul className="space-y-4 text-xs text-text-muted font-medium">
                <li><a href="#" className="hover:text-text transition-colors">Notes</a></li>
                <li><a href="#" className="hover:text-text transition-colors">Methodology</a></li>
                <li><a href="#" className="hover:text-text transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-text transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-text mb-5 text-xs uppercase tracking-wider">Company</h4>
              <ul className="space-y-4 text-xs text-text-muted font-medium">
                <li><a href="#" className="hover:text-text transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-text transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-text transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-text transition-colors">How We Source It</a></li>
                <li><a href="#" className="hover:text-text transition-colors">Partners</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Legal Bar */}
        <div className="pt-8 pb-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-xs font-medium text-text-muted">
            <p>© 2026 Pass Impact. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-text transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-text transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-text transition-colors flex items-center gap-1.5">
                Your Privacy Choices
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-5 text-text-muted">
            <a href="#" aria-label="LinkedIn" className="hover:text-text transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            <a href="#" aria-label="X (Twitter)" className="hover:text-text transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" aria-label="YouTube" className="hover:text-text transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Absolute Bottom Decoration Logo */}
      <div className="absolute left-1/2 -bottom-24 -translate-x-1/2 pointer-events-none opacity-[0.03] w-[120%] max-w-[1400px] flex justify-center">
        <IconLogo className="h-[28rem] w-auto text-text" />
      </div>
    </footer>
  );
}
