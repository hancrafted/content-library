import { markerCount } from '@/shared/components/core-components/try-prompt/prompt-sections.pure';
import { handoffProblems, hasFrontMatter, readTemplate } from './markdown-handoff.pure';
import { unknownMarkers } from './workflow-markers.pure';
import { producersBefore, producersOf, tasksOf, type Producer } from './workflow-outputs.pure';
import { slotSample } from './workflow-sample.pure';
import type { SectionDef, SlotDef, TaskDef, WorkflowFile } from './workflow-schema.types';

/*
 * The meaning checks of a Workflow file whose shape already holds: templates, ids, slots naming earlier outputs,
 * markers, and every sample and example against its template. One sentence per problem.
 */

const dupes = (ids: readonly string[]): string[] => ids.filter((id, at) => ids.indexOf(id) !== at);

export function templateProblems(file: WorkflowFile): string[] {
  return Object.entries(file.templates).flatMap(([key, source]) => {
    const read = readTemplate(source);
    return [
      ...(hasFrontMatter(source) ? [`Template "${key}" has front matter; a template starts with its H1.`] : []),
      ...(read.h1 === undefined ? [`Template "${key}" has no H1.`] : []),
      ...(/\{\{/.test(source) ? [`Template "${key}" holds a {{marker}}; templates are plain markdown.`] : []),
    ];
  });
}

export function idProblems(file: WorkflowFile): string[] {
  const tasks = tasksOf(file);
  const outputs = file.stages.flatMap((stage) => stage.tasks.flatMap((t) => [...producersOf(t, stage).keys()]));
  return [
    ...dupes(file.stages.map((stage) => stage.id)).map((id) => `The stage id "${id}" is used twice.`),
    ...dupes(tasks.map((task) => task.id)).map((id) => `The task id "${id}" is used twice.`),
    ...dupes(outputs).map((name) => `The output "${name}" is handed on by two tasks.`),
    ...tasks
      .filter((task) => task.fanOut !== undefined && task.fanOut < 2)
      .map((task) => `Task "${task.id}" has fanOut ${task.fanOut}; it must be at least 2.`),
  ];
}

/** Technique ids used twice in the catalogue, and every reference to an id the catalogue lacks. */
export function techniqueProblems(file: WorkflowFile): string[] {
  const known = new Set(file.techniques.map((entry) => entry.id));
  const unknown = (where: string, ids: readonly string[] | undefined): string[] =>
    (ids ?? []).filter((id) => !known.has(id)).map((id) => `${where} names the unknown technique "${id}".`);
  const sections = (where: string, list: readonly SectionDef[]): string[] =>
    list.flatMap((section) => unknown(`Section "${section.heading}" of ${where}`, section.techniques));
  return [
    ...dupes(file.techniques.map((entry) => entry.id)).map((id) => `The technique id "${id}" is used twice.`),
    ...sections('the reviewer', file.reviewer.sections),
    ...tasksOf(file).flatMap((task) => [
      ...sections(`the simple prompt of task "${task.id}"`, task.do.simple),
      ...sections(`the technical prompt of task "${task.id}"`, task.do.technical),
      ...unknown(`The details of task "${task.id}"`, task.details.techniques),
    ]),
  ];
}

/** A sample or example `source` held up to the template `key`. */
function againstTemplate(
  file: WorkflowFile,
  key: string,
  held: { source: string | undefined; what: string },
): string[] {
  const { source, what } = held;
  const template = file.templates[key];
  if (source === undefined) return [];
  if (template === undefined) return [];
  return handoffProblems(source, readTemplate(template)).map((problem) => `${what} ${problem}.`);
}

/** The slot's id against what earlier stages hand on: unknown, or taken in the wrong mode. */
function slotNameProblems(slot: SlotDef, task: TaskDef, producer: Producer | undefined): string[] {
  const where = `Slot "${slot.id}" of task "${task.id}"`;
  if (slot.free) return [];
  if (!producer) return [`${where} names no output of an earlier stage.`];
  if (producer.all && slot.mode === 'single')
    return [`${where} takes all chats of a fan-out; its mode must be multiple.`];
  if (!producer.all && slot.mode === 'multiple') return [`${where} is multiple but its output is not a fan-out.`];
  return [];
}

/** What a slot's samples are held to: the file and task, its template (none for a free input), its marker count. */
interface SampleBasis {
  readonly file: WorkflowFile;
  readonly task: TaskDef;
  readonly template: string | undefined;
  readonly markers: number;
  /** `slot` or `review slot`, as the problem names it. */
  readonly noun?: string;
}

const plural = (count: number, word: string): string => `${count} ${word}${count === 1 ? '' : 's'}`;

/** The entries of a multiple slot's list: their count against its markers, each against the template. */
function entryProblems(slot: SlotDef, list: readonly string[], basis: SampleBasis): string[] {
  const { file, task, template } = basis;
  const where = `Slot "${slot.id}" of task "${task.id}"`;
  if (list.length !== basis.markers) {
    return [`${where} has ${plural(list.length, 'sample')} but ${plural(basis.markers, 'marker')}.`];
  }
  const noun = basis.noun ?? 'slot';
  return list.flatMap((source, at) =>
    template === undefined
      ? []
      : againstTemplate(file, template, {
          source,
          what: `The sample of entry ${at + 1} of ${noun} "${slot.id}" of task "${task.id}"`,
        }),
  );
}

/** The sample of one slot: a lone text for a single slot, a list of one per marker for a multiple slot. */
function sampleProblems(slot: SlotDef, basis: SampleBasis): string[] {
  const { file, task, template } = basis;
  const sample = slotSample(file, slot);
  const where = `Slot "${slot.id}" of task "${task.id}"`;
  const lone = typeof sample === 'string';
  if (sample === undefined) return [];
  if (slot.mode === 'multiple') {
    return lone
      ? [`${where} is multiple and needs a list of samples, one per marker.`]
      : entryProblems(slot, sample, basis);
  }
  if (!lone) return [`${where} is single but has a list of samples.`];
  if (template === undefined) return [];
  const what = `The sample of ${basis.noun ?? 'slot'} "${slot.id}" of task "${task.id}"`;
  return againstTemplate(file, template, { source: sample, what });
}

/** The markers a multiple slot has in a task's prompts: the most any runtime's sections number. */
function markersOf(slot: SlotDef, task: TaskDef): number {
  const asSlot = { id: slot.id, mode: slot.mode, label: slot.label };
  return Math.max(...Object.values(task.do).map((sections) => markerCount(asSlot, sections)));
}

function doSlotProblems(file: WorkflowFile, task: TaskDef, names: ReadonlyMap<string, Producer>): string[] {
  return [
    ...dupes(task.slots.map((slot) => slot.id)).map((id) => `Task "${task.id}" has the slot "${id}" twice.`),
    ...task.slots.flatMap((slot) => {
      const producer = names.get(slot.id);
      const named = slotNameProblems(slot, task, producer);
      if (slotSample(file, slot) === undefined)
        return [...named, `Slot "${slot.id}" of task "${task.id}" needs a sample.`];
      const template = slot.free ? undefined : producer?.task.template;
      return [...named, ...sampleProblems(slot, { file, task, template, markers: markersOf(slot, task) })];
    }),
  ];
}

/** A review slot that names no output is a fresh id, and may not reuse one. */
function clashProblems(slot: SlotDef, task: TaskDef, used: ReadonlySet<string>): string[] {
  const clash = slot.id !== task.output && used.has(slot.id);
  return clash ? [`Review slot "${slot.id}" of task "${task.id}" clashes with another id.`] : [];
}

/** One review slot: a fresh id may not clash, a named output is taken in the right mode, a sample fits a template. */
function reviewSlotOf(file: WorkflowFile, task: TaskDef, names: ReadonlyMap<string, Producer>) {
  const used = new Set(tasksOf(file).flatMap((t) => [t.output, ...t.slots.map((slot) => slot.id)]));
  return (slot: SlotDef): string[] => {
    const producer = names.get(slot.id);
    const basis = {
      file,
      task,
      template: producer?.task.template ?? task.template,
      markers: producer?.task.fanOut ?? 0,
      noun: 'review slot',
    };
    const named = producer ? slotNameProblems(slot, task, producer) : clashProblems(slot, task, used);
    return [...named, ...sampleProblems(slot, basis)];
  };
}

function reviewSlotProblems(file: WorkflowFile, task: TaskDef, names: ReadonlyMap<string, Producer>): string[] {
  return (task.review?.slots ?? []).flatMap(reviewSlotOf(file, task, names));
}

/** The example of a task: one text, or for a fan-out a list with one per chat; each against the task's template. */
function exampleProblems(file: WorkflowFile, task: TaskDef): string[] {
  const { example } = task.details;
  const where = `The example of task "${task.id}"`;
  const chats = task.fanOut;
  if (typeof example === 'string') {
    return againstTemplate(file, task.template, { source: example, what: where });
  }
  if (chats === undefined) return [`${where} is a list but the task has no fan-out.`];
  if (example.length !== chats) return [`${where} needs ${chats} examples, one per chat, and has ${example.length}.`];
  return example.flatMap((source, at) =>
    againstTemplate(file, task.template, { source, what: `The example of chat ${at + 1} of task "${task.id}"` }),
  );
}

function markerProblems(task: TaskDef, names: ReadonlyMap<string, Producer>): string[] {
  const { slots, fanOut } = task;
  const widths = new Map(slots.map((slot) => [slot.id, names.get(slot.id)?.task.fanOut ?? 0]));
  return Object.entries(task.do).flatMap(([runtime, sections]) =>
    unknownMarkers(sections, { reviewer: false, slots, fanOut, widths }).map(
      (marker) => `The ${runtime} prompt of task "${task.id}" has the unknown marker {{${marker}}}.`,
    ),
  );
}

function taskProblems(file: WorkflowFile, task: TaskDef, index: number): string[] {
  const names = producersBefore(file, index);
  const known =
    task.template in file.templates ? [] : [`Task "${task.id}" names the unknown template "${task.template}".`];
  return [
    ...known,
    ...doSlotProblems(file, task, names),
    ...reviewSlotProblems(file, task, names),
    ...markerProblems(task, names),
    ...exampleProblems(file, task),
  ];
}

export function reviewerProblems(file: WorkflowFile): string[] {
  const scope = { reviewer: true, slots: [], fanOut: undefined } as const;
  return unknownMarkers(file.reviewer.sections, scope).map((m) => `The reviewer has the unknown marker {{${m}}}.`);
}

export const contentProblems = (file: WorkflowFile): string[] =>
  file.stages.flatMap((stage, index) => stage.tasks.flatMap((task) => taskProblems(file, task, index)));
