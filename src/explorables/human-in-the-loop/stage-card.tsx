import { cn } from '@/shared/lib/utils';
import { RotateCw } from 'lucide-react';
import type { ReactNode } from 'react';
import type { PopoverCopy, StageSlot, UiWords } from './human-in-the-loop.types';
import { MoveCircles } from './move-circles.client';
import { NodePopover, type NodeCopy } from './node-popover.client';
import { StageProgress, StateMark } from './state-mark';
import type { RoundRun, StageRun } from './workflow-run.pure';
import type { Stage } from './workflow.types';

const CARD = 'rounded-xl border border-border bg-card';

export const NAME_BUTTON =
  'relative z-10 cursor-pointer rounded-sm text-left outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring';

export const popoverOf = (copy: PopoverCopy | undefined, stageName: string): NodeCopy | undefined =>
  copy && { title: stageName, ...copy };

export const dashedIf = (optional: boolean): string | false => optional && 'border-dashed';

export const stageCardClass = (stage: Stage, gate: string | undefined): string =>
  cn('flex flex-col gap-1.5 p-3', CARD, gate && 'shadow-sm', dashedIf(stage.optional));

export const isChecked = (stage: Stage): boolean => stage.jobs.some((job) => job.reviewed);

export const gateLabelOf = (stage: Stage, slot: StageSlot, words: UiWords): string | undefined =>
  stage.gate === undefined ? undefined : (slot.gateLabel ?? words.gate.replace('{n}', String(stage.gate)));

/** The "checked" mark: an icon and its word, so the review habit is never carried by the icon alone. */
export function CheckedMark({ word }: { readonly word: string }) {
  return (
    <span data-checked="" className="inline-flex items-center gap-1 text-caption font-medium text-muted-foreground">
      <RotateCw aria-hidden="true" className="size-3.5 shrink-0" />
      {word}
    </span>
  );
}

export function Title({ stage, slot }: { readonly stage: Stage; readonly slot: StageSlot }) {
  const popover = popoverOf(slot.popover, stage.name);
  return (
    <p className="flex items-center gap-1 text-body font-semibold">
      <span data-title="">
        {popover ? (
          <NodePopover copy={popover} className={NAME_BUTTON}>
            {stage.name}
          </NodePopover>
        ) : (
          stage.name
        )}
      </span>
      {slot.aside && <span className="relative z-10">{slot.aside}</span>}
    </p>
  );
}

export function GateBadge({ gate }: { readonly gate: string }) {
  return <Pill mark="data-gate">{gate}</Pill>;
}

export function Pill({
  mark,
  children,
}: {
  readonly mark: 'data-gate' | 'data-optional';
  readonly children: ReactNode;
}) {
  return (
    <span
      {...{ [mark]: '' }}
      className="inline-flex w-fit items-center gap-1 rounded-full bg-muted px-2 text-caption font-medium text-muted-foreground"
    >
      {children}
    </span>
  );
}

const ReviewedMark = ({ stage, words }: { stage: Stage; words: UiWords }) =>
  isChecked(stage) ? <CheckedMark word={words.checked} /> : null;

function Marks(props: {
  stage: Stage;
  gate: string | undefined;
  words: UiWords;
  run: StageRun | undefined;
  marker: StageSlot['marker'];
}) {
  const { stage, gate, words, run, marker } = props;
  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 empty:hidden">
      {run ? <StageProgress run={run} words={words} /> : <ReviewedMark stage={stage} words={words} />}
      {gate && <GateBadge gate={gate} />}
      {marker}
    </div>
  );
}

export function StageCard(props: { stage: Stage; slot: StageSlot; words: UiWords; moves: boolean; run?: StageRun }) {
  const { stage, slot, words, moves, run } = props;
  const gate = gateLabelOf(stage, slot, words);
  return (
    <div data-stage-card="" className={stageCardClass(stage, gate)}>
      <Title stage={stage} slot={slot} />
      {moves && stage.moves.length > 0 && (
        <div className="relative z-10">
          <MoveCircles moves={stage.moves} label={words.moveLabel} />
        </div>
      )}
      {stage.summary && (
        <p data-summary="" className="text-caption text-muted-foreground">
          {stage.summary}
        </p>
      )}
      <Marks stage={stage} gate={gate} words={words} run={run} marker={slot.marker} />
    </div>
  );
}

export function BranchCard(props: { stage: Stage; round: number; words: UiWords; run?: RoundRun }) {
  const { stage, round, words, run } = props;
  return (
    <li
      data-branch=""
      className={cn('flex h-12 w-full items-center justify-between gap-1 px-3 text-caption font-semibold', CARD)}
    >
      <span data-branch-title="" className="min-w-0 truncate">
        {run?.title ?? `${stage.name} ${round}`}
      </span>
      {run ? <StateMark state={run.state} words={words} /> : <ReviewedTick stage={stage} words={words} />}
    </li>
  );
}

function ReviewedTick({ stage, words }: { stage: Stage; words: UiWords }) {
  if (!isChecked(stage)) return null;
  return (
    <span className="flex items-center text-muted-foreground">
      <RotateCw aria-hidden="true" className="size-4" />
      <span className="sr-only">{words.checked}</span>
    </span>
  );
}
