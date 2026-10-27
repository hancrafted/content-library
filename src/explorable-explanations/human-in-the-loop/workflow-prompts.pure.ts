import type { PromptSlot } from '@/shared/components/core-components/try-prompt/prompt-sections.pure';
import { joinPrompt } from '@/shared/components/core-components/try-prompt/prompt-sections.pure';
import type { PromptView } from '@/shared/components/core-components/try-prompt/try-prompt.types';
import { expandSections, limitMarker, limitValue } from './workflow-markers.pure';
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

/** The rounds of the repeated stage that hands on `output`: its demo cap, 0 when the stage does not repeat. */
const widthOf = (file: WorkflowFile, output: string): number => {
  const stage = file.stages.find((each) => each.jobs.some((task) => task.output === output));
  return stage?.foreach?.demo ?? 0;
};

/** How a prompt is made: whether demo mode is on (the limits it names), and the rounds each multiple slot takes. */
export interface PromptOptions {
  /** Demo mode picks each limit's demo value; default on. */
  readonly demo?: boolean;
  /** Per multiple slot id, how many entries `{{id_*}}` expands into; default the demo cap of its repeated stage. */
  readonly widths?: ReadonlyMap<string, number>;
}

/** The runtime alone, or the runtime with how the prompt is made. */
export type PromptMode = Runtime | (PromptOptions & { readonly runtime: Runtime });

const modeOf = (mode: PromptMode): { runtime: Runtime; options: PromptOptions } =>
  typeof mode === 'string' ? { runtime: mode, options: {} } : { runtime: mode.runtime, options: mode };

/** The `{{limit.name}}` fills of a task. */
const limitsOf = (task: TaskDef, options: PromptOptions): Record<string, string> =>
  Object.fromEntries(
    Object.entries(task.limits ?? {}).map(([name, limit]) => [
      limitMarker(name),
      String(limitValue(limit, options.demo ?? true)),
    ]),
  );

/** The rounds each multiple slot of `slots` takes: given, else the demo cap of the stage that hands its output on. */
const widthsOf = (file: WorkflowFile, slots: readonly SlotDef[], options: PromptOptions): Map<string, number> =>
  new Map(slots.map((slot) => [slot.id, options.widths?.get(slot.id) ?? widthOf(file, slot.id)]));

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

/** The sections of the mode: those marked `only` for the other mode are left out. */
const forMode = (sections: readonly SectionDef[], options: PromptOptions): SectionDef[] => {
  const other = (options.demo ?? true) ? 'full' : 'demo';
  return sections.filter((section) => section.only !== other);
};

/** The prompt of the do step for one runtime; a round's `{{item}}` stays in the text, for `roundStep` to fill. */
export function doPrompt(file: WorkflowFile, task: TaskDef, mode: PromptMode): PromptView {
  const { runtime, options } = modeOf(mode);
  const fills = { template: fenced(file.templates[task.template] ?? ''), ...limitsOf(task, options) };
  const shown = forMode(task.do[runtime], options);
  const expanded = expandSections(shown, task.slots, widthsOf(file, task.slots, options));
  const sections = expanded.map((section) => ({ ...section, text: resolve(section.text, fills) }));
  return viewOf({ sections, slots: task.slots, instructions: task.instructions }, file);
}

/**
 * The prompt of the review step: the general reviewer joined with the task's checks, inputs and template. A check that
 * names `{{item}}` is about one round; the CLI prompt reviews every round at once, so it leaves those checks out.
 */
export function reviewPrompt(file: WorkflowFile, task: TaskDef, mode: PromptMode = 'simple'): PromptView {
  const { runtime, options } = modeOf(mode);
  const review = task.review ?? { slots: [], checks: [] };
  const limits = limitsOf(task, options);
  const checks = review.checks
    .filter((check) => runtime === 'simple' || !check.includes('{{item}}'))
    .map((check) => resolve(check, limits));
  const widths = widthsOf(file, review.slots, options);
  const fills = {
    template: fenced(file.templates[task.template] ?? ''),
    checks: numbered(checks),
    inputs: inputsOf(review.slots, (slot) => widths.get(slot.id) ?? 0),
  };
  const sections = forMode(file.reviewer.sections, options).map((section) => ({
    ...section,
    text: resolve(section.text, fills),
  }));
  return viewOf({ sections, slots: review.slots, instructions: review.instructions }, file);
}

export interface TaskStep {
  readonly id: 'do' | 'review';
  /** The round's number, on the step `roundStep` made for a round of a repeated stage. */
  readonly chat?: number;
  readonly prompt: PromptView;
}

/** The steps of a task at a runtime: its do prompt, then its review. A repeated stage's rounds are made from them. */
export function stepsOf(file: WorkflowFile, task: TaskDef, mode: PromptMode): TaskStep[] {
  const doStep: TaskStep = { id: 'do', prompt: doPrompt(file, task, mode) };
  const review: TaskStep = { id: 'review', prompt: reviewPrompt(file, task, mode) };
  return task.review ? [doStep, review] : [doStep];
}

/** What a round shares with the other rounds of its job: the results it takes in and the one it hands on. */
export interface RoundShare {
  /** The names earlier stages hand on: a slot with one of these ids takes a shared result. */
  readonly previous: readonly string[];
  readonly output?: string;
  /** The outputs of the jobs of the same stage this job needs: a slot with one of these ids takes the round's own result. */
  readonly sameStage?: readonly string[];
}

/** What a field is called in round `round`: its own round's result (`id_K`), its own field (`id#K`), or shared (none). */
function roundName(id: string, at: { step: TaskStep['id']; round: number; share: RoundShare }): string | undefined {
  const { step, round, share } = at;
  if (share.sameStage?.includes(id)) return `${id}_${round}`;
  const shared = step === 'do' || share.previous.includes(id) || id === share.output;
  return shared ? undefined : `${id}#${round}`;
}

/**
 * The step of one round of a repeated stage, made from the job's step: `{{item}}` filled with the round's H3, the
 * round's number on the step, and, in a review, every field that takes no shared result renamed `<id>#<round>` so
 * each round keeps its own.
 */
export function roundStep(step: TaskStep, round: { number: number; item: string }, share: RoundShare): TaskStep {
  const { prompt } = step;
  const renamed = new Map(
    (prompt.slots ?? []).flatMap((slot): [string, string][] => {
      const to = roundName(slot.id, { step: step.id, round: round.number, share });
      return to === undefined ? [] : [[slot.id, to]];
    }),
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
