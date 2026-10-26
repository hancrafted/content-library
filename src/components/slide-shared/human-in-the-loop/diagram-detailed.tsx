import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { ArrowDown, Connector, SendBack } from './diagram-arrows';
import { connectorInto, type Rounds } from './diagram-layout.pure';
import type { DiagramSlots, StageSlot, UiWords } from './human-in-the-loop.types';
import { JobCard } from './job-card';
import { MoveCircles } from './move-circles.client';
import { GateBadge, gateLabelOf, Title } from './stage-card';
import { orderedJobs } from './workflow-order.pure';
import type { Stage, Workflow } from './workflow.types';

/**
 * The Detailed view: the same ordered list of stage columns as the Presentation view, but each stage card holds its
 * jobs as job cards in `needs` order, joined by arrows. A repeated stage is drawn once, its jobs inside a dashed
 * bracket that says how many rounds it runs; a gated stage keeps its badge and send-back arc. A job card opens the
 * stage's modal at that job.
 */
export function DiagramDetailed(props: {
  workflow: Workflow;
  slots?: DiagramSlots;
  words: UiWords;
  readonly: boolean;
  rounds: Rounds;
  onOpenStage: (stageId: string, jobId?: string) => void;
}) {
  const { workflow, slots = {} } = props;
  const ctx: Context = { ...props, slots };
  return (
    <div className="@container">
      <div data-scroller="" className="@2xl:overflow-x-auto @2xl:overscroll-x-contain @2xl:pb-3">
        <ol
          data-part="diagram"
          data-view="detailed"
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
  workflow: Workflow;
  slots: DiagramSlots;
  words: UiWords;
  readonly: boolean;
  rounds: Rounds;
  onOpenStage: (stageId: string, jobId?: string) => void;
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
      <Jobs ctx={ctx} stage={stage} />
    </div>
  );
}

function Jobs({ ctx, stage }: { ctx: Context; stage: Stage }) {
  const label = ctx.slots.stages?.[stage.id]?.jobsLabel ?? ctx.slots.jobsLabel;
  const cards = (
    <ol aria-label={label?.replace('{stage}', stage.name)} className="flex flex-col gap-4">
      {orderedJobs(stage.jobs).map((job, at) => (
        <JobCard
          key={job.id}
          stage={stage}
          job={job}
          slot={ctx.slots.jobs?.[job.id] ?? {}}
          words={ctx.words}
          joined={at > 0}
          onOpen={ctx.readonly ? undefined : () => ctx.onOpenStage(stage.id, job.id)}
        />
      ))}
    </ol>
  );
  if (!stage.foreach) return <div className="mt-1">{cards}</div>;
  const rounds = ctx.rounds[stage.id] ?? stage.foreach.teaching;
  return <Bracket label={ctx.words.repeats.replace('{n}', String(rounds))}>{cards}</Bracket>;
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
