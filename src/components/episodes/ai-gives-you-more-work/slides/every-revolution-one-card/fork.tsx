import type { ReactNode } from 'react';

/** A standing figure, head and shoulders, at `x`, `y` (the head's centre). */
function Figure({ x, y }: { x: number; y: number }) {
  return (
    <>
      <circle cx={x} cy={y} r="5" />
      <path d={`M${x - 7} ${y + 22} v-9 a7 7 0 0 1 14 0 v9 z`} />
    </>
  );
}

const LINE_FIGURES = [18, 42, 66, 90, 114];

/**
 * The steam fork: one line splits, a few figures rise to the control desk and the rest stay on the line, all drawn in
 * the same `fill-foreground/70`, so neither branch reads as better.
 */
function SteamFork({ stayed, rose }: { stayed: ReactNode; rose: ReactNode }) {
  return (
    <>
      <svg viewBox="0 0 220 150" className="mx-auto w-full max-w-64" aria-hidden="true">
        <g className="fill-none stroke-foreground/50" strokeWidth="2">
          <path d="M110 0 V22" />
          <path d="M110 22 C110 52 58 52 58 92" />
          <path d="M110 22 C110 40 168 36 168 30" />
        </g>
        <rect x="140" y="56" width="62" height="6" rx="2" className="fill-foreground/40" />
        <path d="M4 136 H130" className="fill-none stroke-foreground/40" strokeWidth="2" />
        <g className="fill-foreground/70">
          <Figure x={158} y={30} />
          <Figure x={184} y={30} />
          {LINE_FIGURES.map((x) => (
            <Figure key={x} x={x} y={108} />
          ))}
        </g>
      </svg>
      <div className="flex flex-col gap-1 text-caption text-muted-foreground">
        <p className="flex items-start gap-1">{rose}</p>
        <p className="flex items-start gap-1">{stayed}</p>
      </div>
    </>
  );
}

/** The fork under AI, left open: a group at the split, two dashed `stroke-ai` branches with empty ends. */
function OpenFork({ title, beside, manage }: { title: string; beside: string; manage: string }) {
  return (
    <>
      <p className="text-caption font-semibold tracking-widest text-ai uppercase">{title}</p>
      <svg viewBox="0 0 220 120" className="mx-auto w-2/3" aria-hidden="true">
        <path d="M110 0 V20" className="fill-none stroke-ai" strokeWidth="2" />
        <g className="fill-foreground/70">
          <Figure x={110} y={30} />
        </g>
        <g className="fill-foreground/50">
          <Figure x={96} y={34} />
          <Figure x={124} y={34} />
        </g>
        <g className="fill-none stroke-ai" strokeWidth="2">
          <path d="M110 60 C110 84 40 80 40 100" strokeDasharray="5 5" />
          <path d="M110 60 C110 84 180 80 180 100" strokeDasharray="5 5" />
          <circle cx="40" cy="108" r="10" strokeDasharray="3 4" />
          <circle cx="180" cy="108" r="10" strokeDasharray="3 4" />
        </g>
      </svg>
      <div className="grid grid-cols-2 gap-2 text-caption text-muted-foreground">
        <p>{beside}</p>
        <p className="text-right">{manage}</p>
      </div>
    </>
  );
}

type ForkProps =
  { open: false; stayed: ReactNode; rose: ReactNode } | { open: true; title: string; beside: string; manage: string };

/** The fork under an exhibit: the steam engine's, where people went two ways, or AI's, still open. */
export function Fork(props: ForkProps) {
  return props.open ? <OpenFork {...props} /> : <SteamFork {...props} />;
}
