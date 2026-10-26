/**
 * The brand symbol: an ink coin with a hand cut out of it and an accent dot in the palm.
 * Same geometry as `src/app/icon.svg`, its source of truth (a post-build test compares them); colours follow the site theme through tokens.
 * Decorative — the site name beside it carries the accessible name.
 */
export function BrandSymbol({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" data-testid="brand-symbol" className={className}>
      <circle cx="50" cy="50" r="50" fill="var(--foreground)" />
      <g fill="none" stroke="var(--background)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
        <path d="M36 64V32" />
        <path d="M50 64V22" />
        <path d="M64 64V26" />
        <path d="M78 64V40" />
        <path d="M30 76C18 76 14 66 18 56" />
      </g>
      <circle cx="57" cy="78" r="6" fill="var(--brand-accent)" />
    </svg>
  );
}
