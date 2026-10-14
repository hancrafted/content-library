import { BoardArrow } from '@/components/slide-shared/board/board-arrow';
import { StickyNote } from '@/components/slide-shared/board/sticky-note';
import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';

interface FunnelProps {
  stages: readonly { slug: string; label: string }[];
  /** One per join between two stages, in reading order. */
  ratios: readonly { label: string; value: string }[];
  total: string;
  noteClassName?: string;
  arrowClassName?: string;
  bandClassName?: string;
}

/** Where each join's note starts on the six-track grid: centred on grid lines 3 and 5. */
const JOIN_START = ['col-start-2', 'col-start-4'] as const;

function Bracket({ total }: { total: string }) {
  return (
    <div className="relative col-span-6 h-3 border-x border-t border-foreground/40">
      <span
        data-funnel-total=""
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-muted px-2 text-body font-semibold whitespace-nowrap text-foreground"
      >
        {total}
      </span>
    </div>
  );
}

function Join({
  label,
  value,
  index,
  noteClassName,
  arrowClassName,
}: FunnelProps['ratios'][number] & {
  index: number;
  noteClassName?: string;
  arrowClassName?: string;
}) {
  const order = { '--i': index * 2 + 1 } as CSSProperties;
  return (
    <div className={cn(JOIN_START[index], 'col-span-2 row-start-2 mt-4 flex flex-col items-center')}>
      <StickyNote tone="neutral" label={label} value={value} className={noteClassName} style={order} />
      <BoardArrow direction="right" className={cn('mt-2 w-16', arrowClassName)} style={order} />
    </div>
  );
}

function Stage({
  slug,
  label,
  index,
  bandClassName,
}: FunnelProps['stages'][number] & {
  index: number;
  bandClassName?: string;
}) {
  return (
    <div className="col-span-2 row-start-3 mt-3 flex min-w-0 flex-col">
      <span className="mb-2 w-fit self-center rounded-full bg-foreground px-2 py-1 text-caption font-medium text-background sm:px-3">
        {label}
      </span>
      <div
        data-funnel-band=""
        data-stage={slug}
        className={cn('h-20 bg-card sm:h-28', bandClassName)}
        style={{ '--i': index * 2 } as CSSProperties}
      />
    </div>
  );
}

/**
 * The drawn funnel: three stages on a six-track grid, each spanning two tracks, so the joins fall on grid lines 3
 * and 5. A bracket over the whole carries the total ratio; a ratio note with a drawn arrow sits on each join; each
 * stage is a pill over an empty band that narrows from the last. Bands and notes share one `--i` sequence: band 0,
 * note and arrow 1, band 2, note and arrow 3, band 4. A server part with plain props.
 */
export function Funnel({ stages, ratios, total, noteClassName, arrowClassName, bandClassName }: FunnelProps) {
  return (
    <div data-funnel="" className="mt-4 grid grid-cols-6">
      <Bracket total={total} />
      {ratios.map((ratio, index) => (
        <Join
          key={ratio.label}
          {...ratio}
          index={index}
          noteClassName={noteClassName}
          arrowClassName={arrowClassName}
        />
      ))}
      {stages.map((stage, index) => (
        <Stage key={stage.slug} {...stage} index={index} bandClassName={bandClassName} />
      ))}
    </div>
  );
}
