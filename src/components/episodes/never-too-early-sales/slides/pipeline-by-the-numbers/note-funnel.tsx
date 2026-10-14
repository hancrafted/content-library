import { BoardNote } from '@/components/slide-shared/board-note';
import { cn } from '@/lib/utils';
import { Fragment, type CSSProperties } from 'react';
import styles from './pipeline-by-the-numbers.module.css';

export interface FunnelStage {
  /** The header chip, carrying the count for screen readers: "Leads · 27". */
  readonly label: string;
  readonly count: number;
  /** What one note of this stage reads; shown on the single full note of a one-note stage. */
  readonly countLabel: string;
}

export interface NoteFunnelProps {
  readonly stages: readonly FunnelStage[];
  /** One ratio between each pair of neighbouring stages. */
  readonly ratios: readonly string[];
  readonly total: string;
  readonly totalTarget?: string;
  readonly 'data-target'?: string;
}

/** Entrance steps (× 300ms): stage, ratio, stage, ratio, stage; the bracket after the month strip. */
const BRACKET_STEP = 10;
const TOTAL_STEP = 11.5;

function vars(values: Readonly<Record<string, number>>): CSSProperties {
  return values as CSSProperties;
}

/** Many notes as small marks: leads nine to a row, opportunities three. */
function Marks({ count, step }: { count: number; step: number }) {
  const wide = count > 9;
  return (
    <div aria-hidden="true" data-marks className={cn('grid w-fit', wide ? 'grid-cols-9 gap-1' : 'grid-cols-3 gap-2')}>
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          style={vars({ '--step': step, '--row': Math.floor(index / (wide ? 9 : 3)) })}
          className={cn(styles.place, 'rounded-xs border border-border bg-card', wide ? 'size-3' : 'size-6')}
        />
      ))}
    </div>
  );
}

function Stage({ stage, step }: { stage: FunnelStage; step: number }) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-3">
      <span className="rounded-full border border-border bg-card px-3 py-1 text-caption font-medium text-foreground">
        {stage.label}
      </span>
      {stage.count === 1 ? (
        <span style={vars({ '--step': step })} className={cn(styles.place, 'block')}>
          <BoardNote className="w-fit font-semibold">{stage.countLabel}</BoardNote>
        </span>
      ) : (
        <Marks count={stage.count} step={step} />
      )}
    </div>
  );
}

function Ratio({ ratio, step }: { ratio: string; step: number }) {
  return (
    <span
      style={vars({ '--step': step })}
      className={cn(
        styles.fade,
        'flex items-center gap-2 pl-6 text-body font-semibold text-foreground tabular-nums @2xl:pl-0',
      )}
    >
      {ratio}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className="size-5 shrink-0 rotate-90 stroke-current text-muted-foreground @2xl:rotate-0"
      >
        <path d="M4 12h15m-5-5 5 5-5 5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/** The 27:1 total on a bracket over every stage; under 672px a primary spine down the stack carries it. */
function Total({ total, target }: { total: string; target?: string }) {
  return (
    <div data-target={target} className="mb-4 flex flex-col gap-1">
      <p
        style={vars({ '--step': TOTAL_STEP })}
        className={cn(styles.fade, 'text-subheading font-semibold text-primary tabular-nums @2xl:text-center')}
      >
        {total}
      </p>
      <svg
        aria-hidden="true"
        viewBox="0 0 100 16"
        preserveAspectRatio="none"
        fill="none"
        className="hidden h-4 w-full stroke-current text-primary @2xl:block"
      >
        <path
          d="M1 15V2h98v13"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          style={vars({ '--step': BRACKET_STEP })}
          className={styles.draw}
        />
      </svg>
    </div>
  );
}

/**
 * Real counts of notes for one deal, stage by stage, with the ratio between
 * each pair and the total over all. Server only, plain props.
 */
export function NoteFunnel({ stages, ratios, total, totalTarget, ...rest }: NoteFunnelProps) {
  if (ratios.length !== stages.length - 1) {
    throw new Error(`NoteFunnel: ${stages.length} stages need ${stages.length - 1} ratios, got ${ratios.length}.`);
  }
  return (
    <div data-target={rest['data-target']} className="border-l-2 border-primary pl-4 @2xl:border-l-0 @2xl:pl-0">
      <Total total={total} target={totalTarget} />
      <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] @2xl:items-center">
        {stages.map((stage, index) => (
          <Fragment key={stage.label}>
            {index > 0 && <Ratio ratio={ratios[index - 1]} step={index * 2 - 1} />}
            <Stage stage={stage} step={index * 2} />
          </Fragment>
        ))}
      </div>
    </div>
  );
}
