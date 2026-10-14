import type { TargetProps } from '@/lib/context-link.pure';

/** Many small dots over the funnel's wide top: the volume marketing speaks to. Fixed, so every build draws the same. */
const DOTS: readonly (readonly [number, number])[] = [
  [47, 6],
  [68, 6],
  [86, 7],
  [101, 8],
  [120, 8],
  [140, 6],
  [161, 10],
  [178, 7],
  [49, 21],
  [68, 18],
  [90, 17],
  [108, 18],
  [121, 17],
  [141, 21],
  [159, 19],
  [182, 18],
  [48, 28],
  [63, 29],
  [87, 30],
  [104, 30],
  [124, 29],
  [145, 31],
  [160, 30],
  [181, 32],
];

/** Wide at the top, narrow at the bottom: the left edge falls straight, the right edge slopes in to the spout. */
const FUNNEL = 'M40 42 H190 L60 112 V138 H40 Z';

/**
 * Our own drawn marketing funnel: many in at the wide top, few out of the spout. The spout sits at a quarter of the
 * drawing's width, so a box two fifths as wide as the deal board drops it over the board's first column. Everything
 * is currentColor; the label is HTML beside it, or under it below `md`. A Slide-local server part with plain props.
 */
export function MarketingFunnel({ label, target }: { label: string; target?: TargetProps }) {
  return (
    <div {...target} className="flex flex-wrap items-center gap-x-4 gap-y-2 md:flex-nowrap">
      <svg aria-hidden="true" viewBox="0 0 200 140" className="h-auto w-full max-w-xs shrink-0 md:w-2/5 md:max-w-none">
        <path d={FUNNEL} fill="currentColor" className="text-muted" />
        <path
          d={FUNNEL}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinejoin="round"
          className="text-muted-foreground"
        />
        <g fill="currentColor" className="text-muted-foreground">
          {DOTS.map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={2.5} />
          ))}
        </g>
      </svg>
      <p className="text-body font-semibold">{label}</p>
    </div>
  );
}
