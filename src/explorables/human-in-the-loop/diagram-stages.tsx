import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import { ArrowDown, Connector } from './diagram-arrows';
import { connectorInto, type Connector as ConnectorKind, type Rounds } from './diagram-layout.pure';
import type { DiagramSlots, StageSlot, UiWords } from './human-in-the-loop.types';
import { MoveCircles } from './move-circles.client';
import { BranchCard, StageCard, Title } from './stage-card';
import { StageProgress } from './state-mark';
import { TryButton } from './try-button.client';
import type { Run, StageRun } from './workflow-run.pure';
import type { Stage, Workflow } from './workflow.types';

export function DiagramStages(props: {
  workflow: Workflow;
  slots?: DiagramSlots;
  words: UiWords;
  readonly: boolean;
  rounds: Rounds;
  run?: Run;
  onOpenStage: (stageId: string) => void;
}) {
  const { workflow, slots = {} } = props;
  const ctx: Context = { ...props, slots };
  return (
    <div className="@container">
      <div data-scroller="" className="@2xl:overflow-x-auto @2xl:overscroll-x-contain @2xl:pb-3">
        <ol
          data-part="diagram"
          data-view="stages"
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

interface Context {
  workflow: Workflow;
  slots: DiagramSlots;
  words: UiWords;
  readonly: boolean;
  rounds: Rounds;
  run?: Run;
  onOpenStage: (stageId: string) => void;
}

const runOfStage = (ctx: Context, stage: Stage): StageRun | undefined =>
  ctx.run?.stages.find((each) => each.id === stage.id);

function StageColumn({ ctx, stage, previous }: { ctx: Context; stage: Stage; previous: Stage | undefined }) {
  const slot = ctx.slots.stages?.[stage.id] ?? {};
  const lane = (
    <>
      {!ctx.readonly && (
        <TryButton
          label={ctx.words.tryIt}
          stage={stage.name}
          forStage={ctx.words.tryFor.replace('{stage}', stage.name)}
          onOpen={() => ctx.onOpenStage(stage.id)}
        />
      )}
      <StageBody ctx={ctx} stage={stage} slot={slot} into={previous && connectorInto(previous, stage, ctx.rounds)} />
    </>
  );
  return (
    <li
      {...slot.target}
      className="group/column focus-group__item relative flex min-w-0 flex-col gap-1 @2xl:flex-[1_0_11rem]"
    >
      {previous && <ArrowDown />}
      {slot.after === undefined ? lane : <LaneWithAfter lane={lane} after={slot.after} />}
    </li>
  );
}

function LaneWithAfter({ lane, after }: { lane: ReactNode; after: ReactNode }) {
  return (
    <>
      <div className="relative flex flex-1 flex-col">{lane}</div>
      <div data-stage-after="" className="mt-2">
        {after}
      </div>
    </>
  );
}

function StageBody(props: { ctx: Context; stage: Stage; slot: StageSlot; into: ConnectorKind | undefined }) {
  const { ctx, stage, slot, into } = props;
  const opens = !ctx.readonly;
  const branches = ctx.rounds[stage.id] ?? 1;
  return (
    <div
      className={cn(
        'relative flex flex-1 flex-col justify-start rounded-2xl border border-transparent bg-muted p-3 transition-[border-color,box-shadow] duration-200',
        opens && 'pb-14 group-hover/column:border-border group-hover/column:shadow-sm',
      )}
    >
      {into && <Connector kind={into} />}
      {branches > 1 ? (
        <Branches ctx={ctx} stage={stage} branches={branches} />
      ) : (
        <StageCard
          stage={stage}
          slot={slot}
          words={ctx.words}
          moves={ctx.slots.initials === true}
          run={runOfStage(ctx, stage)}
        />
      )}
    </div>
  );
}

function BranchesHead({ ctx, stage, slot }: { ctx: Context; stage: Stage; slot: StageSlot }) {
  return (
    <div data-stage-head="" className="flex min-h-[50px] flex-col gap-1.5 px-3 pt-[13px] pb-2">
      <Title stage={stage} slot={slot} />
      {ctx.slots.initials === true && stage.moves.length > 0 && (
        <div className="relative z-10">
          <MoveCircles moves={stage.moves} label={ctx.words.moveLabel} />
        </div>
      )}
      {slot.marker !== undefined && <div className="flex flex-wrap items-center gap-x-2 gap-y-1">{slot.marker}</div>}
    </div>
  );
}

function Branches({ ctx, stage, branches }: { ctx: Context; stage: Stage; branches: number }) {
  const slot = ctx.slots.stages?.[stage.id] ?? {};
  const run = runOfStage(ctx, stage);
  return (
    <>
      <BranchesHead ctx={ctx} stage={stage} slot={slot} />
      <ol
        aria-label={stage.name}
        className="ml-4 flex flex-col gap-3 border-l border-dashed border-border pl-3 @2xl:ml-0 @2xl:border-l-0 @2xl:pl-0"
      >
        {Array.from({ length: branches }, (_, at) => (
          <BranchCard key={at} stage={stage} round={at + 1} words={ctx.words} run={run?.rounds[at]} />
        ))}
      </ol>
      {run && (
        <div className="mt-2 px-1">
          <StageProgress run={run} words={ctx.words} />
        </div>
      )}
      {stage.summary && (
        <p data-summary="" className="mt-2 px-1 text-caption text-muted-foreground">
          {stage.summary}
        </p>
      )}
    </>
  );
}
