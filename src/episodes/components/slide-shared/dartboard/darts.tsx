import { cn } from '@/shared/lib/utils';

/** A point on the board's SVG: a dot's centre, a document's top-left corner. */
export interface Point {
  readonly x: number;
  readonly y: number;
}

/**
 * What a throw means, by colour: `primary` on target, `ai` thrown by AI, `warning` off target, `dulled` a loose
 * cluster drawn toward `muted-foreground`, `foreground` a plain one.
 */
export type DartTone = 'primary' | 'ai' | 'warning' | 'dulled' | 'foreground';

const TONE: Record<DartTone, string> = {
  primary: 'fill-primary',
  ai: 'fill-ai',
  warning: 'fill-(--warning)',
  dulled: 'fill-muted-foreground',
  foreground: 'fill-foreground',
};

export type DartsProps = {
  readonly points: readonly Point[];
  readonly tone: DartTone;
  /** A `card` edge, so a dart reads on a ring of its own colour. */
  readonly edge?: boolean;
} & ({ readonly shape?: 'dot'; readonly r: number } | { readonly shape: 'document' });

/**
 * The darts thrown at the `Dartboard`: one mark per point, a dot or a document page with a folded corner, the
 * Episode's unit of work. A fragment of SVG marks, so a Scene places them in its own `<svg>` over the board.
 */
export function Darts(props: DartsProps) {
  const { points, tone, edge = false } = props;
  const className = cn(TONE[tone], edge && 'stroke-card');
  if (props.shape === 'document') {
    return points.map(({ x, y }) => (
      <path key={`${x}-${y}`} data-hit d={`M${x} ${y} h14 l6 6 v18 h-20 z`} className={className} strokeWidth={2} />
    ));
  }
  return points.map(({ x, y }) => (
    <circle key={`${x}-${y}`} data-dart cx={x} cy={y} r={props.r} className={className} />
  ));
}
