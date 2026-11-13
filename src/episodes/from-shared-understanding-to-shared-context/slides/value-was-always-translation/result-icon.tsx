import type { ReactNode } from 'react';

/** What an intent was translated into: a boxed product, a service handshake, a lecture at a lectern. */
export type ResultIcon = 'box' | 'handshake' | 'lectern';

const LINE = { strokeWidth: 2.5, strokeLinejoin: 'round', strokeLinecap: 'round' } as const;

const DRAWING: Record<ResultIcon, ReactNode> = {
  box: (
    <>
      <path d="M10 21 32 10l22 11v25L32 57 10 46z" className="fill-card stroke-foreground" {...LINE} />
      <path d="M10 21l22 11 22-11M32 32v25" className="fill-none stroke-foreground" {...LINE} />
      <path d="M21 15.5l22 11v8" className="fill-none stroke-muted-foreground" {...LINE} />
    </>
  ),
  handshake: (
    <>
      <path d="M3 24h12v18H3z" className="fill-muted stroke-foreground" {...LINE} />
      <path d="M49 24h12v18H49z" className="fill-muted stroke-foreground" {...LINE} />
      <path d="M15 27l9-5h10l15 4v13l-8 7H27l-12-6z" className="fill-card stroke-foreground" {...LINE} />
      <path d="M30 28h10M27 34l6 4M31 32l7 5M35 30l7 5" className="fill-none stroke-foreground" {...LINE} />
    </>
  ),
  lectern: (
    <>
      <circle cx="32" cy="10" r="6" className="fill-muted stroke-foreground" strokeWidth={2.5} />
      <path d="M12 24h40l4 9H8z" className="fill-card stroke-foreground" {...LINE} />
      <path d="M27 33l-2 21h14l-2-21" className="fill-card stroke-foreground" {...LINE} />
      <path d="M18 56h28" className="stroke-foreground" {...LINE} />
    </>
  ),
};

/** One result card's picture, in `foreground`: decorative, the card's words carry the meaning. */
export function ResultIconSvg({ icon }: { icon: ResultIcon }) {
  return (
    <svg viewBox="0 0 64 64" className="size-14 shrink-0" aria-hidden="true">
      {DRAWING[icon]}
    </svg>
  );
}
