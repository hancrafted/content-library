import type { TargetProps } from '@/lib/context-link.pure';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { NodePopover, type NodeCopy } from './node-popover.client';
import type { Stage } from './venue-pipeline.pure';

/** One stage as the Scene draws it: its model, header copy and the body of jobs inside it. */
export interface StageView {
  stage: Stage;
  name: string;
  /** The move's words, whole; the part bolds the first letter when the pipeline's `acronym` is on. */
  move: string | undefined;
  /** Opens from the stage name; without it the name is plain text. */
  popover?: NodeCopy;
  /** Beside the stage name, e.g. its Context marker. */
  aside?: ReactNode;
  jobsLabel: string;
  body: ReactNode;
  target?: TargetProps;
}

/**
 * The venue pipeline: one ordered list of stages, each a column of jobs, left to right where the Scene is wide and top
 * to bottom where it is narrow; each connector turns with it. The Requirements body is the one focal point. Pointing at
 * a stage dims the others.
 */
export function VenuePipeline({
  label,
  stages,
  acronym,
}: {
  label: string;
  stages: readonly StageView[];
  /** Bold the first letter of each move, so the moves read as the acronym. */
  acronym: boolean;
}) {
  return (
    <ol
      aria-label={label}
      className="focus-group focus-group--dim-others flex flex-col gap-6 @4xl:flex-row @4xl:items-stretch @4xl:gap-5"
    >
      {stages.map((view, index) => (
        <StageColumn key={view.stage.id} view={view} first={index === 0} acronym={acronym} />
      ))}
    </ol>
  );
}

function StageColumn({ view, first, acronym }: { view: StageView; first: boolean; acronym: boolean }) {
  const { stage, target } = view;
  return (
    <li {...target} className="focus-group__item relative flex min-w-0 flex-col gap-2 @4xl:grow @4xl:basis-0">
      {!first && <Connector fan={stage.fan} />}
      <StageHeader view={view} acronym={acronym} />
      <JobsCard view={view} />
    </li>
  );
}

function JobsCard({ view }: { view: StageView }) {
  const focal = view.stage.id === 'requirements';
  return (
    <ol
      aria-label={view.jobsLabel}
      className={cn(
        'flex flex-1 flex-col justify-center gap-2 rounded-2xl bg-card p-3',
        focal ? 'border-2 border-primary' : 'card-hover card-hover--outline border border-border',
      )}
    >
      {view.body}
    </ol>
  );
}

const NAME_BUTTON =
  'cursor-pointer rounded-sm text-left outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring';

/**
 * The stage's name, opening its popover where it has one, over the move pill: the move's first letter semibold when
 * the acronym is on. Across a wide row every pill keeps two lines' height, so a move that wraps lines up with the rest.
 */
function StageHeader({ view, acronym }: { view: StageView; acronym: boolean }) {
  const { stage, name, move, popover, aside } = view;
  return (
    <div className={'flex flex-col items-start gap-1 @4xl:h-24'}>
      <p className="flex items-center gap-1 text-body font-semibold">
        {popover ? (
          <NodePopover copy={popover} className={NAME_BUTTON}>
            {name}
          </NodePopover>
        ) : (
          name
        )}
        {aside}
      </p>
      <MovePill move={move} pill={stage.move !== undefined} acronym={acronym} />
    </div>
  );
}

interface MovePillProps {
  move: string | undefined;
  /** A BRIEF move sits in a pill; the recommendation's line does not. */
  pill: boolean;
  acronym: boolean;
}

function MovePill({ move, pill, acronym }: MovePillProps) {
  const words = acronym && pill && move ? <Initial move={move} /> : move;
  return (
    <span
      className={cn(
        'text-caption text-muted-foreground',
        pill && 'rounded-2xl border border-border bg-card px-2.5 py-0.5 @4xl:flex @4xl:items-center',
        pill && '@4xl:min-h-14',
      )}
    >
      <span>{words}</span>
    </span>
  );
}

/** A move with its first letter semibold. */
function Initial({ move }: { move: string }) {
  return (
    <>
      <b className="font-semibold text-foreground">{move.slice(0, 1)}</b>
      {move.slice(1)}
    </>
  );
}

const STRAIGHT = (
  <svg viewBox="0 0 24 10" className="h-2.5 w-6" aria-hidden="true">
    <path d="M0 5h20" className="fill-none stroke-foreground" strokeWidth="1.5" />
    <path d="M18 1.5 23 5l-5 3.5z" className="fill-foreground" />
  </svg>
);

const FAN_OUT = (
  <svg viewBox="0 0 24 160" className="h-40 w-6" aria-hidden="true">
    <path
      d="M0 80 C 12 80, 10 20, 20 20 M0 80h20 M0 80 C 12 80, 10 140, 20 140"
      className="fill-none stroke-foreground"
      strokeWidth="1.5"
    />
    <path d="M18 17 23 20l-5 3z M18 77 23 80l-5 3z M18 137 23 140l-5 3z" className="fill-foreground" />
  </svg>
);

const FAN_IN = (
  <svg viewBox="0 0 24 160" className="h-40 w-6" aria-hidden="true">
    <path
      d="M0 20 C 12 20, 10 80, 20 80 M0 80h20 M0 140 C 12 140, 10 80, 20 80"
      className="fill-none stroke-foreground"
      strokeWidth="1.5"
    />
    <path d="M18 77 23 80l-5 3z" className="fill-foreground" />
  </svg>
);

/**
 * The hairline into a stage: straight, fanning out to three jobs, or fanning three back in. It sits in the gap before
 * its stage, beside the body where the row runs across. Where the stages stack it sits above, a straight arrow turned a
 * quarter, since the jobs then stack too and a fan wider than the gap would leave the Foreground.
 */
function Connector({ fan }: { fan?: Stage['fan'] }) {
  const across = fan === 'out' ? FAN_OUT : fan === 'in' ? FAN_IN : STRAIGHT;
  return (
    <div
      aria-hidden="true"
      className="absolute bottom-full left-8 flex h-6 w-6 items-center justify-center @4xl:top-24 @4xl:right-full @4xl:bottom-0 @4xl:left-auto @4xl:mt-2 @4xl:h-auto @4xl:w-5"
    >
      <div className="rotate-90 @4xl:hidden">{STRAIGHT}</div>
      <div className="hidden @4xl:block">{across}</div>
    </div>
  );
}
