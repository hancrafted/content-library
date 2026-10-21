import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { stripTotals, type StripGroup, type StripKind, type StripSegment } from './attention-strip.pure';

/** The strip's words; each bracket's note marker comes with its line. */
export interface StripLabels {
  readonly heading: ReactNode;
  readonly illustrative: string;
  readonly label: string;
  readonly groups: Readonly<Record<StripGroup, { readonly head: string; readonly line: ReactNode }>>;
  readonly spike: { readonly head: string; readonly line: string };
}

/** A segment's fill: the category's meaning colour, as the cornerstone draws it in the Simple view. */
const FILL: Readonly<Record<StripKind, string>> = {
  start: 'bg-machine',
  memory: 'bg-machine/45',
  you: 'bg-human',
  ai: 'bg-ai',
  tool: 'bg-(--success)',
};

const GROUPS: readonly StripGroup[] = ['start', 'middle', 'newest'];
const BRACKET: Readonly<Record<StripGroup, string>> = {
  start: 'border-primary',
  middle: 'border-muted-foreground',
  newest: 'border-primary',
};

const percent = (units: number) => `${units}%`;

function Brackets({ totals, labels }: { totals: Readonly<Record<StripGroup, number>>; labels: StripLabels }) {
  return (
    <div className="flex text-caption">
      {GROUPS.map((group) => (
        <span
          key={group}
          style={{ width: percent(totals[group]) }}
          className={cn('flex min-w-0 flex-col border-l-2 pl-2', BRACKET[group])}
        >
          <b className="font-semibold">{labels.groups[group].head}</b>
          <span className="text-muted-foreground">{labels.groups[group].line}</span>
        </span>
      ))}
    </div>
  );
}

function Segment({ segment }: { segment: StripSegment }) {
  const dimmed = segment.group === 'middle' && !segment.spike;
  return (
    <span
      data-strip-group={segment.group}
      data-units={segment.units}
      data-strip-spike={segment.spike ? '' : undefined}
      style={{ width: percent(segment.units) }}
      className={cn(
        'focus-group__item block h-full border-r-2 border-card',
        FILL[segment.kind],
        dimmed && 'opacity-40',
        segment.spike && 'relative z-10 ring-2 ring-primary',
      )}
    />
  );
}

function StripHead({ labels }: { labels: StripLabels }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="text-body font-semibold">{labels.heading}</span>
      <span className="rounded-full border border-dashed border-border px-2 py-0.5 text-caption text-muted-foreground">
        {labels.illustrative}
      </span>
    </div>
  );
}

/** The repeated detail's label under the strip, starting where its spike starts (from `md`; a phone keeps it left). */
function SpikeLabel({ beforeSpike, labels }: { beforeSpike: number; labels: StripLabels }) {
  return (
    <div className="flex">
      <span aria-hidden="true" className="hidden shrink-0 md:block" style={{ width: percent(beforeSpike) }} />
      <span className="flex items-start gap-2 text-caption">
        <svg viewBox="0 0 12 12" className="mt-1 size-3 shrink-0" aria-hidden="true">
          <path
            d="M6 11 V 1 M2 5 L6 1 L10 5"
            className="fill-none stroke-primary"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>
          <b className="font-semibold">{labels.spike.head}</b>{' '}
          <span className="text-muted-foreground">{labels.spike.line}</span>
        </span>
      </span>
    </div>
  );
}

/**
 * A hundred units of attention as one horizontal strip: bracketed start, middle and newest above it, one segment per
 * message in its category colour, the middle dimmed except the repeated detail's spike, labelled below. Pointing at
 * one segment dims the rest.
 */
export function AttentionStrip({ segments, labels }: { segments: readonly StripSegment[]; labels: StripLabels }) {
  const totals = stripTotals(segments);
  return (
    <div data-target="strip" className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6 shadow-md">
      <StripHead labels={labels} />
      <div className="flex flex-col gap-2">
        <Brackets totals={totals} labels={labels} />
        <div
          role="img"
          aria-label={labels.label}
          className="focus-group focus-group--dim-others flex h-14 w-full overflow-hidden rounded-lg bg-muted"
        >
          {segments.map((segment) => (
            <Segment key={segment.id} segment={segment} />
          ))}
        </div>
        <SpikeLabel beforeSpike={totals.beforeSpike} labels={labels} />
      </div>
    </div>
  );
}
