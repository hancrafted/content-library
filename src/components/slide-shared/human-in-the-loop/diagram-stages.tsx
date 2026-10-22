import { cn } from '@/lib/utils';
import { AiJob, ChatJobs, DeliverableJob, FocalJob, PieceJobs, popoverOf, type JobViewProps } from './diagram-jobs';
import { connectorInto, fanGeometry, type Connector as ConnectorKind } from './diagram-layout.pure';
import { jobRole } from './diagram-model.pure';
import type { DiagramSlots, StageSlot, UiWords } from './human-in-the-loop.types';
import { MoveCircles } from './move-circles.client';
import { NodePopover } from './node-popover.client';
import { TryButton } from './try-button.client';
import type { Job, Stage, Workflow } from './workflow.types';

/**
 * The Workflow as one ordered list of stages, each a column of jobs, left to right where the Scene is wide and top to
 * bottom where it is narrow; each connector turns with it. The focal job is the one focal point. Pointing at a stage
 * dims the others.
 */
export function DiagramStages(props: {
  workflow: Workflow;
  slots?: DiagramSlots;
  words: UiWords;
  readonly: boolean;
  openStageId: string | null;
  onOpenStage: (stageId: string) => void;
}) {
  const { workflow, slots = {} } = props;
  const ctx: Context = { ...props, slots };
  return (
    <div className="@container">
      <ol
        data-part="diagram"
        aria-label={slots.label ?? workflow.title}
        className="focus-group focus-group--dim-others flex flex-col gap-6 @4xl:flex-row @4xl:items-stretch @4xl:gap-5"
      >
        {workflow.stages.map((stage, index) => (
          <StageColumn key={stage.id} ctx={ctx} stage={stage} previous={workflow.stages[index - 1]} />
        ))}
      </ol>
    </div>
  );
}

/** What every stage column reads: the Workflow, the Slide's slots, the words and the "Try it" wiring. */
interface Context {
  workflow: Workflow;
  slots: DiagramSlots;
  words: UiWords;
  readonly: boolean;
  openStageId: string | null;
  onOpenStage: (stageId: string) => void;
}

function StageColumn({ ctx, stage, previous }: { ctx: Context; stage: Stage; previous: Stage | undefined }) {
  const slot = ctx.slots.stages?.[stage.id] ?? {};
  const focal = stage.jobs.some((job) => job.id === ctx.workflow.focalJobId);
  return (
    <li {...slot.target} className="focus-group__item relative flex min-w-0 flex-col gap-2 @4xl:grow @4xl:basis-0">
      {previous && <Connector kind={connectorInto(previous, stage)} />}
      <StageHeader stage={stage} slot={slot} words={ctx.words} moves={ctx.slots.initials === true} />
      <ol
        aria-label={jobsLabelOf(stage, slot, ctx.slots)}
        className={cn(
          'flex flex-1 flex-col justify-center gap-2 rounded-2xl bg-card p-3',
          focal ? 'border-2 border-primary' : 'card-hover card-hover--outline border border-border',
        )}
      >
        {stage.jobs.map((job) => (
          <StageJob key={job.id} ctx={ctx} stage={stage} job={job} gateLabel={gateLabelOf(stage, slot)} />
        ))}
      </ol>
      {!ctx.readonly && (
        <TryButton
          label={ctx.words.tryIt}
          stage={stage.name}
          pressed={ctx.openStageId === stage.id}
          onOpen={() => ctx.onOpenStage(stage.id)}
        />
      )}
    </li>
  );
}

/** The label of a stage's gate on a card: the Slide's word, else the bare number. */
const gateLabelOf = (stage: Stage, slot: StageSlot): string | undefined =>
  stage.gate === undefined ? undefined : (slot.gateLabel ?? String(stage.gate));

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
  'cursor-pointer rounded-sm text-left outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring';

/**
 * The stage's name, opening its popover where the Slide gives one, over its BRIEF letters as circled capitals (each
 * with its tooltip). Across a wide row every header keeps one height, so a stage without letters lines up with the rest.
 */
function StageHeader(props: { stage: Stage; slot: StageSlot; words: UiWords; moves: boolean }) {
  const { stage, slot, words, moves } = props;
  const popover = popoverOf(slot.popover, stage.name);
  return (
    <div className="flex flex-col items-start gap-1.5 @4xl:h-14">
      <p className="flex items-center gap-1 text-body font-semibold">
        {popover ? (
          <NodePopover copy={popover} className={NAME_BUTTON}>
            {stage.name}
          </NodePopover>
        ) : (
          stage.name
        )}
        {slot.aside}
      </p>
      {moves && stage.moves.length > 0 && <MoveCircles moves={stage.moves} label={words.moveLabel} />}
    </div>
  );
}

const STRAIGHT = (
  <svg viewBox="0 0 24 10" className="h-2.5 w-6" aria-hidden="true">
    <path d="M0 5h20" className="fill-none stroke-foreground" strokeWidth="1.5" />
    <path d="M18 1.5 23 5l-5 3.5z" className="fill-foreground" />
  </svg>
);

function Fan({ direction, branches }: { direction: 'out' | 'in'; branches: number }) {
  const { height, lines, heads } = fanGeometry(direction, branches);
  return (
    <svg viewBox={`0 0 24 ${height}`} data-fan={direction} className="w-6" style={{ height }} aria-hidden="true">
      <path d={lines} className="fill-none stroke-foreground" strokeWidth="1.5" />
      <path d={heads} className="fill-foreground" />
    </svg>
  );
}

/**
 * The hairline into a stage: straight, fanning out to its chats, or fanning them back in. It sits in the gap before its
 * stage, beside the body where the row runs across. Where the stages stack it sits above, a straight arrow turned a
 * quarter, since the jobs then stack too and a fan wider than the gap would leave the Foreground.
 */
function Connector({ kind }: { kind: ConnectorKind }) {
  const across = kind.kind === 'straight' ? STRAIGHT : <Fan direction={kind.kind} branches={kind.branches} />;
  return (
    <div
      aria-hidden="true"
      className="absolute bottom-full left-8 flex h-6 w-6 items-center justify-center @4xl:top-14 @4xl:right-full @4xl:bottom-0 @4xl:left-auto @4xl:mt-2 @4xl:h-auto @4xl:w-5"
    >
      <div className="rotate-90 @4xl:hidden">{STRAIGHT}</div>
      <div className="hidden @4xl:block">{across}</div>
    </div>
  );
}
