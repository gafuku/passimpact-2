export function LogoCloud() {
  const institutions = ["University of Michigan", "Harvard", "Stanford", "Yale", "MIT"];
  return (
    <section className="border-b border-border bg-white py-10">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-text-muted mb-8">
          Real, audited data — 14 institutions and counting
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale">
          {institutions.map((name) => (
            <span key={name} className="text-lg font-bold tracking-tight text-text">
              {name}
            </span>
          ))}
          <span className="text-xs font-semibold tracking-tight text-text-faint">+ 9 more</span>
        </div>
      </div>
    </section>
  );
}
