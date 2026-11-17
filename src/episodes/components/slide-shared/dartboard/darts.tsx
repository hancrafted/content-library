import { cn } from '@/shared/lib/utils';

export interface Point {
  readonly x: number;
  readonly y: number;
}

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
  readonly edge?: boolean;
} & ({ readonly shape?: 'dot'; readonly r: number } | { readonly shape: 'document' });

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
