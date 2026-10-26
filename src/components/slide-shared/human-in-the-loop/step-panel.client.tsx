'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CopyButton, PromptActions } from '../core-components/try-prompt/prompt-actions.client';
import { joinPrompt, type PromptParts } from '../core-components/try-prompt/prompt-sections.pure';
import { contextEntries } from './context-entries.pure';
import { ContextField } from './context-field.client';
import { Context } from './step-context.client';
import type { SlotState, StepKit } from './step-kit.types';
import { StepSection } from './step-section.client';
import { explanationPrompt, tryWords } from './words.pure';
import type { TaskModalView } from './workflow-view.pure';

/*
 * The body of one chat of a stepper step, as a plain list of numbered steps: the context that fills the prompt (when
 * there is any), the prompt with its result box, or, for a review, the check. No cards, no previews: a button copies
 * the prompt, another copies it wrapped in a request that has an AI explain it, so the viewer learns to prompt.
 */

type Step = TaskModalView['steps'][number];

export interface PanelProps {
  readonly step: Step;
  readonly task: TaskModalView;
  /** A do step saves its result under the task's output; a review has none. */
  readonly kind: 'do' | 'review';
  readonly kit: StepKit;
  readonly slots: SlotState;
  /** The number of this panel's first step: a review continues after the do steps. */
  readonly first: number;
}

/** Where a do step saves its result: the task's output, or `output_K` for chat K of a fan-out. */
export const resultKey = (step: Step, task: TaskModalView): string => {
  if (task.output === undefined) return `${task.id}.done`;
  return step.chat === undefined ? task.output : `${task.output}_${step.chat}`;
};

const partsOf = ({ prompt }: Step): PromptParts => ({
  sections: prompt.sections ?? [{ text: prompt.text }],
  slots: prompt.slots ?? [],
});

/** Copy the prompt, open ChatGPT; and, at the right, copy the prompt wrapped in the request to explain it. */
function Actions({ step, kit, slots }: { step: Step; kit: StepKit; slots: SlotState }) {
  const { words } = kit;
  const text = joinPrompt(partsOf(step), slots.values);
  const copy = tryWords(words);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <PromptActions text={text} copyLabel={copy.copyPrompt} kit={{ ...kit, words: copy }} />
      <span className="ml-auto" />
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <CopyButton
              label={words.copyExplanation}
              done={words.copied}
              onCopy={() => kit.onCopy(explanationPrompt(words, text))}
            />
          </span>
        </TooltipTrigger>
        <TooltipContent align="end">{words.copyExplanationTip}</TooltipContent>
      </Tooltip>
    </div>
  );
}

/** A job that hands nothing on is done when the viewer ticks it, not when a result is pasted. */
function DoneBox({ name, kit, slots }: { name: string; kit: StepKit; slots: SlotState }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-body">
      <input
        type="checkbox"
        className="size-4 accent-primary"
        checked={Boolean(slots.values[name])}
        onChange={(event) => slots.onChange({ ...slots.values, [name]: event.target.checked ? 'done' : '' })}
      />
      {kit.words.markDone}
    </label>
  );
}

function Result({ name, kit, slots, final }: { name: string; kit: StepKit; slots: SlotState; final: boolean }) {
  const { words } = kit;
  if (final) return <DoneBox {...{ name, kit, slots }} />;
  return (
    <ContextField
      field={name}
      label={words.resultHeading}
      placeholder={words.resultPlaceholder}
      value={slots.values[name] ?? ''}
      words={words}
      onValue={(value) => slots.onChange({ ...slots.values, [name]: value })}
    />
  );
}

/** How many context steps a prompt has: one when it takes any input, none otherwise. */
export function contextCount(step: Step, task: TaskModalView, kit: StepKit): number {
  const { own, earlier } = contextEntries(partsOf(step), task.previous, kit.words);
  return own.length + earlier.length > 0 ? 1 : 0;
}

function DoSteps({ step, task, kit, slots, first }: PanelProps) {
  const { words } = kit;
  const parts = partsOf(step);
  const { own, earlier } = contextEntries(parts, task.previous, words);
  const hasContext = own.length + earlier.length > 0;
  return (
    <>
      {hasContext && (
        <StepSection n={first} title={words.stepContext} info={words.stepContextInfo} kit={kit}>
          <Context own={own} earlier={earlier} slots={slots} words={words} />
        </StepSection>
      )}
      <StepSection n={first + Number(hasContext)} title={words.stepDo} info={words.stepDoInfo} kit={kit}>
        <Actions step={step} kit={kit} slots={slots} />
        <Result name={resultKey(step, task)} kit={kit} slots={slots} final={task.output === undefined} />
      </StepSection>
    </>
  );
}

export function StepPanel(props: PanelProps) {
  const { step, kind, kit, slots, first } = props;
  return (
    <div className="flex flex-col gap-4" data-step-panel={kind}>
      {kind === 'do' ? (
        <DoSteps {...props} />
      ) : (
        <StepSection n={first} title={kit.words.stepCheck} info={kit.words.stepCheckInfo} kit={kit}>
          <Actions step={step} kit={kit} slots={slots} />
        </StepSection>
      )}
    </div>
  );
}
