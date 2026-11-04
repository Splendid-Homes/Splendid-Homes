// Splendid Homes logo: house mark (roof, window, sweeping path) + SPLENDID / HOMES wordmark.
// Ported from the prototype; colour follows `currentColor`.
export function LogoMark({ size = 42, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true" className={className}>
      <path d="M6 54L50 14l8-3 34 40-8 1-29-33-33 35z" fill="currentColor" />
      <path d="M22 54h10v16l-10-4z" fill="currentColor" />
      <path d="M82 51v15" stroke="currentColor" strokeWidth="3.2" />
      <rect x="50" y="34" width="14" height="16" stroke="currentColor" strokeWidth="2.6" />
      <path d="M57 34v16M50 42h14" stroke="currentColor" strokeWidth="2" />
      <path d="M2 74c26-10 56-13 94-8l-2 3c-28-3-52 0-77 17z" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ size = 42, className = '' }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 leading-none ${className}`}>
      <LogoMark size={size} />
      <span className="flex flex-col gap-1.5">
        <span className="font-logo text-[1.32em] font-semibold tracking-[0.3em] -mr-[0.3em]">SPLENDID</span>{' '}
        <span className="flex items-center justify-center gap-[0.6em] text-[0.6em] font-medium tracking-[0.55em] -mr-[0.55em]">
          <i aria-hidden="true" className="h-px min-w-3.5 flex-1 bg-current opacity-70" />HOMES<i aria-hidden="true" className="h-px min-w-3.5 flex-1 bg-current opacity-70" />
        </span>
      </span>
    </span>
  );
}
