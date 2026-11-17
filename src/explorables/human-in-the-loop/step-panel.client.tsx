'use client';

import { BUTTON_GROUP, ChatButtons } from '@/shared/components/core-components/chat-buttons/chat-buttons';
import { CheckedBox } from './checked-box.client';
import { contextEntries, needsInput, type Entry } from './context-entries.pure';
import { ContextField } from './context-field.client';
import { debugFooter } from './debug-footer.pure';
import { ExplainButton } from './explain-button.client';
import type { UiWords } from './human-in-the-loop.types';
import { ModelNote } from './model-note.client';
import { noteFor } from './model-tier.pure';
import { CopyPrompt, EditToggle, PromptEditor, useOpen } from './prompt-editor.client';
import { editKey, editOf, partsOf, promptText, rawPrompt, roundedEdit } from './prompt-edits.pure';
import { Context } from './step-context.client';
import type { SlotState, StepKit } from './step-kit.types';
import { StepSection } from './step-section.client';
import { debuggedPrompt, explanationPrompt } from './words.pure';
import type { StepKind } from './workflow-prompts.pure';
import type { TaskModalView } from './workflow-view.pure';

/*
 * The body of one chat of a stepper step, as a plain list of numbered steps: the context that fills the prompt (when
 * there is any), the prompt with its result box, or, for a review, the check. No cards, no previews: a button copies
 * the prompt, another copies it wrapped in a request that has an AI explain it, so the viewer learns to prompt. The
 * check is optional: it starts folded, and a pasted result already ends the item.
 */

type Step = TaskModalView['steps'][number];

export interface PanelProps {
  readonly step: Step;
  readonly task: TaskModalView;
  readonly kind: 'do' | 'review';
  readonly kit: StepKit;
  readonly slots: SlotState;
  readonly first: number;
  readonly checkedAs?: string;
}

export const resultKey = (step: Step, task: TaskModalView): string => {
  if (task.output === undefined) return `${task.id}.done`;
  return step.chat === undefined ? task.output : `${task.output}_${step.chat}`;
};

export const panelKey = (kind: StepKind, step: Step): string => `${kind}#${step.chat ?? 0}`;

function leadOf(kit: StepKit, key: string) {
  const next = kit.lead?.next;
  return next?.key === key ? next.action : null;
}

interface ActionsProps {
  readonly step: Step;
  readonly task: TaskModalView;
  readonly kit: StepKit;
  readonly slots: SlotState;
  readonly panel: string;
  readonly blocked?: boolean;
}

function TaskModel({ panel, task, words }: Pick<ActionsProps, 'panel' | 'task'> & { readonly words: UiWords }) {
  const note = noteFor(panel, task.recommendedModel);
  return note ? <ModelNote words={words} tier={note.tier} review={note.review} /> : null;
}

function ActionRow({ step, task, kit, slots, panel, blocked, edit, editing }: RowProps) {
  const { words, debug } = kit;
  const plain = promptText(partsOf(step), slots.values, roundedEdit(edit, step));
  const footer = (prompt: 'copy' | 'explain') =>
    debug ? debugFooter(debug, { prompt, step: step.id, chat: step.chat }) : null;
  const copy = async () => {
    const ok = await kit.onCopy(debuggedPrompt(words, plain, footer('copy')));
    if (ok) kit.lead?.onCopied(panel);
    return ok;
  };
  const explain = () => kit.onCopy(debuggedPrompt(words, explanationPrompt(words, plain), footer('explain')));
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className={BUTTON_GROUP} data-prompt-buttons="">
        <CopyPrompt
          words={words}
          edited={edit !== undefined}
          lead={leadOf(kit, panel) === 'copy'}
          blocked={blocked}
          onCopy={copy}
        />
        <EditToggle words={words} open={editing.on} onToggle={editing.toggle} />
      </div>
      <ChatButtons buttons={task.openAIButtons ?? words.openAIButtons} words={words} />
      <TaskModel panel={panel} task={task} words={words} />
      <span className="ml-auto" />
      <ExplainButton kit={kit} blocked={blocked} onCopy={explain} />
    </div>
  );
}

interface RowProps extends ActionsProps {
  readonly edit: string | undefined;
  readonly editing: ReturnType<typeof useOpen>;
}

function Actions(props: ActionsProps) {
  const { step, task, kit } = props;
  const editing = useOpen();
  const blocked = props.blocked ?? needsInput(entriesOfStep(step, task, kit), props.slots.values);
  const at = { key: editKey(kit.edits.level, task.id, step.id), yaml: rawPrompt(partsOf(step.template ?? step)) };
  const { edit, text, onText, onReset } = editOf(kit.edits, at);
  return (
    <>
      <ActionRow {...props} blocked={blocked} edit={edit} editing={editing} />
      {editing.on && (
        <PromptEditor
          words={kit.words}
          text={text}
          edited={edit !== undefined}
          {...{ onText, onReset }}
          onClose={editing.close}
        />
      )}
    </>
  );
}

interface ResultProps {
  readonly name: string;
  readonly kit: StepKit;
  readonly slots: SlotState;
  readonly final: boolean;
  readonly doneLabel?: string;
  readonly lead: boolean;
}

function Result({ name, kit, slots, final, doneLabel, lead }: ResultProps) {
  const { words } = kit;
  if (final)
    return <CheckedBox name={name} label={doneLabel ?? words.markDone} slots={slots} mark="done" lead={lead} />;
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

export function contextCount(step: Step, task: TaskModalView, kit: StepKit): number {
  const { own, earlier } = contextEntries(partsOf(step), task.previous, kit.words);
  return own.length + earlier.length > 0 ? 1 : 0;
}

export function entriesOfStep(step: Step, task: TaskModalView, kit: StepKit): Entry[] {
  const { own, earlier } = contextEntries(partsOf(step), task.previous, kit.words);
  return [...own, ...earlier];
}

function ContextStep({ step, task, kit, slots, first }: PanelProps) {
  const { words } = kit;
  const { own, earlier } = contextEntries(partsOf(step), task.previous, words);
  const toFill = needsInput([...own, ...earlier], slots.values);
  return (
    <StepSection n={first} title={words.stepContext} info={words.stepContextInfo} kit={kit} open={toFill}>
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

function ThenStep({ then, panel, blocked, ...rest }: ActionsProps & { readonly then: Step }) {
  const { kit } = rest;
  return (
    <>
      <p data-then="" className="text-caption text-muted-foreground">
        {kit.words.thenCopy}
      </p>
      <Actions {...rest} step={then} panel={panel} blocked={blocked} />
    </>
  );
}

function DoSteps(props: PanelProps) {
  const { step, task, kit, slots, first } = props;
  const { words } = kit;
  const hasContext = entriesOfStep(step, task, kit).length > 0;
  const panel = panelKey('do', step);
  const lead = leadOf(kit, panel);
  const blocked = needsInput(entriesOfStep(step, task, kit), slots.values);
  return (
    <>
      {hasContext && <ContextStep {...props} />}
      <StepSection n={first + Number(hasContext)} title={words.stepDo} info={words.stepDoInfo} kit={kit}>
        <Actions step={step} task={task} kit={kit} slots={slots} panel={panel} blocked={blocked} />
        {step.then && <ThenStep {...props} then={step.then} panel={panelKey('then', step)} blocked={blocked} />}
        <Result
          name={resultKey(step, task)}
          kit={kit}
          slots={slots}
          final={task.output === undefined}
          doneLabel={task.doneLabel}
          lead={lead === 'answer'}
        />
      </StepSection>
    </>
  );
}

export function StepPanel(props: PanelProps) {
  const { step, task, kind, kit, slots, first, checkedAs } = props;
  return (
    <div className="contents" data-step-panel={kind}>
      {kind === 'do' ? (
        <DoSteps {...props} />
      ) : (
        <StepSection n={first} title={kit.words.stepCheck} info={kit.words.stepCheckInfo} kit={kit} open={false}>
          <Actions step={step} task={task} kit={kit} slots={slots} panel={panelKey('review', step)} />
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
