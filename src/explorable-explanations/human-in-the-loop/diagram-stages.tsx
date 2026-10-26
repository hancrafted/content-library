import { cn } from '@/shared/lib/utils';
import { AiJob, ChatJobs, DeliverableJob, FocalJob, PieceJobs, popoverOf, type JobViewProps } from './diagram-jobs';
import { connectorInto, fanGeometry, type Connector as ConnectorKind } from './diagram-layout.pure';
import { jobRole } from './diagram-model.pure';
import type { DiagramSlots, StageSlot, UiWords } from './human-in-the-loop.types';
import { MoveCircles } from './move-circles.client';
import { NodePopover } from './node-popover.client';
import { TryButton } from './try-button.client';
import type { Job, Stage, Workflow } from './workflow.types';

/**
 * The Workflow as one ordered list of stages, each a column of jobs, left to right where the Scene is wide enough and
 * top to bottom where it is narrow; in between the row keeps a readable column width and scrolls sideways. Each
 * connector turns with it. Pointing at a stage dims the others; the whole column opens its modal.
 */
export function DiagramStages(props: {
  workflow: Workflow;
  slots?: DiagramSlots;
  words: UiWords;
  readonly: boolean;
  onOpenStage: (stageId: string) => void;
}) {
  const { workflow, slots = {} } = props;
  const ctx: Context = { ...props, slots };
  return (
    <div className="@container">
      <div data-scroller="" className="@2xl:overflow-x-auto @2xl:overscroll-x-contain @2xl:pb-3">
        <ol
          data-part="diagram"
          aria-label={slots.label ?? workflow.title}
          className="focus-group focus-group--dim-others flex flex-col gap-6 @2xl:flex-row @2xl:items-stretch @2xl:gap-6"
        >
          {workflow.stages.map((stage, index) => (
            <StageColumn key={stage.id} ctx={ctx} stage={stage} previous={workflow.stages[index - 1]} />
          ))}
        </ol>
      </div>
    </div>
  );
}

/** What every stage column reads: the Workflow, the Slide's slots, the words and the "Try it" wiring. */
interface Context {
  workflow: Workflow;
  slots: DiagramSlots;
  words: UiWords;
  readonly: boolean;
  onOpenStage: (stageId: string) => void;
}

/** Whether a stage runs parallel chats: its jobs then stand one fan pitch apart, so each branch meets its chat. */
const fansOut = (stage: Stage): boolean => stage.jobs.some((job) => (job.fanOut ?? 1) > 1);

function StageColumn({ ctx, stage, previous }: { ctx: Context; stage: Stage; previous: Stage | undefined }) {
  const slot = ctx.slots.stages?.[stage.id] ?? {};
  return (
    <li
      {...slot.target}
      className="group/column focus-group__item relative flex min-w-0 flex-col gap-3 @2xl:flex-[1_0_11rem]"
    >
      {previous && <ArrowDown />}
      {!ctx.readonly && (
        <TryButton
          label={ctx.words.tryIt}
          stage={stage.name}
          forStage={ctx.words.tryFor.replace('{stage}', stage.name)}
          onOpen={() => ctx.onOpenStage(stage.id)}
        />
      )}
      <StageHeader stage={stage} slot={slot} words={ctx.words} moves={ctx.slots.initials === true} />
      <StageBody ctx={ctx} stage={stage} slot={slot} into={previous && connectorInto(previous, stage)} />
    </li>
  );
}

/**
 * A stage's lane of jobs, with the connector from the stage before. Where the column opens a modal the lane keeps room
 * at its foot for the rising "Practice it" button, and answers the pointer.
 */
function StageBody(props: { ctx: Context; stage: Stage; slot: StageSlot; into: ConnectorKind | undefined }) {
  const { ctx, stage, slot, into } = props;
  const opens = !ctx.readonly;
  return (
    <div
      className={cn(
        'relative flex flex-1 flex-col rounded-2xl border border-transparent bg-muted p-3 transition-[border-color,box-shadow] duration-200',
        opens && 'pb-14 group-hover/column:border-border group-hover/column:shadow-sm',
      )}
    >
      {into && <Connector kind={into} opens={opens} />}
      <ol
        aria-label={jobsLabelOf(stage, slot, ctx.slots)}
        className={cn('flex flex-1 flex-col justify-center', fansOut(stage) ? 'gap-3' : 'gap-2')}
      >
        {stage.jobs.map((job) => (
          <StageJob key={job.id} ctx={ctx} stage={stage} job={job} gateLabel={gateLabelOf(stage, slot, ctx.words)} />
        ))}
      </ol>
    </div>
  );
}

/** The label of a stage's gate on a card: the Slide's word, else the visual's gate word with the number. */
const gateLabelOf = (stage: Stage, slot: StageSlot, words: UiWords): string | undefined =>
  stage.gate === undefined ? undefined : (slot.gateLabel ?? words.gate.replace('{n}', String(stage.gate)));

/** The accessible name of a stage's list of jobs: the stage's own, else the Slide's template, else the stage name. */
const jobsLabelOf = (stage: Stage, slot: StageSlot, slots: DiagramSlots): string =>
  slot.jobsLabel ?? slots.jobsLabel?.replace('{stage}', stage.name) ?? stage.name;

interface StageJobProps {
  ctx: Context;
  stage: Stage;
  job: Job;
  gateLabel?: string;
}

function StageJob({ ctx, stage, job, gateLabel }: StageJobProps) {
  const slot = ctx.slots.jobs?.[job.id] ?? {};
  const words = { checked: ctx.slots.checked ?? '' };
  const props = { job, slot, stageName: stage.name, gateLabel, words, card: stage.card };
  return <JobCard role={jobRole(ctx.workflow, job)} {...props} />;
}

function JobCard({ role, ...props }: JobViewProps & { role: ReturnType<typeof jobRole> }) {
  if (role === 'pieces') return <PieceJobs {...props} />;
  if (role === 'chats') return <ChatJobs {...props} />;
  if (role === 'focal') return <FocalJob {...props} />;
  if (role === 'deliverable') return <DeliverableJob {...props} />;
  return <AiJob {...props} />;
}

const NAME_BUTTON =
  'relative z-10 cursor-pointer rounded-sm text-left outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring';

/**
 * The stage's name, opening its popover where the Slide gives one, over its BRIEF letters as circled capitals (each
 * with its tooltip). Across a wide row every header keeps one height, so a stage without letters lines up with the
 * rest; without letters it is one line, close to its column.
 */
function StageHeader(props: { stage: Stage; slot: StageSlot; words: UiWords; moves: boolean }) {
  const { stage, slot, words, moves } = props;
  const popover = popoverOf(slot.popover, stage.name);
  return (
    <div className={cn('flex flex-col items-start gap-1.5 px-1', moves ? '@2xl:h-14' : '@2xl:h-6')}>
      <p className="flex items-center gap-1 text-body font-semibold">
        {popover ? (
          <NodePopover copy={popover} className={NAME_BUTTON}>
            {stage.name}
          </NodePopover>
        ) : (
          stage.name
        )}
        {slot.aside && <span className="relative z-10">{slot.aside}</span>}
      </p>
      {moves && stage.moves.length > 0 && (
        <div className="relative z-10">
          <MoveCircles moves={stage.moves} label={words.moveLabel} />
        </div>
      )}
    </div>
  );
}

const STRAIGHT = (
  <svg viewBox="0 0 24 10" className="h-2.5 w-6" aria-hidden="true">
    <path d="M0 5h20" className="fill-none stroke-muted-foreground" strokeWidth="1.5" />
    <path d="M18 1.5 23 5l-5 3.5z" className="fill-muted-foreground" />
  </svg>
);

function Fan({ direction, branches }: { direction: 'out' | 'in'; branches: number }) {
  const { height, lines, heads } = fanGeometry(direction, branches);
  return (
    <svg viewBox={`0 0 24 ${height}`} data-fan={direction} className="w-6" style={{ height }} aria-hidden="true">
      <path d={lines} className="fill-none stroke-muted-foreground" strokeWidth="1.5" />
      <path d={heads} className="fill-muted-foreground" />
    </svg>
  );
}

/**
 * The hairline into a stage where the row runs across: straight, fanning out to its chats, or fanning them back in. It
 * sits in the gap before the stage's body, centred on the body's jobs (inside its padding), so every arrow meets the
 * card it points at.
 */
function Connector({ kind, opens }: { kind: ConnectorKind; opens: boolean }) {
  const across = kind.kind === 'straight' ? STRAIGHT : <Fan direction={kind.kind} branches={kind.branches} />;
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute top-3 right-full hidden w-6 items-center justify-center @2xl:flex',
        opens ? 'bottom-14' : 'bottom-3',
      )}
    >
      {across}
    </div>
  );
}

/** Where the stages stack: a straight arrow turned a quarter, above the stage, since the jobs then stack too. */
function ArrowDown() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-full left-6 flex h-6 w-6 items-center justify-center @2xl:hidden"
    >
      <div className="rotate-90">{STRAIGHT}</div>
    </div>
  );
}
