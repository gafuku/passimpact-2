import { IconArrowRight } from "./icons";

export function HeroSection() {
  return (
    <section className="relative flex flex-col overflow-hidden min-h-[75vh] 2xl:min-h-[80vh] -mt-[60px]">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="https://conversion.ai/videos/hero-preview-1080.mp4"
        poster="https://conversion.ai/images/videos/hero-poster.webp"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/10"></div>
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-32 md:py-40">
        <div className="max-w-2xl text-center md:text-left">
          <h1 className="font-sans text-[32px] leading-[1.1] tracking-tight text-white md:text-5xl animate-fade-up font-normal">
            See where giving grows.
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base text-white/70 md:mx-0 md:text-lg animate-fade-up" style={{ animationDelay: "100ms" }}>
            Where every dollar comes from, and where it goes. Fourteen
            universities' annual reports, translated for donors.
          </p>
          <div className="mt-8 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <a
              href="/report"
              className="inline-flex items-center justify-center rounded bg-text border border-white/10 px-5 py-2 text-xs font-medium tracking-wide text-text-invert transition-all hover:brightness-125 group"
            >
              See a sample report
              <IconArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </a>
            
            <button className="absolute bottom-10 left-6 md:left-auto mt-12 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur-md transition-colors hover:bg-white/25 md:h-12 md:w-12 md:relative md:bottom-auto md:left-auto md:mt-16">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" className="ml-1 opacity-90">
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
