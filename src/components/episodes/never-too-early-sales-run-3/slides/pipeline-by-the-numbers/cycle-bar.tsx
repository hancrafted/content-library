import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';
import styles from './pipeline-by-the-numbers.module.css';

type SegmentId = 'lead' | 'opportunity' | 'deal';

interface Segment {
  id: SegmentId;
  label: string;
  start: number;
  end: number;
}

interface CycleBarProps {
  total: string;
  segments: readonly Segment[];
  /** Whole months from the first lead, one tick each. */
  ticks: readonly number[];
  months: number;
}

/** User units per month in the bar's viewBox. */
const MONTH = 120;
/** Gap between two segments, in user units. */
const GAP = 4;

const FILL: Record<SegmentId, string> = {
  lead: 'fill-foreground',
  opportunity: 'fill-muted-foreground',
  deal: styles.dealSegment ?? '',
};

/**
 * The sales cycle drawn to scale: one segment per stage, a tick per month, and each label under its segment. The bar
 * is an inline SVG; its labels are text in the page, so they keep their size at every width. A server part with
 * plain props.
 */
export function CycleBar({ total, segments, ticks, months }: CycleBarProps) {
  return (
    <div className="@container flex flex-col gap-2">
      <p className="text-body font-semibold text-foreground">{total}</p>
      <div className={styles.bar}>
        <svg viewBox={`0 0 ${months * MONTH} 32`} preserveAspectRatio="none" className="h-8 w-full" aria-hidden="true">
          {segments.map((segment, index) => (
            <SegmentRect key={segment.id} segment={segment} first={index === 0} last={index === segments.length - 1} />
          ))}
          <path
            d={ticks.map((tick) => `M${tick * MONTH} 24 V32`).join(' ')}
            className="stroke-muted-foreground"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 @3xl:relative @3xl:block @3xl:h-6">
        {segments.map((segment, index) => (
          <SegmentLabel key={segment.id} segment={segment} first={index === 0} months={months} />
        ))}
      </div>
    </div>
  );
}

/** One stage's span of the bar, half a gap shorter at each inner edge. */
function SegmentRect({ segment, first, last }: { segment: Segment; first: boolean; last: boolean }) {
  const x = segment.start * MONTH + (first ? 0 : GAP / 2);
  const end = segment.end * MONTH - (last ? 0 : GAP / 2);
  return <rect x={x} y="6" width={end - x} height="14" className={FILL[segment.id]} />;
}

/** A label under its segment: the first starts at the bar's left edge, the others centre on their segment. */
function SegmentLabel({ segment, first, months }: { segment: Segment; first: boolean; months: number }) {
  const centre = `${(((segment.start + segment.end) / 2 / months) * 100).toFixed(2)}%`;
  return (
    <span
      className={cn(
        'text-caption whitespace-nowrap @3xl:absolute @3xl:top-0',
        first ? '@3xl:left-0' : '@3xl:left-(--at) @3xl:-translate-x-1/2',
        segment.id === 'deal' ? 'font-semibold text-foreground' : 'text-muted-foreground',
      )}
      style={{ '--at': centre } as CSSProperties}
    >
      {segment.label}
    </span>
  );
}
