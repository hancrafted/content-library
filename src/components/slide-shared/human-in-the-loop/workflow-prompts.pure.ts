import type { PromptSlot } from '../core-components/try-prompt/prompt-sections.pure';
import { joinPrompt } from '../core-components/try-prompt/prompt-sections.pure';
import type { PromptView } from '../core-components/try-prompt/try-prompt.types';
import { tasksOf } from './workflow-outputs.pure';
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

const slotsOf = (slots: readonly SlotDef[]): PromptSlot[] => slots.map((slot) => ({ ...slot }));

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

function viewOf(sections: readonly SectionDef[], slots: readonly SlotDef[], file: WorkflowFile): PromptView {
  const parts = { sections, slots: slotsOf(slots) };
  return { kind: 'prompt', text: joinPrompt(parts, {}), sections, slots: parts.slots, purposes: file.purposes };
}

/** The prompt of the do step for one runtime; `chat` is the fan-out chat's number, 1 for a single chat. */
export function doPrompt(file: WorkflowFile, task: TaskDef, at: { runtime: Runtime; chat: number }): PromptView {
  const { runtime, chat } = at;
  const fills = { n: String(chat), template: fenced(file.templates[task.template] ?? '') };
  const sections = task.do[runtime].map((section) => ({ ...section, text: resolve(section.text, fills) }));
  return viewOf(sections, task.slots, file);
}

/** The prompt of the review step: the general reviewer joined with the task's checks, inputs and template. */
export function reviewPrompt(file: WorkflowFile, task: TaskDef): PromptView {
  const review = task.review ?? { slots: [], checks: [] };
  const fills = {
    template: fenced(file.templates[task.template] ?? ''),
    checks: numbered(review.checks),
    inputs: inputsOf(review.slots, (slot) => tasksOf(file).find((each) => each.output === slot.id)?.fanOut ?? 0),
  };
  const sections = file.reviewer.sections.map((section) => ({ ...section, text: resolve(section.text, fills) }));
  return viewOf(sections, review.slots, file);
}

export interface TaskStep {
  readonly id: 'do' | 'review';
  /** The fan-out chat's number, for a Simple do step of a fanned-out task. */
  readonly chat?: number;
  readonly prompt: PromptView;
}

/** The steps of a task at a runtime: its do prompt (one per chat in Simple), then its review. */
export function stepsOf(file: WorkflowFile, task: TaskDef, runtime: Runtime): TaskStep[] {
  const chats = runtime === 'simple' && task.fanOut !== undefined ? task.fanOut : 0;
  const doSteps: TaskStep[] =
    chats > 0
      ? Array.from({ length: chats }, (_, at) => ({
          id: 'do',
          chat: at + 1,
          prompt: doPrompt(file, task, { runtime, chat: at + 1 }),
        }))
      : [{ id: 'do', prompt: doPrompt(file, task, { runtime, chat: 1 }) }];
  return task.review ? [...doSteps, { id: 'review', prompt: reviewPrompt(file, task) }] : doSteps;
}
