export function TestimonialSection() {
  return (
    <section className="bg-surface relative border-t border-border">
      {/* Outer wrapper with hatch pattern */}
      <div className="gutter-hatch-pattern">
        <div className="mx-auto max-w-6xl">
          {/* Inner content wrapper to mask hatch behind it */}
          <div className="bg-surface border-x border-border p-6 md:p-12 lg:p-16">
            <div className="flex flex-col mb-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-faint">In practice</span>
              <h2 className="mt-4 font-sans text-lg md:text-lg font-normal tracking-tight text-text">
                "I finally understand why a $21 billion endowment still needs my gift."
              </h2>
              <div className="mt-8 flex items-center gap-4">
                <p className="text-text font-medium text-lg">Sarah K.</p>
                <span className="w-1 h-1 rounded-full bg-border-strong"></span>
                <p className="text-text-muted text-lg">Alumna & Annual Fund Donor</p>
              </div>
            </div>
            
            <div className="rounded-xl overflow-hidden relative aspect-video bg-black group cursor-pointer border border-border shadow-md">
              <video
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                src="https://conversion.ai/videos/pdl-preview-1080.mp4"
                poster="https://conversion.ai/images/videos/pdl-testimonial-poster.jpg"
                autoPlay
                muted
                loop
                playsInline
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              
              {/* Floating Play Button */}
              <button className="absolute bottom-6 left-6 md:bottom-10 md:left-10 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-colors hover:bg-white/30 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" className="ml-1 opacity-100">
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
