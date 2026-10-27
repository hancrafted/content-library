import { markerCount } from '@/shared/components/core-components/try-prompt/prompt-sections.pure';
import { handoffProblems, hasFrontMatter, readTemplate } from './markdown-handoff.pure';
import { unneededOutputs } from './workflow-loader-jobs.pure';
import { limitProblems, slotNameProblems } from './workflow-loader-slots.pure';
import { expandSections, unknownMarkers } from './workflow-markers.pure';
import { producersFor, producersOf, tasksOf, type Producer } from './workflow-outputs.pure';
import { slotSample } from './workflow-sample.pure';
import type { SectionDef, SlotDef, StageDef, TaskDef, WorkflowFile } from './workflow-schema.types';

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
  const outputs = file.stages.flatMap((stage) => stage.jobs.flatMap((t) => [...producersOf(t, stage).keys()]));
  return [
    ...dupes(file.stages.map((stage) => stage.id)).map((id) => `The stage id "${id}" is used twice.`),
    ...dupes(tasks.map((task) => task.id)).map((id) => `The task id "${id}" is used twice.`),
    ...dupes(outputs).map((name) => `The output "${name}" is handed on by two tasks.`),
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
function markersOf(slot: SlotDef, task: TaskDef, width: number): number {
  const asSlot = { id: slot.id, mode: slot.mode, label: slot.label };
  const widths = new Map([[slot.id, width]]);
  return Math.max(
    ...Object.values(task.do).map((sections) => markerCount(asSlot, expandSections(sections, [slot], widths))),
  );
}

function slotNamed(
  slot: SlotDef,
  task: TaskDef,
  scope: { names: ReadonlyMap<string, Producer>; own: ReadonlySet<string> },
): string[] {
  return scope.own.has(slot.id) ? [] : slotNameProblems(slot, task, scope.names.get(slot.id));
}

function doSlotOf(
  file: WorkflowFile,
  task: TaskDef,
  scope: { names: ReadonlyMap<string, Producer>; own: ReadonlySet<string> },
) {
  return (slot: SlotDef): string[] => {
    const producer = scope.names.get(slot.id);
    const named = slotNamed(slot, task, scope);
    if (slotSample(file, slot) === undefined)
      return [...named, `Slot "${slot.id}" of task "${task.id}" needs a sample.`];
    const template = slot.free ? undefined : producer?.task.template;
    const markers = markersOf(slot, task, producer?.stage.foreach?.demo ?? 0);
    return [...named, ...sampleProblems(slot, { file, task, template, markers })];
  };
}

function doSlotProblems(
  file: WorkflowFile,
  task: TaskDef,
  scope: { names: ReadonlyMap<string, Producer>; own: ReadonlySet<string> },
): string[] {
  return [
    ...dupes(task.slots.map((slot) => slot.id)).map((id) => `Task "${task.id}" has the slot "${id}" twice.`),
    ...task.slots.flatMap(doSlotOf(file, task, scope)),
  ];
}

/** A review slot that names no output is a fresh id, and may not reuse one. */
function clashProblems(slot: SlotDef, task: TaskDef, used: ReadonlySet<string>): string[] {
  const clash = slot.id !== task.output && used.has(slot.id);
  return clash ? [`Review slot "${slot.id}" of task "${task.id}" clashes with another id.`] : [];
}

/** One review slot: a fresh id may not clash, a named output is taken in the right mode, a sample fits a template. */
function reviewSlotOf(file: WorkflowFile, task: TaskDef, names: ReadonlyMap<string, Producer>) {
  const used = new Set(tasksOf(file).flatMap((t) => [t.output ?? '', ...t.slots.map((slot) => slot.id)]));
  return (slot: SlotDef): string[] => {
    const producer = names.get(slot.id);
    const basis = {
      file,
      task,
      template: producer?.task.template ?? task.template,
      markers: producer?.stage.foreach?.demo ?? 0,
      noun: 'review slot',
    };
    const named = producer ? slotNameProblems(slot, task, producer) : clashProblems(slot, task, used);
    return [...named, ...sampleProblems(slot, basis)];
  };
}

function reviewSlotProblems(file: WorkflowFile, task: TaskDef, names: ReadonlyMap<string, Producer>): string[] {
  return (task.review?.slots ?? []).flatMap(reviewSlotOf(file, task, names));
}

/** The example of a task: one text, or in a repeated stage a list with one per demo round; each against its template. */
function exampleProblems(file: WorkflowFile, task: TaskDef, stage: StageDef): string[] {
  const { example } = task.details;
  const where = `The example of task "${task.id}"`;
  const rounds = stage.foreach?.demo;
  if (typeof example === 'string') {
    return againstTemplate(file, task.template, { source: example, what: where });
  }
  if (rounds === undefined) return [`${where} is a list but its stage does not repeat.`];
  if (example.length !== rounds) {
    return [`${where} needs ${rounds} examples, one per demo round, and has ${example.length}.`];
  }
  return example.flatMap((source, at) =>
    againstTemplate(file, task.template, { source, what: `The example of round ${at + 1} of task "${task.id}"` }),
  );
}

function markerProblems(task: TaskDef, stage: StageDef, names: ReadonlyMap<string, Producer>): string[] {
  const { slots } = task;
  const repeated = stage.foreach !== undefined;
  const widths = new Map(slots.map((slot) => [slot.id, names.get(slot.id)?.stage.foreach?.demo ?? 0]));
  const limits = Object.keys(task.limits ?? {});
  return Object.entries(task.do).flatMap(([runtime, sections]) =>
    unknownMarkers(sections, { reviewer: false, slots, repeated, widths, limits }).map(
      (marker) => `The ${runtime} prompt of task "${task.id}" has the unknown marker {{${marker}}}.`,
    ),
  );
}

function taskProblems(file: WorkflowFile, task: TaskDef, index: number): string[] {
  const names = producersFor(file, index, task);
  const stage = file.stages[index] as StageDef;
  const own = unneededOutputs(stage, task);
  const known =
    task.template in file.templates ? [] : [`Task "${task.id}" names the unknown template "${task.template}".`];
  return [
    ...known,
    ...doSlotProblems(file, task, { names, own }),
    ...reviewSlotProblems(file, task, names),
    ...markerProblems(task, stage, names),
    ...limitProblems(task, stage),
    ...exampleProblems(file, task, stage),
  ];
}

export function reviewerProblems(file: WorkflowFile): string[] {
  const scope = { reviewer: true, slots: [], repeated: false } as const;
  return unknownMarkers(file.reviewer.sections, scope).map((m) => `The reviewer has the unknown marker {{${m}}}.`);
}

export const contentProblems = (file: WorkflowFile): string[] =>
  file.stages.flatMap((stage, index) => stage.jobs.flatMap((task) => taskProblems(file, task, index)));
