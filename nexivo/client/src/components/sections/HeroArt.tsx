/** Aurora: three blurred blobs drifting slowly (CSS only, paused under reduced motion via the global rule). */
export function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
      <div className="absolute -left-[10%] -top-[30%] h-[70vmax] w-[70vmax] animate-aurora rounded-full opacity-[0.35] blur-[120px] dark:opacity-45"
        style={{ background: "radial-gradient(closest-side, var(--brand), transparent)" }} />
      <div className="absolute -right-[15%] top-[5%] h-[55vmax] w-[55vmax] animate-aurora-slow rounded-full opacity-25 blur-[120px] dark:opacity-35"
        style={{ background: "radial-gradient(closest-side, var(--brand-2), transparent)" }} />
      <div className="absolute bottom-[-35%] left-[30%] h-[50vmax] w-[50vmax] animate-aurora rounded-full opacity-20 blur-[140px] [animation-delay:-8s] dark:opacity-30"
        style={{ background: "radial-gradient(closest-side, var(--violet), transparent)" }} />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
    </div>
  );
}

/** Signature hero visual: concentric orbits with satellites, desktop only. */
export function OrbitArt({ reduced }: { reduced: boolean }) {
  const rings = [
    { r: 120, dur: "38s", dot: "var(--brand-2)", start: 30 },
    { r: 200, dur: "56s", dot: "var(--text)", start: 200 },
    { r: 290, dur: "74s", dot: "var(--brand)", start: 120 },
    { r: 390, dur: "96s", dot: "var(--text-muted)", start: 300 },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute right-[-260px] top-1/2 -z-10 hidden -translate-y-1/2 lg:block xl:right-[-160px]">
      <svg width="820" height="820" viewBox="-410 -410 820 820" className="opacity-80">
        <defs>
          <radialGradient id="core" r="1"><stop offset="0" stopColor="var(--brand-2)" stopOpacity=".9" /><stop offset="1" stopColor="var(--brand)" stopOpacity="0" /></radialGradient>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--text)" stopOpacity=".22" /><stop offset="1" stopColor="var(--text)" stopOpacity=".04" /></linearGradient>
        </defs>
        <circle r="70" fill="url(#core)" opacity=".5" />
        <circle r="6" fill="var(--text)" />
        {rings.map((ring, i) => (
          <g key={i}>
            <circle r={ring.r} fill="none" stroke="url(#ring)" strokeWidth="1" strokeDasharray={i % 2 ? "2 6" : undefined} />
            <g transform={`rotate(${ring.start})`}>
              <g style={reduced ? undefined : { animation: `orbit ${ring.dur} linear infinite ${i % 2 ? "reverse" : "normal"}` }}>
                <circle cx={ring.r} cy="0" r={i === 0 ? 5 : 3.5} fill={ring.dot} />
                {i === 2 && <circle cx={-ring.r} cy="0" r="3" fill="var(--brand-2)" opacity=".8" />}
              </g>
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
