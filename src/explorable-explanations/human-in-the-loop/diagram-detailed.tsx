import { fillTemplate } from '@/shared/lib/template.pure';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import { ArrowDown, Connector, SendBack } from './diagram-arrows';
import { connectorInto, type Rounds } from './diagram-layout.pure';
import type { DiagramProps, DiagramSlots, StageSlot, UiWords } from './human-in-the-loop.types';
import { JobCard } from './job-card';
import { MoveCircles } from './move-circles.client';
import { GateBadge, gateLabelOf, Title } from './stage-card';
import { orderedJobs } from './workflow-order.pure';
import type { JobState, Run, StageRun } from './workflow-run.pure';
import type { Stage, Workflow } from './workflow.types';

/**
 * The Detailed view and, with the viewer's run laid over it, the Hands-on view: the same ordered list of stage columns as the Presentation view, but each stage card holds its
 * jobs as job cards in `needs` order, joined by arrows. A repeated stage is drawn once, its jobs inside a dashed
 * bracket that says how many rounds it runs; a gated stage keeps its badge and send-back arc. A job card opens the
 * stage's modal at that job. In Hands-on every job card says open, done or checked, each stage its count ("3/5"), and
 * a repeated stage's bracket holds the rounds the run has, titled by their pasted H3s. All of it is read from the run
 * model: the view never works out progress itself.
 */
export function DiagramDetailed(props: {
  view: 'detailed' | 'handson';
  run?: Run;
  workflow: Workflow;
  slots?: DiagramSlots;
  words: UiWords;
  readonly: boolean;
  rounds: Rounds;
  onOpenStage: DiagramProps['onOpenStage'];
}) {
  const { workflow, slots = {} } = props;
  const ctx: Context = { ...props, slots };
  return (
    <div className="@container">
      <div data-scroller="" className="@2xl:overflow-x-auto @2xl:overscroll-x-contain @2xl:pb-3">
        <ol
          data-part="diagram"
          data-view={props.view}
          aria-label={slots.label ?? workflow.title}
          className="flex flex-col gap-6 @2xl:flex-row @2xl:items-stretch @2xl:gap-6"
        >
          {workflow.stages.map((stage, index) => (
            <StageColumn key={stage.id} ctx={ctx} stage={stage} previous={workflow.stages[index - 1]} />
          ))}
        </ol>
      </div>
    </div>
  );
}

interface Context {
  view: 'detailed' | 'handson';
  run?: Run;
  workflow: Workflow;
  slots: DiagramSlots;
  words: UiWords;
  readonly: boolean;
  rounds: Rounds;
  onOpenStage: DiagramProps['onOpenStage'];
}

function StageColumn({ ctx, stage, previous }: { ctx: Context; stage: Stage; previous: Stage | undefined }) {
  const slot = ctx.slots.stages?.[stage.id] ?? {};
  const into = previous && connectorInto(previous, stage, {});
  return (
    <li {...slot.target} className="focus-group__item relative flex min-w-0 flex-col gap-1 @2xl:flex-[1_0_14rem]">
      {previous && <ArrowDown />}
      <div className="relative flex flex-1 flex-col justify-center rounded-2xl bg-muted p-3">
        {into && <Connector kind={into} opens={false} />}
        <StageCard ctx={ctx} stage={stage} slot={slot} />
      </div>
      {stage.gate !== undefined && <SendBack word={ctx.words.sendBack} />}
    </li>
  );
}

function StageCard({ ctx, stage, slot }: { ctx: Context; stage: Stage; slot: StageSlot }) {
  const { words } = ctx;
  const gate = gateLabelOf(stage, slot, words);
  const run = runOfStage(ctx, stage);
  return (
    <div
      data-stage-card=""
      className={cn('flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3', gate && 'shadow-sm')}
    >
      <Title stage={stage} slot={slot} />
      {ctx.slots.initials === true && stage.moves.length > 0 && (
        <div className="relative z-10">
          <MoveCircles moves={stage.moves} label={words.moveLabel} />
        </div>
      )}
      {stage.summary && (
        <p data-summary="" className="text-caption text-muted-foreground">
          {stage.summary}
        </p>
      )}
      {gate && <GateBadge gate={gate} sendBack={words.sendBack} />}
      {run && <Count run={run} word={words.stateDone} />}
      <Jobs ctx={ctx} stage={stage} />
    </div>
  );
}

const runOfStage = (ctx: Context, stage: Stage): StageRun | undefined =>
  ctx.view === 'handson' ? ctx.run?.stages.find((each) => each.id === stage.id) : undefined;

/** The job cards of one list: a stage's jobs, or one round's. `states` is what the run says; none outside Hands-on. */
function Cards(props: {
  ctx: Context;
  stage: Stage;
  states: ReadonlyMap<string, JobState> | undefined;
  round?: number;
}) {
  const { ctx, stage, states, round } = props;
  const label = ctx.slots.stages?.[stage.id]?.jobsLabel ?? ctx.slots.jobsLabel;
  return (
    <ol aria-label={label?.replace('{stage}', stage.name)} className="flex flex-col gap-4">
      {orderedJobs(stage.jobs).map((job, at) => (
        <JobCard
          key={job.id}
          stage={stage}
          job={job}
          slot={ctx.slots.jobs?.[job.id] ?? {}}
          words={ctx.words}
          joined={at > 0}
          state={ctx.view === 'handson' ? (states?.get(job.id) ?? 'open') : undefined}
          round={round}
          onOpen={ctx.readonly ? undefined : () => ctx.onOpenStage(stage.id, job.id, round)}
        />
      ))}
    </ol>
  );
}

const statesOf = (jobs: readonly { id: string; state: JobState }[]) =>
  new Map(jobs.map((each) => [each.id, each.state]));

/** The viewer's rounds, one block each, titled by the H3 they work on. */
function Rounds({ ctx, stage, run }: { ctx: Context; stage: Stage; run: StageRun }) {
  return (
    <ol className="flex flex-col gap-3">
      {run.rounds.map((round) => (
        <li key={round.number} data-round={round.number} className="flex flex-col gap-1.5">
          <p data-round-title="" className="text-caption font-semibold text-muted-foreground">
            {round.title}
          </p>
          <Cards ctx={ctx} stage={stage} states={statesOf(round.jobs)} round={round.number} />
        </li>
      ))}
    </ol>
  );
}

/** How many rounds the bracket names: the run's, else the layout's count, else the stage's teaching cap. */
const roundCount = (ctx: Context, stage: Stage, held: StageRun | undefined): number =>
  held?.rounds.length ?? ctx.rounds[stage.id] ?? stage.foreach?.teaching ?? 0;

/** The bracket's words: "× each epic (2)", with the stage's own word for its item, else "round". */
const bracketLabel = (ctx: Context, stage: Stage, count: number): string =>
  fillTemplate(ctx.words.repeats, { item: stage.foreach?.item ?? ctx.words.round, n: count });

function Jobs({ ctx, stage }: { ctx: Context; stage: Stage }) {
  const run = runOfStage(ctx, stage);
  const cards = <Cards ctx={ctx} stage={stage} states={run && statesOf(run.jobs)} />;
  if (!stage.foreach) return <div className="mt-1">{cards}</div>;
  const held = run && run.rounds.length > 0 ? run : undefined;
  return (
    <Bracket label={bracketLabel(ctx, stage, roundCount(ctx, stage, held))}>
      {held ? <Rounds ctx={ctx} stage={stage} run={held} /> : cards}
    </Bracket>
  );
}

/** The stage's count of jobs done, such as "3/5", from the run. */
function Count({ run, word }: { run: StageRun; word: string }) {
  return (
    <span data-count="" className="text-caption font-medium text-muted-foreground">
      {run.done}/{run.total}
      <span className="sr-only"> {word}</span>
    </span>
  );
}

/** The dashed bracket round a repeated stage's jobs, labelled with how many rounds it runs. */
function Bracket({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div data-bracket="" className="mt-2 rounded-lg border border-dashed border-border p-2 pt-0">
      <p
        data-bracket-label=""
        className="-mt-2.5 mb-1 w-fit bg-card px-1 text-caption font-medium text-muted-foreground"
      >
        {label}
      </p>
      {children}
    </div>
  );
}
