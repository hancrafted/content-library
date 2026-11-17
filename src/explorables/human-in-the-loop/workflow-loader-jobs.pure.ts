import { producersOf } from './workflow-outputs.pure.ts';
import type { StageDef, TaskDef, WorkflowFile } from './workflow-schema.types';

export const dupes = (ids: readonly string[]): string[] => ids.filter((id, at) => ids.indexOf(id) !== at);

const SUMMARY_WORDS = 8;

const wordCount = (text: string): number => text.trim().split(/\s+/).length;

export function unneededOutputs(stage: StageDef, task: TaskDef): ReadonlySet<string> {
  const names = new Set<string>();
  for (const job of stage.jobs) {
    if (job.id === task.id || task.needs?.includes(job.id)) continue;
    for (const name of producersOf(job, stage).keys()) names.add(name);
  }
  return names;
}

function sameStageProblems(stage: StageDef, task: TaskDef): string[] {
  const unneeded = unneededOutputs(stage, task);
  return task.slots
    .filter((slot) => !slot.free && unneeded.has(slot.id))
    .map((slot) => {
      const owner = stage.jobs.find((job) => producersOf(job, stage).has(slot.id));
      return `Slot "${slot.id}" of task "${task.id}" takes the output of "${owner?.id}" in its own stage; add it to needs.`;
    });
}

function needsProblems(stage: StageDef, task: TaskDef): string[] {
  const ids = stage.jobs.map((job) => job.id);
  return (task.needs ?? [])
    .filter((id) => !ids.includes(id))
    .map((id) => `Job "${task.id}" needs "${id}", which is not a job of its stage.`);
}

function cycleOf(stage: StageDef): string[] {
  const needs = new Map(stage.jobs.map((job) => [job.id, job.needs ?? []]));
  const visit = (id: string, path: readonly string[]): string[] => {
    if (path.includes(id)) return path.slice(path.indexOf(id));
    for (const next of needs.get(id) ?? []) {
      const found = needs.has(next) ? visit(next, [...path, id]) : [];
      if (found.length > 0) return found;
    }
    return [];
  };
  for (const job of stage.jobs) {
    const found = visit(job.id, []);
    if (found.length > 0) return found;
  }
  return [];
}

function outputProblems(task: TaskDef): string[] {
  const where = `Task "${task.id}"`;
  if (task.output === undefined) return [];
  return [
    ...(task.template === undefined ? [`${where} hands on an output but names no template.`] : []),
    ...(task.details.example === undefined ? [`${where} hands on an output but gives no example.`] : []),
    ...(task.doneLabel === undefined
      ? []
      : [`${where} has a doneLabel but hands on an output; only a checkbox job has one.`]),
  ];
}

function jobFieldProblems(task: TaskDef): string[] {
  const reviewGoalMissing = task.review !== undefined && task.goal.review === undefined;
  return [
    ...outputProblems(task),
    ...(reviewGoalMissing ? [`Task "${task.id}" has a review but no review goal.`] : []),
  ];
}

export function jobOrderProblems(file: WorkflowFile): string[] {
  return file.stages.flatMap((stage) => {
    const cycle = cycleOf(stage);
    const words = stage.summary === undefined ? 0 : wordCount(stage.summary);
    return [
      ...(words > SUMMARY_WORDS
        ? [`The summary of stage "${stage.id}" has ${words} words; at most ${SUMMARY_WORDS}.`]
        : []),
      ...(cycle.length > 0 ? [`Stage "${stage.id}" has a needs cycle: ${cycle.join(', ')}.`] : []),
      ...stage.jobs.flatMap((task) => [
        ...needsProblems(stage, task),
        ...sameStageProblems(stage, task),
        ...jobFieldProblems(task),
      ]),
    ];
  });
}

export function singletonProblems(file: WorkflowFile): string[] {
  const outputs = file.stages.flatMap((stage) => stage.jobs.flatMap((t) => [...producersOf(t, stage).keys()]));
  const gates = file.stages.flatMap((stage) => (stage.gate === undefined ? [] : [String(stage.gate)]));
  return [
    ...dupes(outputs).map((name) => `The output "${name}" is handed on by two tasks.`),
    ...dupes(gates).map((gate) => `The gate ${gate} is held by two stages that can run together.`),
  ];
}
