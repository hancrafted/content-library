import type { PromptSection, PromptSlot } from '@/shared/components/core-components/try-prompt/prompt-sections.pure';
import type { PromptView } from '@/shared/components/core-components/try-prompt/try-prompt.types';
import { joinPrompt } from '../../shared/components/core-components/try-prompt/prompt-sections.pure.ts';
import { expandSections, limitMarker, limitValue } from './workflow-markers.pure.ts';
import { templateOf } from './workflow-outputs.pure.ts';
import { slotSample } from './workflow-sample.pure.ts';
import type { Runtime, SectionDef, SlotDef, TaskDef, WorkflowFile } from './workflow-schema.types';

const skillLines = (skills: readonly string[] | undefined): PromptSection[] =>
  skills === undefined || skills.length === 0 ? [] : [{ text: skills.map((name) => `/${name}`).join('\n') }];

const fenced = (markdown: string): string => `\`\`\`markdown\n${markdown.trimEnd()}\n\`\`\``;

function resolve(text: string, fills: Readonly<Record<string, string>>): string {
  return text.replace(/\{\{([^{}]+)\}\}/g, (marker, name: string) => fills[name.trim()] ?? marker);
}

const slotsOf = (file: WorkflowFile, slots: readonly SlotDef[]): PromptSlot[] =>
  slots.map((slot) => ({ ...slot, sample: slotSample(file, slot) }));

const widthOf = (file: WorkflowFile, output: string): number => {
  const stage = file.stages.find((each) => each.jobs.some((task) => task.output === output));
  return stage?.foreach?.demo ?? 0;
};

export interface PromptOptions {
  readonly demo?: boolean;
  readonly widths?: ReadonlyMap<string, number>;
}

export type PromptMode = Runtime | (PromptOptions & { readonly runtime: Runtime });

const modeOf = (mode: PromptMode): { runtime: Runtime; options: PromptOptions } =>
  typeof mode === 'string' ? { runtime: mode, options: {} } : { runtime: mode.runtime, options: mode };

const limitsOf = (task: TaskDef, options: PromptOptions): Record<string, string> =>
  Object.fromEntries(
    Object.entries(task.limits ?? {}).map(([name, limit]) => [
      limitMarker(name),
      String(limitValue(limit, options.demo ?? true)),
    ]),
  );

const widthsOf = (file: WorkflowFile, slots: readonly SlotDef[], options: PromptOptions): Map<string, number> =>
  new Map(slots.map((slot) => [slot.id, options.widths?.get(slot.id) ?? widthOf(file, slot.id)]));

const numbered = (items: readonly string[]): string => items.map((item, at) => `${at + 1}. ${item}`).join('\n');

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
  step: { sections: readonly PromptSection[]; slots: readonly SlotDef[]; instructions?: string },
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

const forMode = (sections: readonly SectionDef[], options: PromptOptions): SectionDef[] => {
  const other = (options.demo ?? true) ? 'full' : 'demo';
  return sections.filter((section) => section.only !== other);
};

function promptSections(
  file: WorkflowFile,
  task: TaskDef,
  at: { sections: readonly SectionDef[]; skills?: readonly string[]; runtime: Runtime; options: PromptOptions },
): PromptSection[] {
  const { runtime, options } = at;
  const fills = { template: fenced(templateOf(file, task)), ...limitsOf(task, options) };
  const shown = forMode(at.sections, options);
  const expanded = expandSections(shown, task.slots, widthsOf(file, task.slots, options));
  const body = expanded.map((section) => ({ ...section, text: resolve(section.text, fills) }));
  return [...(runtime === 'technical' ? skillLines(at.skills) : []), ...body];
}

export function doPrompt(file: WorkflowFile, task: TaskDef, mode: PromptMode): PromptView {
  const { runtime, options } = modeOf(mode);
  const sections = promptSections(file, task, { sections: task.do[runtime], skills: task.skills, runtime, options });
  return viewOf({ sections, slots: task.slots, instructions: task.instructions }, file);
}

export function thenPrompt(file: WorkflowFile, task: TaskDef, mode: PromptMode): PromptView | undefined {
  const { runtime, options } = modeOf(mode);
  if (task.then === undefined || runtime !== 'technical') return undefined;
  const { skills, sections: own } = task.then;
  const sections = promptSections(file, task, { sections: own, skills, runtime: 'technical', options });
  return viewOf({ sections, slots: [] }, file);
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
    template: fenced(templateOf(file, task)),
    checks: numbered(checks),
    inputs: inputsOf(review.slots, (slot) => widths.get(slot.id) ?? 0),
  };
  const sections = forMode(file.reviewer.sections, options).map((section) => ({
    ...section,
    text: resolve(section.text, fills),
  }));
  return viewOf({ sections, slots: review.slots, instructions: review.instructions }, file);
}

export type StepKind = 'do' | 'review' | 'then';

export interface TaskStep {
  readonly id: StepKind;
  readonly chat?: number;
  readonly prompt: PromptView;
  readonly then?: TaskStep;
  readonly template?: { readonly prompt: PromptView; readonly rewrite: (text: string) => string };
}

export function stepsOf(file: WorkflowFile, task: TaskDef, mode: PromptMode): TaskStep[] {
  const second = thenPrompt(file, task, mode);
  const doStep: TaskStep = {
    id: 'do',
    prompt: doPrompt(file, task, mode),
    ...(second && { then: { id: 'then', prompt: second } }),
  };
  const review: TaskStep = { id: 'review', prompt: reviewPrompt(file, task, mode) };
  return task.review ? [doStep, review] : [doStep];
}

export interface RoundShare {
  readonly previous: readonly string[];
  readonly output?: string;
  readonly sameStage?: readonly string[];
}

function roundName(id: string, at: { step: StepKind; round: number; share: RoundShare }): string | undefined {
  const { step, round, share } = at;
  if (share.sameStage?.includes(id)) return `${id}_${round}`;
  const shared = step === 'do' || step === 'then' || share.previous.includes(id) || id === share.output;
  return shared ? undefined : `${id}#${round}`;
}

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
    ...(step.then && { then: roundStep(step.then, round, share) }),
    chat: round.number,
    template: { prompt, rewrite: fill },
    prompt: {
      ...prompt,
      text: fill(prompt.text),
      sections: prompt.sections?.map((section) => ({ ...section, text: fill(section.text) })),
      slots: prompt.slots?.map((slot) => ({ ...slot, id: renamed.get(slot.id) ?? slot.id })),
    },
  };
}
