import { handoffProblems, readTemplate } from './markdown-handoff.pure';
import { unknownMarkers } from './workflow-markers.pure';
import { namesBefore, namesOf, tasksOf, type Producer } from './workflow-outputs.pure';
import type { SlotDef, TaskDef, WorkflowFile } from './workflow-schema.types';

/*
 * The meaning checks of a Workflow file whose shape already holds: templates, ids, slots naming earlier outputs,
 * markers, and every sample and example against its template. One sentence per problem.
 */

const dupes = (ids: readonly string[]): string[] => ids.filter((id, at) => ids.indexOf(id) !== at);

export function templateProblems(file: WorkflowFile): string[] {
  return Object.entries(file.templates).flatMap(([key, source]) => {
    const read = readTemplate(source);
    return [
      ...(read.kind === key ? [] : [`Template "${key}" must have the front matter kind "${key}".`]),
      ...(read.h1 === undefined ? [`Template "${key}" has no H1.`] : []),
      ...(/\{\{/.test(source) ? [`Template "${key}" holds a {{marker}}; templates are plain markdown.`] : []),
    ];
  });
}

export function idProblems(file: WorkflowFile): string[] {
  const tasks = tasksOf(file);
  const outputs = file.stages.flatMap((stage) => stage.tasks.flatMap((t) => [...namesOf(t, stage).keys()]));
  return [
    ...dupes(file.stages.map((stage) => stage.id)).map((id) => `The stage id "${id}" is used twice.`),
    ...dupes(tasks.map((task) => task.id)).map((id) => `The task id "${id}" is used twice.`),
    ...dupes(outputs).map((name) => `The output "${name}" is handed on by two tasks.`),
    ...tasks
      .filter((task) => task.fanOut !== undefined && task.fanOut < 2)
      .map((task) => `Task "${task.id}" has fanOut ${task.fanOut}; it must be at least 2.`),
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
  if (!producer) return [`${where} names no output of an earlier stage.`];
  if (producer.all && slot.mode === 'single')
    return [`${where} takes all chats of a fan-out; its mode must be multiple.`];
  if (!producer.all && slot.mode === 'multiple') return [`${where} is multiple but its output is not a fan-out.`];
  return [];
}

function doSlotProblems(file: WorkflowFile, task: TaskDef, names: ReadonlyMap<string, Producer>): string[] {
  return [
    ...dupes(task.slots.map((slot) => slot.id)).map((id) => `Task "${task.id}" has the slot "${id}" twice.`),
    ...task.slots.flatMap((slot) => {
      const producer = names.get(slot.id);
      const named = slotNameProblems(slot, task, producer);
      const where = `The sample of slot "${slot.id}" of task "${task.id}"`;
      if (slot.sample === undefined) return [...named, `Slot "${slot.id}" of task "${task.id}" needs a sample.`];
      return [
        ...named,
        ...(producer ? againstTemplate(file, producer.task.template, { source: slot.sample, what: where }) : []),
      ];
    }),
  ];
}

/** One review slot: a fresh id may not clash, a named output is taken in the right mode, a sample fits a template. */
function reviewSlotOf(file: WorkflowFile, task: TaskDef, names: ReadonlyMap<string, Producer>) {
  const used = new Set(tasksOf(file).flatMap((t) => [t.output, ...t.slots.map((slot) => slot.id)]));
  return (slot: SlotDef): string[] => {
    const producer = names.get(slot.id);
    const fresh = !producer && slot.id !== task.output;
    const clash =
      fresh && used.has(slot.id) ? [`Review slot "${slot.id}" of task "${task.id}" clashes with another id.`] : [];
    const named = producer ? slotNameProblems(slot, task, producer) : [];
    const what = `The sample of review slot "${slot.id}" of task "${task.id}"`;
    const key = producer?.task.template ?? task.template;
    return [...clash, ...named, ...againstTemplate(file, key, { source: slot.sample, what })];
  };
}

function reviewSlotProblems(file: WorkflowFile, task: TaskDef, names: ReadonlyMap<string, Producer>): string[] {
  return (task.review?.slots ?? []).flatMap(reviewSlotOf(file, task, names));
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
  const names = namesBefore(file, index);
  const known =
    task.template in file.templates ? [] : [`Task "${task.id}" names the unknown template "${task.template}".`];
  return [
    ...known,
    ...doSlotProblems(file, task, names),
    ...reviewSlotProblems(file, task, names),
    ...markerProblems(task, names),
    ...againstTemplate(file, task.template, { source: task.details.example, what: `The example of task "${task.id}"` }),
  ];
}

export function reviewerProblems(file: WorkflowFile): string[] {
  const place = { reviewer: true, slots: [], fanOut: undefined } as const;
  return unknownMarkers(file.reviewer.sections, place).map((m) => `The reviewer has the unknown marker {{${m}}}.`);
}

export const contentProblems = (file: WorkflowFile): string[] =>
  file.stages.flatMap((stage, index) => stage.tasks.flatMap((task) => taskProblems(file, task, index)));
