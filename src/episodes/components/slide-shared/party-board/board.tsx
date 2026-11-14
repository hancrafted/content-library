import type { ReactNode } from 'react';

/*
 * The party board drawn as SVG: a planning whiteboard a Scene fills with sticky notes (`note.tsx`), team tags,
 * handoff arrows, the oversight pills (`oversight-pills.tsx`), a person on the loop, the agent badge and the tick. Each
 * part takes plain props and its words from the Scene. Shared because each section slide draws the same board at its
 * own state (FE-007 §5).
 */

/** The board's own size, the frame every Scene lays its parts out in. */
const BOARD = { width: 360, height: 180 } as const;

/** The whiteboard: an `<svg>` holding the board surface and the Scene's parts, named once for assistive technology. */
export function Board({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg
      viewBox={`0 0 ${BOARD.width} ${BOARD.height}`}
      className="w-full max-w-xl"
      role="img"
      aria-label={label}
      data-board
    >
      <rect x={0} y={0} width={BOARD.width} height={BOARD.height} rx={10} className="fill-muted" />
      {children}
    </svg>
  );
}

/** A team's name as a dark tag above its notes. */
export function TeamTag({ x, y, width, label }: { x: number; y: number; width: number; label: string }) {
  return (
    <g data-team-tag>
      <rect x={x} y={y} width={width} height={20} rx={10} className="fill-foreground" />
      <text x={x + width / 2} y={y + 15} textAnchor="middle" className="fill-background text-caption font-semibold">
        {label}
      </text>
    </g>
  );
}

/**
 * A check passed: a tick in a circle. `success` is the fixed mark (a seam that now holds); `primary`, a check standing
 * on a handoff.
 */
export function Tick({ cx, cy, tone }: { cx: number; cy: number; tone: 'success' | 'primary' }) {
  const fixed = tone === 'success';
  return (
    <g data-tick={tone}>
      {fixed ? (
        <circle cx={cx} cy={cy} r={9} className="fill-(--success)" />
      ) : (
        <circle cx={cx} cy={cy} r={8} className="fill-card stroke-primary" strokeWidth={2} />
      )}
      <path
        d={`M${cx - 4} ${cy} l3 3 l5 -5`}
        className={fixed ? 'fill-none stroke-(--success-foreground)' : 'fill-none stroke-primary'}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </g>
  );
}

type ArrowTone = 'foreground' | 'primary' | 'destructive';

const ARROW_CLASS: Record<ArrowTone, string> = {
  foreground: 'fill-none stroke-foreground',
  primary: 'fill-none stroke-primary',
  destructive: 'fill-none stroke-destructive',
};

/** A handoff arrow at height `y`, its head at `to`: pointing right when `to` lies right of `from`, else left. */
export function Arrow({ from, to, y, tone = 'foreground' }: { from: number; to: number; y: number; tone?: ArrowTone }) {
  const back = to < from ? -6 : 6;
  return (
    <g data-arrow>
      <line x1={from} y1={y} x2={to} y2={y} className={ARROW_CLASS[tone]} strokeWidth={2} />
      <path
        d={`M${to - back} ${y - 5} L${to} ${y} L${to - back} ${y + 5}`}
        className={ARROW_CLASS[tone]}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

/** The agent badge on a note's corner, in the meaning colour `ai`. */
export function AgentBadge({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g data-agent-badge>
      <circle cx={cx} cy={cy} r={7} className="fill-card stroke-ai" strokeWidth={1.5} />
      <path
        d={`M${cx} ${cy - 4.5} L${cx + 1.4} ${cy - 1.4} L${cx + 4.5} ${cy} L${cx + 1.4} ${cy + 1.4} L${cx} ${cy + 4.5} L${cx - 1.4} ${cy + 1.4} L${cx - 4.5} ${cy} L${cx - 1.4} ${cy - 1.4} Z`}
        className="fill-ai"
      />
    </g>
  );
}

/** A person, in the meaning colour `human`, standing with their feet at `y`. */
export function Person({ cx, y }: { cx: number; y: number }) {
  return (
    <g data-person>
      <circle cx={cx} cy={y - 18.6} r={4.34} className="fill-human" />
      <path d={`M${cx - 6.82} ${y} Q${cx} ${y - 26.04} ${cx + 6.82} ${y} Z`} className="fill-human" />
    </g>
  );
}
