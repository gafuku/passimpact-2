import { IconLogo } from "./icons";
import { NavAuthArea } from "./portal/NavAuthArea";
import { PublicNavLinks, PublicNavCta } from "./portal/PublicNavLinks";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto max-w-6xl px-6">
        <nav className="flex items-center justify-between py-3">
          <a href="/" className="flex items-center">
            {/* Dark logo text for Pass Impact */}
            <span className="text-lg font-bold tracking-tight text-text flex items-center gap-2">
              <IconLogo className="h-5 w-auto text-text" />
              Pass Impact
            </span>
          </a>
          <PublicNavLinks />
          <div className="flex items-center gap-3">
            <NavAuthArea />
            <PublicNavCta />
          </div>
        </nav>
      </div>
    </header>
  );
}
