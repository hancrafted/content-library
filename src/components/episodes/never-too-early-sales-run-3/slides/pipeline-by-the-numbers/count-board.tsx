import type { TargetProps } from '@/lib/context-link.pure';
import { cn } from '@/lib/utils';
import { useId, type ReactNode } from 'react';
import styles from './pipeline-by-the-numbers.module.css';

interface CountNote {
  name: string;
  state?: string;
  /** Written amount of the signed deal; marks the note as revenue. */
  amount?: string;
}

interface CountStage {
  id: 'lead' | 'opportunity' | 'deal';
  label: string;
  duration: string;
  notes: readonly CountNote[];
  /** The badge between this lane and the next, e.g. `3:1`. */
  ratioToNext?: string;
  /** Context markers beside the lane's pill. */
  markers?: ReactNode;
  /** A Context marker under the badge to the next lane. */
  ratioMarker?: ReactNode;
}

interface CountBoardProps {
  stages: readonly CountStage[];
  total: { ratio: string; caption: ReactNode };
  /** Under the one deal: the opportunities that did not close. */
  others: string;
  targets: { opportunity: TargetProps; ratioOppDeal: TargetProps };
}

/** Lane widths in board order: Lead half, Opportunity a third, Deal a sixth, once the board is wide enough. */
const BASIS: Record<CountStage['id'], string> = {
  lead: '@4xl:basis-1/2',
  opportunity: '@4xl:basis-1/3',
  deal: '@4xl:basis-1/6',
};

/** Paper tilt cycles note by note, so the board reads as hand-pinned. */
const TILT = ['-rotate-2', 'rotate-1', 'rotate-2', '-rotate-1', 'rotate-1', '-rotate-2', 'rotate-1', '-rotate-1'];

/** Pill over a lane: dark on the board's paper. */
const PILL = 'rounded-full bg-foreground px-4 py-1 text-caption font-semibold text-background';

/**
 * The count board: 27 named notes in Lead, nine in Opportunity and one revenue note in Deal, under the primary 27:1
 * pill and its bracket. Lanes sit side by side once the board is wide enough and stack below that; pointing at a lane
 * dims the others. A server part with plain props.
 */
export function CountBoard({ stages, total, others, targets }: CountBoardProps) {
  return (
    <div className="@container flex flex-col gap-6">
      <TotalBracket ratio={total.ratio} caption={total.caption} />
      <BoardSurface>
        <div className="focus-group focus-group--dim-others relative flex flex-col items-stretch gap-3 @4xl:flex-row">
          {stages.map((stage) => (
            <div key={stage.id} className="contents">
              <Lane stage={stage} target={stage.id === 'opportunity' ? targets.opportunity : undefined}>
                <LaneNotes stage={stage} others={others} />
              </Lane>
              {stage.ratioToNext === undefined ? null : (
                <RatioBadge
                  marker={stage.ratioMarker}
                  ratio={stage.ratioToNext}
                  target={stage.id === 'opportunity' ? targets.ratioOppDeal : undefined}
                />
              )}
            </div>
          ))}
        </div>
      </BoardSurface>
    </div>
  );
}

/** The one thing to look at: the 27:1 pill over a primary bracket spanning the whole board. */
function TotalBracket({ ratio, caption }: CountBoardProps['total']) {
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="rounded-full bg-primary px-6 py-2 text-subheading leading-none font-semibold text-primary-foreground tabular-nums">
        {ratio}
      </p>
      <p className="text-center text-caption text-muted-foreground">{caption}</p>
      <div className="w-full">
        <svg viewBox="0 0 1200 24" preserveAspectRatio="none" className="h-6 w-full" aria-hidden="true">
          <path
            d="M2 22 V4 H1198 V22"
            className="fill-none stroke-primary"
            strokeWidth="4"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
}

/** The board: a muted, inset surface with a dot pattern. */
function BoardSurface({ children }: { children: ReactNode }) {
  const dots = `count-dots-${useId()}`;
  return (
    <div className="relative rounded-xl border border-border bg-muted p-4 shadow-inner @4xl:p-6">
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

/** The ratio badge and arrow between two lanes; the arrow turns down when the lanes stack. */
function RatioBadge({ ratio, target, marker }: { ratio: string; target?: TargetProps; marker?: ReactNode }) {
  return (
    <div {...target} className="flex shrink-0 items-center justify-center gap-1 @4xl:flex-col">
      <span className="flex size-14 items-center justify-center rounded-full bg-foreground text-body font-semibold text-background tabular-nums shadow-md">
        {ratio}
      </span>
      <svg viewBox="0 0 40 20" className="w-10 rotate-90 @4xl:rotate-0" aria-hidden="true">
        <path d="M2 10 H34 M26 3 L36 10 L26 17" className="fill-none stroke-foreground" strokeWidth="3" />
      </svg>
      {marker}
    </div>
  );
}

/** One lane: its pill and duration, then its notes. Deal's duration sits under its pill, as its lane is narrow. */
function Lane({ stage, target, children }: { stage: CountStage; target?: TargetProps; children: ReactNode }) {
  const duration = <span className="font-mono text-caption text-muted-foreground">{stage.duration}</span>;
  return (
    <div
      {...target}
      className={cn('focus-group__item flex min-w-0 flex-col gap-3 rounded-lg bg-foreground/5 p-4', BASIS[stage.id])}
    >
      <div
        className={cn(
          'flex gap-2',
          stage.id === 'deal' ? 'flex-col items-start' : 'flex-wrap items-center justify-between',
        )}
      >
        <span className="inline-flex items-center gap-1">
          <span className={PILL}>{stage.label}</span>
          {stage.markers}
        </span>
        {duration}
      </div>
      {children}
    </div>
  );
}

function LaneNotes({ stage, others }: { stage: CountStage; others: string }) {
  if (stage.id === 'lead') return <LeadNotes notes={stage.notes} />;
  if (stage.id === 'opportunity') return <OpportunityNotes notes={stage.notes} />;
  return <DealNotes notes={stage.notes} others={others} />;
}

/** The 27 names. */
function LeadNotes({ notes }: { notes: readonly CountNote[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-2 text-caption font-medium text-foreground @4xl:grid-cols-5">
      {notes.map((note, index) => (
        <p
          key={note.name}
          className={cn(
            'min-w-0 rounded-sm bg-card px-2 py-3 text-center break-words shadow-md',
            TILT[index % TILT.length],
          )}
        >
          {note.name}
        </p>
      ))}
    </div>
  );
}

/** The nine that became opportunities. */
function OpportunityNotes({ notes }: { notes: readonly CountNote[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(5rem,1fr))] gap-2 text-caption text-foreground @4xl:grid-cols-3">
      {notes.map((note, index) => (
        <p
          key={note.name}
          className={cn('min-w-0 rounded-sm bg-card px-2 py-3 break-words shadow-md', TILT[(index + 1) % TILT.length])}
        >
          <b className="font-semibold">{note.name}</b>
          <br />
          {note.state}
        </p>
      ))}
    </div>
  );
}

/** The one signed deal, in the revenue tint, and the rest still talking or lost. */
function DealNotes({ notes, others }: { notes: readonly CountNote[]; others: string }) {
  return (
    <div className="my-auto flex flex-col gap-3">
      {notes.map((note) => (
        <div
          key={note.name}
          className={cn(
            'max-w-48 min-w-0 -rotate-3 scale-110 self-center rounded-sm p-4 text-foreground shadow-xl @4xl:max-w-none @4xl:self-stretch',
            styles.revenue,
          )}
        >
          <p className="text-caption font-semibold">{note.name}</p>
          <p className="text-body font-semibold tabular-nums">{note.amount}</p>
          <p className="text-caption">{note.state}</p>
        </div>
      ))}
      <p className="text-center text-caption text-muted-foreground">{others}</p>
    </div>
  );
}
