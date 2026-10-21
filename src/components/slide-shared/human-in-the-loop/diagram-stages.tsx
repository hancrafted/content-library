import { cn } from '@/lib/utils';
import { AiJob, ChatJobs, DeliverableJob, FocalJob, PieceJobs, type JobViewProps } from './diagram-jobs';
import { connectorInto, fanGeometry, type Connector as ConnectorKind } from './diagram-layout.pure';
import { jobRole } from './diagram-model.pure';
import { cardOf, TryStep, type OpenJob } from './diagram-try';
import type { DiagramSlots, StageSlot, UiWords } from './human-in-the-loop.types';
import { NodePopover } from './node-popover.client';
import type { WorkflowView } from './workflow-view.pure';
import type { Stage, Workflow } from './workflow.types';

/**
 * The Workflow as one ordered list of stages, each a column of jobs, left to right where the Scene is wide and top to
 * bottom where it is narrow; each connector turns with it. The focal job is the one focal point. Pointing at a stage
 * dims the others.
 */
export function DiagramStages(props: {
  workflow: Workflow;
  slots?: DiagramSlots;
  words: Pick<UiWords, 'signedOff'>;
  view?: WorkflowView;
  open?: OpenJob;
}) {
  const { workflow, slots = {}, words } = props;
  const ctx: Context = { ...props, slots, words: { signedOff: words.signedOff, checked: slots.checked ?? '' } };
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

/** What every stage column reads: the Workflow, the Slide's slots, the words and, in Try mode, the cards. */
interface Context {
  workflow: Workflow;
  slots: DiagramSlots;
  words: JobViewProps['words'];
  view?: WorkflowView;
  open?: OpenJob;
}

function StageColumn({ ctx, stage, previous }: { ctx: Context; stage: Stage; previous: Stage | undefined }) {
  const slot = ctx.slots.stages?.[stage.id] ?? {};
  const focal = stage.jobs.some((job) => job.id === ctx.workflow.focalJobId);
  return (
    <li {...slot.target} className="focus-group__item relative flex min-w-0 flex-col gap-2 @4xl:grow @4xl:basis-0">
      {previous && <Connector kind={connectorInto(previous, stage)} />}
      <StageHeader stage={stage} slot={slot} initials={ctx.slots.initials === true} />
      <ol
        aria-label={slot.jobsLabel ?? stage.name}
        className={cn(
          'flex flex-1 flex-col justify-center gap-2 rounded-2xl bg-card p-3',
          focal ? 'border-2 border-primary' : 'card-hover card-hover--outline border border-border',
        )}
      >
        {stage.jobs.map((job) => (
          <StageJob key={job.id} ctx={ctx} job={job} gate={gateOf(stage, slot)} />
        ))}
      </ol>
    </li>
  );
}

const gateOf = (stage: Stage, slot: StageSlot): string | undefined =>
  stage.gate === undefined ? undefined : (slot.gate ?? String(stage.gate));

function StageJob({
  ctx,
  job,
  gate,
}: {
  ctx: Context;
  job: Workflow['stages'][number]['jobs'][number];
  gate?: string;
}) {
  const card = ctx.view?.clickable ? cardOf(ctx.view, job.id) : undefined;
  const slot = ctx.slots.jobs?.[job.id] ?? {};
  return (
    <>
      <Job role={jobRole(ctx.workflow, job)} job={job} slot={slot} gate={gate} words={ctx.words} />
      {card && ctx.open && <TryStep card={card} open={ctx.open} />}
    </>
  );
}

function Job({ role, ...props }: JobViewProps & { role: ReturnType<typeof jobRole> }) {
  if (role === 'pieces') return <PieceJobs {...props} />;
  if (role === 'chats') return <ChatJobs {...props} />;
  if (role === 'focal') return <FocalJob {...props} />;
  if (role === 'deliverable') return <DeliverableJob {...props} />;
  return <AiJob {...props} />;
}

const NAME_BUTTON =
  'cursor-pointer rounded-sm text-left outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring';

/**
 * The stage's name, opening its popover where the Slide gives one, over the move pill: the move's first letter
 * semibold when the initials are on. Across a wide row every pill keeps two lines' height, so a move that wraps lines
 * up with the rest.
 */
function StageHeader({ stage, slot, initials }: { stage: Stage; slot: StageSlot; initials: boolean }) {
  return (
    <div className="flex flex-col items-start gap-1 @4xl:h-24">
      <p className="flex items-center gap-1 text-body font-semibold">
        {slot.popover ? (
          <NodePopover copy={slot.popover} className={NAME_BUTTON}>
            {stage.name}
          </NodePopover>
        ) : (
          stage.name
        )}
        {slot.aside}
      </p>
      <MovePill move={stage.moveLabel} pill={stage.move !== undefined} initials={initials} />
    </div>
  );
}

function MovePill({ move, pill, initials }: { move: string | undefined; pill: boolean; initials: boolean }) {
  const words =
    initials && pill && move ? (
      <>
        <b className="font-semibold text-foreground">{move.slice(0, 1)}</b>
        {move.slice(1)}
      </>
    ) : (
      move
    );
  return (
    <span
      className={cn(
        'text-caption text-muted-foreground',
        pill && 'rounded-2xl border border-border bg-card px-2.5 py-0.5 @4xl:flex @4xl:items-center @4xl:min-h-14',
      )}
    >
      <span>{words}</span>
    </span>
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
      className="absolute bottom-full left-8 flex h-6 w-6 items-center justify-center @4xl:top-24 @4xl:right-full @4xl:bottom-0 @4xl:left-auto @4xl:mt-2 @4xl:h-auto @4xl:w-5"
    >
      <div className="rotate-90 @4xl:hidden">{STRAIGHT}</div>
      <div className="hidden @4xl:block">{across}</div>
    </div>
  );
}
