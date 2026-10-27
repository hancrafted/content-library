import { producersOf } from './workflow-outputs.pure';
import type { StageDef, TaskDef, WorkflowFile } from './workflow-schema.types';

/*
 * The checks of the order and completeness of a stage's jobs: `needs` ids and cycles, slots that take a same-stage
 * output, an output on every job but the last, the goals and the stage summary. One sentence per problem.
 */

const SUMMARY_WORDS = 8;

const wordCount = (text: string): number => text.trim().split(/\s+/).length;

/** Outputs of the other jobs of the stage that `task` does not need: a slot may not take them. */
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

/** The jobs on a cycle of `needs`, in the order met, or none. */
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

/** Whether `task` is the final job of the last stage. */
const isFinal = (file: WorkflowFile, stage: StageDef, task: TaskDef): boolean =>
  stage === file.stages[file.stages.length - 1] && stage.jobs[stage.jobs.length - 1] === task;

/** Only the final job of the last stage may have no output. A review is optional; one that exists needs its goal. */
function completenessProblems(file: WorkflowFile, stage: StageDef, task: TaskDef): string[] {
  const where = `Task "${task.id}"`;
  const outputMissing = task.output === undefined && !isFinal(file, stage, task);
  const reviewGoalMissing = task.review !== undefined && task.goal.review === undefined;
  return [
    ...(outputMissing ? [`${where} has no output; only the final job of the last stage may have none.`] : []),
    ...(reviewGoalMissing ? [`${where} has a review but no review goal.`] : []),
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
        ...completenessProblems(file, stage, task),
      ]),
    ];
  });
}
