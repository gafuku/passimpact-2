import { PortalGuard } from "../components/portal/PortalGuard";
import { PortalNav } from "../components/portal/PortalNav";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalGuard>
      <div className="flex h-screen overflow-hidden bg-surface text-foreground font-sans">
        <PortalNav />
        <main id="main-content" className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-8 md:py-10">{children}</div>
        </main>
      </div>
    </PortalGuard>
  );
}
