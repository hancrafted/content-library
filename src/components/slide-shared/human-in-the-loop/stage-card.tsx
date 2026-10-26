import { cn } from '@/lib/utils';
import { RotateCw, Undo2 } from 'lucide-react';
import type { PopoverCopy, StageSlot, UiWords } from './human-in-the-loop.types';
import { MoveCircles } from './move-circles.client';
import { NodePopover, type NodeCopy } from './node-popover.client';
import type { Stage } from './workflow.types';

/*
 * The stage card of the Presentation view, the one card that replaces the five job views: the stage's title, its short
 * summary, a labelled "checked" mark where its jobs are reviewed, and its gate badge. Static: the column's "Try it"
 * button opens the modal, and the name opens a popover only where the Slide gives one.
 */

const CARD = 'rounded-xl border border-border bg-card';

export const NAME_BUTTON =
  'relative z-10 cursor-pointer rounded-sm text-left outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring';

/** A popover's copy with the name of the stage it explains as its title. */
export const popoverOf = (copy: PopoverCopy | undefined, stageName: string): NodeCopy | undefined =>
  copy && { title: stageName, ...copy };

/** Whether any job of the stage is checked against its criteria in a fresh chat. */
export const isChecked = (stage: Stage): boolean => stage.jobs.some((job) => job.reviewed);

/** The label of a stage's gate on a card: the Slide's word, else the visual's gate word with the number. */
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

/** The gate's badge; on a narrow Scene, where no arc is drawn, it carries "send back" too. */
export function GateBadge({ gate, sendBack }: { readonly gate: string; readonly sendBack: string }) {
  return (
    <span
      data-gate=""
      className="inline-flex w-fit items-center gap-1 rounded-full bg-muted px-2 text-caption font-medium text-muted-foreground"
    >
      {gate}
      <span className="inline-flex items-center gap-1 @2xl:hidden">
        <Undo2 aria-hidden="true" className="size-3" />
        {sendBack}
      </span>
    </span>
  );
}

function Marks({ stage, gate, words }: { stage: Stage; gate: string | undefined; words: UiWords }) {
  if (!isChecked(stage) && !gate) return null;
  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
      {isChecked(stage) && <CheckedMark word={words.checked} />}
      {gate && <GateBadge gate={gate} sendBack={words.sendBack} />}
    </div>
  );
}

/** One stage as a card; where the stage has a gate the badge carries "send back" on a narrow Scene, the arc on a wide one. */
export function StageCard(props: { stage: Stage; slot: StageSlot; words: UiWords; moves: boolean }) {
  const { stage, slot, words, moves } = props;
  const gate = gateLabelOf(stage, slot, words);
  return (
    <div data-stage-card="" className={cn('flex flex-col gap-1.5 p-3', CARD, gate && 'shadow-sm')}>
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
      <Marks stage={stage} gate={gate} words={words} />
    </div>
  );
}

/** One round of a repeated stage: one card height, so with the column's gap the branches stand one fan pitch apart. */
export function BranchCard(props: { stage: Stage; slot: StageSlot; round: number; words: UiWords }) {
  const { stage, slot, round, words } = props;
  const popover = popoverOf(slot.popover, stage.name);
  return (
    <li
      data-branch=""
      className={cn('flex h-12 w-full items-center justify-between gap-1 px-3 text-caption font-semibold', CARD)}
    >
      <span className="min-w-0 truncate">
        {popover ? (
          <NodePopover copy={popover} className={NAME_BUTTON}>
            {stage.name}
          </NodePopover>
        ) : (
          stage.name
        )}{' '}
        {round}
      </span>
      {round === 1 && slot.aside && <span className="relative z-10">{slot.aside}</span>}
      {isChecked(stage) && (
        <span className="flex items-center text-muted-foreground">
          <RotateCw aria-hidden="true" className="size-4" />
          <span className="sr-only">{words.checked}</span>
        </span>
      )}
    </li>
  );
}
