import type { TargetProps } from '@/lib/context-link.pure';
import { cn } from '@/lib/utils';
import { useId, type CSSProperties, type ReactNode } from 'react';
import styles from './what-is-a-sales-pipeline.module.css';

interface BoardNote {
  name: string;
  state?: string;
  /** Written amount of a signed deal; marks the note as revenue. */
  amount?: string;
}

interface Stage {
  id: 'lead' | 'opportunity' | 'deal';
  label: string;
  /** Twelfths of the board's width: the lanes narrow like a funnel. */
  span: 5 | 4 | 3;
  notes: readonly BoardNote[];
}

interface Conversion {
  label: string;
  ratio: string;
  caption: ReactNode;
  target: TargetProps;
}

interface PipelineBoardProps {
  stages: readonly Stage[];
  conversion: Conversion;
  funnel: { label: string; caption: ReactNode };
  cycle: { caption: ReactNode; target: TargetProps };
}

/** A lane's width on the 12-column board, once the board is wide enough; stacked below that. */
const SPAN: Record<Stage['span'], string> = {
  5: '@2xl:col-span-5',
  4: '@2xl:col-span-4',
  3: '@2xl:col-span-3',
};

/** Paper tilt alternates note by note, so the board reads as hand-pinned. */
const TILT = ['-rotate-1', 'rotate-1', 'rotate-1', '-rotate-2', '-rotate-1', 'rotate-2'];

const PILL = 'rounded-full bg-foreground px-4 py-1 text-caption font-semibold text-background';

/**
 * One pipeline board read three ways: the lanes are the funnel, the primary bracket over Lead and Opportunity is the
 * conversion rate, and the arrow under the board is the sales cycle. A server part with plain props.
 */
export function PipelineBoard({ stages, conversion, funnel, cycle }: PipelineBoardProps) {
  // Placement order across the board: each lane's pill, then its notes, lane by lane.
  const firstOf = stages.map((_, index) =>
    stages.slice(0, index).reduce((count, stage) => count + 1 + stage.notes.length, 0),
  );
  return (
    <div className="@container mt-8 flex flex-col gap-2">
      <Terms conversion={conversion} funnel={funnel} />
      <BoardSurface>
        <div className="relative grid grid-cols-1 gap-4 @2xl:grid-cols-12 @2xl:gap-6">
          {stages.map((stage, lane) => (
            <Lane key={stage.id} stage={stage} first={firstOf[lane] ?? 0} />
          ))}
        </div>
      </BoardSurface>
      <CycleArrow caption={cycle.caption} target={cycle.target} />
    </div>
  );
}

/** The conversion bracket over Lead and Opportunity, and the funnel's annotation over Deal. */
function Terms({ conversion, funnel }: Pick<PipelineBoardProps, 'conversion' | 'funnel'>) {
  return (
    <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-12 @2xl:items-end @2xl:gap-6">
      <div {...conversion.target} className="flex flex-col @2xl:col-span-9 @2xl:items-center">
        <p className="text-subheading leading-none font-semibold text-primary">
          {conversion.label} <span className="tabular-nums">{conversion.ratio}</span>
        </p>
        <p className="mt-1 text-caption text-muted-foreground">{conversion.caption}</p>
        <div className={cn('mt-2 hidden w-full @2xl:block', styles.bracket)}>
          <svg viewBox="0 0 900 40" preserveAspectRatio="none" className="h-10 w-full" aria-hidden="true">
            <path
              d="M200 38 V12 H700 V38"
              className="fill-none stroke-primary"
              strokeWidth="4"
              vectorEffect="non-scaling-stroke"
            />
            <path d="M450 12 V2" className="stroke-primary" strokeWidth="4" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col gap-1 @2xl:col-span-3 @2xl:pb-3">
        <p className="text-body font-semibold text-foreground">{funnel.label}</p>
        <p className="text-caption text-muted-foreground">{funnel.caption}</p>
      </div>
    </div>
  );
}

/** The board: a muted, inset surface with a dot pattern. */
function BoardSurface({ children }: { children: ReactNode }) {
  const dots = `pipeline-dots-${useId()}`;
  return (
    <div className="relative rounded-xl border border-border bg-muted p-4 shadow-inner @2xl:p-6">
      <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden="true">
        <defs>
          <pattern id={dots} width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" className="fill-foreground/10" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${dots})`} />
      </svg>
      {children}
    </div>
  );
}

/** One lane: its pill and count, then its notes; `first` is the lane's place in the placement order. */
function Lane({ stage, first }: { stage: Stage; first: number }) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-4 rounded-lg bg-foreground/5 p-4', SPAN[stage.span])}>
      <div className={cn('flex items-center justify-between', styles.place)} style={{ '--i': first } as CSSProperties}>
        <span className={PILL}>{stage.label}</span>
        <span className="font-mono text-caption text-muted-foreground">{stage.notes.length}</span>
      </div>
      <div className={cn('grid gap-3', stage.id === 'lead' ? 'grid-cols-2' : 'grid-cols-1')}>
        {stage.notes.map((note, index) => (
          <Note key={note.name} note={note} tilt={TILT[index % TILT.length]} order={first + 1 + index} />
        ))}
      </div>
    </div>
  );
}

/** A note on the board: neutral paper, or the revenue tint for the signed deal. */
function Note({ note, tilt, order }: { note: BoardNote; tilt?: string; order: number }) {
  const revenue = note.amount !== undefined;
  return (
    <div
      className={cn(
        'min-w-0 rounded-sm p-3 text-caption break-words text-foreground',
        revenue ? cn('-rotate-2 shadow-lg', styles.revenue) : cn('bg-card shadow-md', tilt),
        styles.place,
      )}
      style={{ '--i': order } as CSSProperties}
    >
      {revenue ? <DealNote note={note} /> : <PlainNote note={note} />}
    </div>
  );
}

function PlainNote({ note }: { note: BoardNote }) {
  if (note.state === undefined) return <p className="font-medium">{note.name}</p>;
  return (
    <p>
      <b>{note.name}</b>
      <br />
      {note.state}
    </p>
  );
}

function DealNote({ note }: { note: BoardNote }) {
  return (
    <>
      <p className="font-semibold">{note.name}</p>
      <p className="text-body leading-tight font-semibold tabular-nums">{note.amount}</p>
      <p>{note.state}</p>
    </>
  );
}

/** The way across the board: an arrow from first contact to the money, drawn under the lanes. */
function CycleArrow({ caption, target }: { caption: ReactNode; target: TargetProps }) {
  return (
    <div {...target} className="flex flex-col gap-2">
      <div className={styles.arrow}>
        <svg viewBox="0 0 1200 28" preserveAspectRatio="none" className="h-7 w-full" aria-hidden="true">
          <path
            d="M4 4 V24 M4 14 H1190"
            className="fill-none stroke-foreground"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M1178 4 L1196 14 L1178 24"
            className="fill-none stroke-foreground"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <p className="text-center text-body text-balance text-foreground">{caption}</p>
    </div>
  );
}
