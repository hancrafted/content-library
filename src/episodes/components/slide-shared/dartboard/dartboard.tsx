import { cn } from '@/shared/lib/utils';

/** How a board is drawn: `hero` on the Title slide and the Slides it explains, `quiet` as a section slide's echo. */
export type DartboardTone = 'hero' | 'quiet';

export interface DartboardProps {
  readonly cx: number;
  readonly cy: number;
  /** The outer ring's radius; the rings step in evenly from it. */
  readonly r: number;
  /** How many rings sit around the bull, at least one. */
  readonly rings: number;
  /** The bull's radius. */
  readonly bull: number;
  readonly tone?: DartboardTone;
}

const RING_LOOK = {
  hero: (index: number) =>
    cn(index % 2 === 0 ? 'fill-card' : 'fill-muted', index === 0 ? 'stroke-foreground' : 'stroke-muted-foreground'),
  quiet: (index: number) => cn(index % 2 === 0 ? 'fill-muted' : 'fill-card', 'stroke-border'),
} as const;

/**
 * The dartboard, the Hero motif of "From shared understanding to shared context": evenly spaced rings around a bull in
 * `primary`, the intent every document is thrown at. An SVG group, so a Scene places it inside its own `<svg>` and
 * draws the darts over it. Shared because the Title slide, every section slide and the precision and accuracy Slides
 * draw it (FE-007).
 */
export function Dartboard({ cx, cy, r, rings, bull, tone = 'quiet' }: DartboardProps) {
  if (rings < 1) throw new Error(`A dartboard needs at least one ring around its bull, got ${rings}.`);
  const radii = Array.from({ length: rings }, (_, index) => (r * (rings - index)) / rings);
  return (
    <g data-dartboard>
      {radii.map((radius, index) => (
        <circle
          key={radius}
          data-ring
          cx={cx}
          cy={cy}
          r={radius}
          strokeWidth={index === 0 && tone === 'hero' ? 3 : 1.5}
          className={RING_LOOK[tone](index)}
        />
      ))}
      <circle data-bull cx={cx} cy={cy} r={bull} className="fill-primary" />
    </g>
  );
}
