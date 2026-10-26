import { cn } from '@/shared/lib/utils';
import { ArrowDown, Connector, SendBack } from './diagram-arrows';
import { connectorInto, type Connector as ConnectorKind, type Rounds } from './diagram-layout.pure';
import type { DiagramSlots, StageSlot, UiWords } from './human-in-the-loop.types';
import { BranchCard, StageCard } from './stage-card';
import { TryButton } from './try-button.client';
import type { Stage, Workflow } from './workflow.types';

/**
 * The Presentation view: the Workflow as one ordered list of stage cards, left to right where the Scene is wide enough
 * and top to bottom where it is narrow. A repeated stage fans out into one branch card per round and back in after it;
 * a gated stage has a dashed arc under it that sends the work back. Pointing at a stage dims the others; the whole
 * column opens its modal.
 */
export function DiagramPresentation(props: {
  workflow: Workflow;
  slots?: DiagramSlots;
  words: UiWords;
  readonly: boolean;
  rounds: Rounds;
  onOpenStage: (stageId: string) => void;
}) {
  const { workflow, slots = {} } = props;
  const ctx: Context = { ...props, slots };
  return (
    <div className="@container">
      <div data-scroller="" className="@2xl:overflow-x-auto @2xl:overscroll-x-contain @2xl:pb-3">
        <ol
          data-part="diagram"
          data-view="presentation"
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

/** What every stage column reads: the Workflow, the Slide's slots, the words, the rounds and the "Try it" wiring. */
interface Context {
  workflow: Workflow;
  slots: DiagramSlots;
  words: UiWords;
  readonly: boolean;
  rounds: Rounds;
  onOpenStage: (stageId: string) => void;
}

function StageColumn({ ctx, stage, previous }: { ctx: Context; stage: Stage; previous: Stage | undefined }) {
  const slot = ctx.slots.stages?.[stage.id] ?? {};
  return (
    <li
      {...slot.target}
      className="group/column focus-group__item relative flex min-w-0 flex-col gap-1 @2xl:flex-[1_0_11rem]"
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
      <StageBody ctx={ctx} stage={stage} slot={slot} into={previous && connectorInto(previous, stage, ctx.rounds)} />
      {stage.gate !== undefined && <SendBack word={ctx.words.sendBack} />}
    </li>
  );
}

/**
 * A stage's lane, with the connector from the stage before. Where the column opens a modal the lane keeps room at its
 * foot for the rising "Practice it" button, and answers the pointer.
 */
function StageBody(props: { ctx: Context; stage: Stage; slot: StageSlot; into: ConnectorKind | undefined }) {
  const { ctx, stage, slot, into } = props;
  const opens = !ctx.readonly;
  const branches = ctx.rounds[stage.id] ?? 1;
  return (
    <div
      className={cn(
        'relative flex flex-1 flex-col justify-center rounded-2xl border border-transparent bg-muted p-3 transition-[border-color,box-shadow] duration-200',
        opens && 'pb-14 group-hover/column:border-border group-hover/column:shadow-sm',
      )}
    >
      {into && <Connector kind={into} opens={opens} />}
      {branches > 1 ? (
        <Branches ctx={ctx} stage={stage} branches={branches} />
      ) : (
        <StageCard stage={stage} slot={slot} words={ctx.words} moves={ctx.slots.initials === true} />
      )}
    </div>
  );
}

/**
 * The rounds of a repeated stage as parallel cards, indented as branches where the stages stack. The stage's summary
 * hangs under the last card, out of the flow, so the cards keep standing on the fan's branches.
 */
function Branches({ ctx, stage, branches }: { ctx: Context; stage: Stage; branches: number }) {
  return (
    <ol
      aria-label={stage.name}
      className="ml-4 flex flex-col gap-3 border-l border-dashed border-border pl-3 @2xl:ml-0 @2xl:border-l-0 @2xl:pl-0"
    >
      {Array.from({ length: branches }, (_, at) => (
        <BranchCard key={at} stage={stage} slot={ctx.slots.stages?.[stage.id] ?? {}} round={at + 1} words={ctx.words} />
      ))}
      {stage.summary && (
        <li className="relative h-0">
          <p className="absolute inset-x-1 top-0 text-caption text-muted-foreground">{stage.summary}</p>
        </li>
      )}
    </ol>
  );
}
