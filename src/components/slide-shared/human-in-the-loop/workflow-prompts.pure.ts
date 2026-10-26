import type { PromptSlot } from '../core-components/try-prompt/prompt-sections.pure';
import { joinPrompt } from '../core-components/try-prompt/prompt-sections.pure';
import type { PromptView } from '../core-components/try-prompt/try-prompt.types';
import { slotSample } from './workflow-sample.pure';
import type { Runtime, SectionDef, SlotDef, TaskDef, WorkflowFile } from './workflow-schema.types';

/*
 * A task's prompts as TryPrompt takes them. The caller resolves what a Workflow file knows (`{{n}}`, `{{template}}`,
 * `{{checks}}`, `{{inputs}}`); the slot markers stay in the text for the paste-in to fill.
 */

const fenced = (markdown: string): string => `\`\`\`markdown\n${markdown.trimEnd()}\n\`\`\``;

/** The text with each `{{name}}` that `fills` holds replaced; every other marker stays. */
function resolve(text: string, fills: Readonly<Record<string, string>>): string {
  return text.replace(/\{\{([^{}]+)\}\}/g, (marker, name: string) => fills[name.trim()] ?? marker);
}

const slotsOf = (file: WorkflowFile, slots: readonly SlotDef[]): PromptSlot[] =>
  slots.map((slot) => ({ ...slot, sample: slotSample(file, slot) }));

/** The rounds of the repeated stage that hands on `output`: its teaching cap, 0 when the stage does not repeat. */
const widthOf = (file: WorkflowFile, output: string): number => {
  const stage = file.stages.find((each) => each.jobs.some((task) => task.output === output));
  return stage?.foreach?.teaching ?? 0;
};

const numbered = (items: readonly string[]): string => items.map((item, at) => `${at + 1}. ${item}`).join('\n');

/** The review's inputs: each slot under its label, its marker in a fenced block; a multiple slot has one per chat. */
function inputsOf(slots: readonly SlotDef[], width: (slot: SlotDef) => number): string {
  const entry = (label: string, marker: string) => `### ${label}\n\n${fenced(`{{${marker}}}`)}`;
  return slots
    .flatMap((slot) =>
      slot.mode === 'single'
        ? [entry(slot.label, slot.id)]
        : Array.from({ length: width(slot) }, (_, at) => entry(`${slot.label} ${at + 1}`, `${slot.id}_${at + 1}`)),
    )
    .join('\n\n');
}

function viewOf(
  step: { sections: readonly SectionDef[]; slots: readonly SlotDef[]; instructions?: string },
  file: WorkflowFile,
): PromptView {
  const { sections, instructions } = step;
  const parts = { sections, slots: slotsOf(file, step.slots) };
  return {
    kind: 'prompt',
    text: joinPrompt(parts, {}),
    sections,
    instructions,
    slots: parts.slots,
    purposes: file.purposes,
    techniques: file.techniques,
  };
}

/** The prompt of the do step for one runtime; a round's `{{item}}` stays in the text, for `roundStep` to fill. */
export function doPrompt(file: WorkflowFile, task: TaskDef, runtime: Runtime): PromptView {
  const fills = { template: fenced(file.templates[task.template] ?? '') };
  const sections = task.do[runtime].map((section) => ({ ...section, text: resolve(section.text, fills) }));
  return viewOf({ sections, slots: task.slots, instructions: task.instructions }, file);
}

/** The prompt of the review step: the general reviewer joined with the task's checks, inputs and template. */
export function reviewPrompt(file: WorkflowFile, task: TaskDef): PromptView {
  const review = task.review ?? { slots: [], checks: [] };
  const fills = {
    template: fenced(file.templates[task.template] ?? ''),
    checks: numbered(review.checks),
    inputs: inputsOf(review.slots, (slot) => widthOf(file, slot.id)),
  };
  const sections = file.reviewer.sections.map((section) => ({ ...section, text: resolve(section.text, fills) }));
  return viewOf({ sections, slots: review.slots, instructions: review.instructions }, file);
}

export interface TaskStep {
  readonly id: 'do' | 'review';
  /** The round's number, on the step `roundStep` made for a round of a repeated stage. */
  readonly chat?: number;
  readonly prompt: PromptView;
}

/** The steps of a task at a runtime: its do prompt, then its review. A repeated stage's rounds are made from them. */
export function stepsOf(file: WorkflowFile, task: TaskDef, runtime: Runtime): TaskStep[] {
  const doStep: TaskStep = { id: 'do', prompt: doPrompt(file, task, runtime) };
  return task.review ? [doStep, { id: 'review', prompt: reviewPrompt(file, task) }] : [doStep];
}

/** What a round shares with the other rounds of its job: the results it takes in and the one it hands on. */
export interface RoundShare {
  /** The names earlier stages hand on: a slot with one of these ids takes a shared result. */
  readonly previous: readonly string[];
  readonly output?: string;
}

/**
 * The step of one round of a repeated stage, made from the job's step: `{{item}}` filled with the round's H3, the
 * round's number on the step, and, in a review, every field that takes no shared result renamed `<id>#<round>` so
 * each round keeps its own.
 */
export function roundStep(step: TaskStep, round: { number: number; item: string }, share: RoundShare): TaskStep {
  const { prompt } = step;
  const shared = (id: string): boolean => step.id === 'do' || share.previous.includes(id) || id === share.output;
  const renamed = new Map(
    (prompt.slots ?? []).filter((slot) => !shared(slot.id)).map((slot) => [slot.id, `${slot.id}#${round.number}`]),
  );
  const fill = (text: string): string =>
    text.replace(/\{\{([^{}]+)\}\}/g, (marker, name: string) => {
      if (name.trim() === 'item') return round.item;
      const to = renamed.get(name.trim());
      return to === undefined ? marker : `{{${to}}}`;
    });
  return {
    ...step,
    chat: round.number,
    prompt: {
      ...prompt,
      text: fill(prompt.text),
      sections: prompt.sections?.map((section) => ({ ...section, text: fill(section.text) })),
      slots: prompt.slots?.map((slot) => ({ ...slot, id: renamed.get(slot.id) ?? slot.id })),
    },
  };
}
