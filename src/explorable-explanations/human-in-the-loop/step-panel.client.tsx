'use client';

import { CopyButton, PromptActions } from '@/shared/components/core-components/try-prompt/prompt-actions.client';
import { joinPrompt, type PromptParts } from '@/shared/components/core-components/try-prompt/prompt-sections.pure';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { CheckedBox } from './checked-box.client';
import { contextEntries, needsInput, type Entry } from './context-entries.pure';
import { ContextField } from './context-field.client';
import { debugFooter } from './debug-footer.pure';
import { Context } from './step-context.client';
import type { SlotState, StepKit } from './step-kit.types';
import { StepSection } from './step-section.client';
import { debuggedPrompt, explanationPrompt, tryWords } from './words.pure';
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
  /** The key a review's "I checked this result" is written to; only a review step shows the box. */
  readonly checkedAs?: string;
}

/** Where a do step saves its result: the task's output, or `output_K` for chat K of a fan-out. */
export const resultKey = (step: Step, task: TaskModalView): string => {
  if (task.output === undefined) return `${task.id}.done`;
  return step.chat === undefined ? task.output : `${task.output}_${step.chat}`;
};

/** The name a step goes by in the item's lead: its kind and its chat. */
export const panelKey = (kind: 'do' | 'review', step: Step): string => `${kind}#${step.chat ?? 0}`;

/** What leads in this panel, if anything: its context, its Copy prompt, or its answer. */
function leadOf(kit: StepKit, key: string) {
  const next = kit.lead?.next;
  return next?.key === key ? next.action : null;
}

export const partsOf = ({ prompt }: Step): PromptParts => ({
  sections: prompt.sections ?? [{ text: prompt.text }],
  slots: prompt.slots ?? [],
});

/** Copy explanation prompt: the prompt wrapped in a request to explain it. It never leads. */
function ExplainButton({ kit, onCopy }: { kit: StepKit; onCopy: () => Promise<boolean> }) {
  const { words } = kit;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <CopyButton label={words.copyExplanation} done={words.copied} onCopy={onCopy} />
        </span>
      </TooltipTrigger>
      <TooltipContent align="end">{words.copyExplanationTip}</TooltipContent>
    </Tooltip>
  );
}

/** Copy the prompt, open ChatGPT; and, at the right, copy the prompt wrapped in the request to explain it. */
function Actions({ step, kit, slots, panel }: { step: Step; kit: StepKit; slots: SlotState; panel: string }) {
  const { words } = kit;
  const plain = joinPrompt(partsOf(step), slots.values);
  const copy = tryWords(words);
  const { debug } = kit;
  const footer = (prompt: 'copy' | 'explain') =>
    debug ? debugFooter(debug, { prompt, step: step.id, chat: step.chat }) : null;
  const text = debuggedPrompt(words, plain, footer('copy'));
  const copied = (ok: boolean) => {
    if (ok) kit.lead?.onCopied(panel);
    return ok;
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      <PromptActions
        text={text}
        copyLabel={copy.copyPrompt}
        lead={leadOf(kit, panel) === 'copy'}
        kit={{ ...kit, words: copy, onCopy: async (each) => copied(await kit.onCopy(each)) }}
      />
      <span className="ml-auto" />
      <ExplainButton
        kit={kit}
        onCopy={() => kit.onCopy(debuggedPrompt(words, explanationPrompt(words, plain), footer('explain')))}
      />
    </div>
  );
}

interface ResultProps {
  readonly name: string;
  readonly kit: StepKit;
  readonly slots: SlotState;
  readonly final: boolean;
  readonly lead: boolean;
}

function Result({ name, kit, slots, final, lead }: ResultProps) {
  const { words } = kit;
  if (final) return <CheckedBox name={name} label={words.markDone} slots={slots} mark="done" lead={lead} />;
  return (
    <ContextField
      field={name}
      label={words.resultHeading}
      placeholder={words.resultPlaceholder}
      value={slots.values[name] ?? ''}
      words={words}
      onValue={(value) => slots.onChange({ ...slots.values, [name]: value })}
      lead={lead}
    />
  );
}

/** How many context steps a prompt has: one when it takes any input, none otherwise. */
export function contextCount(step: Step, task: TaskModalView, kit: StepKit): number {
  const { own, earlier } = contextEntries(partsOf(step), task.previous, kit.words);
  return own.length + earlier.length > 0 ? 1 : 0;
}

/** Every input of a step's prompt, plain ones and earlier results alike. */
export function entriesOfStep(step: Step, task: TaskModalView, kit: StepKit): Entry[] {
  const { own, earlier } = contextEntries(partsOf(step), task.previous, kit.words);
  return [...own, ...earlier];
}

/** Step 1, Provide context: folded, with a hint, while every field holds a value or a sample. */
function ContextStep({ step, task, kit, slots, first }: PanelProps) {
  const { words } = kit;
  const { own, earlier } = contextEntries(partsOf(step), task.previous, words);
  const toFill = needsInput([...own, ...earlier], slots.values);
  return (
    <StepSection
      n={first}
      title={words.stepContext}
      info={words.stepContextInfo}
      kit={kit}
      open={toFill}
      hint={toFill ? undefined : words.stepContextNothing}
    >
      <Context
        own={own}
        earlier={earlier}
        slots={slots}
        words={words}
        lead={leadOf(kit, panelKey('do', step)) === 'context'}
      />
    </StepSection>
  );
}

function DoSteps(props: PanelProps) {
  const { step, task, kit, slots, first } = props;
  const { words } = kit;
  const hasContext = entriesOfStep(step, task, kit).length > 0;
  const panel = panelKey('do', step);
  const lead = leadOf(kit, panel);
  return (
    <>
      {hasContext && <ContextStep {...props} />}
      <StepSection n={first + Number(hasContext)} title={words.stepDo} info={words.stepDoInfo} kit={kit}>
        <Actions step={step} kit={kit} slots={slots} panel={panel} />
        <Result
          name={resultKey(step, task)}
          kit={kit}
          slots={slots}
          final={task.output === undefined}
          lead={lead === 'answer'}
        />
      </StepSection>
    </>
  );
}

export function StepPanel(props: PanelProps) {
  const { step, kind, kit, slots, first, checkedAs } = props;
  return (
    <div className="flex flex-col gap-4" data-step-panel={kind}>
      {kind === 'do' ? (
        <DoSteps {...props} />
      ) : (
        <StepSection n={first} title={kit.words.stepCheck} info={kit.words.stepCheckInfo} kit={kit}>
          <Actions step={step} kit={kit} slots={slots} panel={panelKey('review', step)} />
          {checkedAs && (
            <CheckedBox
              name={checkedAs}
              label={kit.words.markChecked}
              slots={slots}
              lead={leadOf(kit, panelKey('review', step)) === 'answer'}
            />
          )}
        </StepSection>
      )}
    </div>
  );
}
