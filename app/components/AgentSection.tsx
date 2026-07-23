import { IconArrowRight } from "./icons";
import Link from "next/link";

export function AgentSection() {
  return (
    <section className="bg-surface relative">
      <div className="mx-auto max-w-6xl px-inset border-border md:border-x pt-16 md:pt-24 pb-12 md:pb-24">
        <div className="grid md:grid-cols-2 md:items-start md:gap-12 gap-6 mb-16">
          <h2 className="font-sans text-lg md:text-lg tracking-tight text-text font-normal">
            The Year Lens.
          </h2>
          <div className="flex flex-col items-start gap-8">
            <p className="text-base leading-relaxed text-text-muted">
              Pick any two fiscal years and Pass Impact instantly calculates growth
              percentages, revenue shifts, and major funding trends — then
              surfaces what those shifts actually mean for your giving strategy.
            </p>
            <Link href="/year-lens" className="inline-flex items-center justify-center rounded bg-surface-raised text-text border border-border hover:bg-border/40 px-5 py-2 text-xs transition-all group">
              Explore the trends <IconArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Demo Video Container */}
        <div className="w-full border-t border-border pt-8 mt-8">
          <div className="-mx-inset">
            <video
              className="aspect-video w-full object-cover"
              src="https://conversion.ai/videos/agents-demo-1080.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
          </div>
        </div>
      </div>
    </section>
  );
}
