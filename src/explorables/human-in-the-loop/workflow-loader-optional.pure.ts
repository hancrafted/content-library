import { overOf } from './workflow-foreach.pure.ts';
import { producersBefore, producersFor, type Producer } from './workflow-outputs.pure.ts';
import type { StageDef, TaskDef, WorkflowFile } from './workflow-schema.types';

/*
 * The checks of optional jobs and stages: skipping one may never starve a required job or feed it sample data. An
 * optional stage holds optional jobs only; no required job takes an optional job's output, by slot, `needs` or the
 * output its stage repeats over. An optional job may draw on any earlier output. One sentence per problem.
 */

const isOptional = (producer: Producer | undefined): boolean => producer?.task.optional === true;

function stageProblems(stage: StageDef): string[] {
  if (!stage.optional) return [];
  return stage.jobs
    .filter((task) => !task.optional)
    .map((task) => `Stage "${stage.id}" is optional, so its task "${task.id}" must be optional too.`);
}

function taskProblems(file: WorkflowFile, task: TaskDef, index: number): string[] {
  if (task.optional) return [];
  const names = producersFor(file, index, task);
  const slots = [...task.slots, ...(task.review?.slots ?? [])]
    .filter((slot) => !slot.free && isOptional(names.get(slot.id)))
    .map(
      (slot) =>
        `Slot "${slot.id}" of task "${task.id}" takes the output of the optional task "${names.get(slot.id)?.task.id}"; only an optional task may.`,
    );
  const needs = (file.stages[index]?.jobs ?? [])
    .filter((job) => job.optional && task.needs?.includes(job.id))
    .map((job) => `Task "${task.id}" needs the optional task "${job.id}"; only an optional task may.`);
  return [...slots, ...needs];
}

function foreachProblems(file: WorkflowFile, stage: StageDef, index: number): string[] {
  const over = stage.foreach && overOf(stage.foreach);
  const producer = over && producersBefore(file, index).get(over.output);
  if (!over || !isOptional(producer) || stage.jobs.every((task) => task.optional)) return [];
  return [
    `Stage "${stage.id}" repeats over the output "${over.output}" of the optional task "${producer?.task.id}"; only an optional stage may.`,
  ];
}

export const optionalProblems = (file: WorkflowFile): string[] =>
  file.stages.flatMap((stage, index) => [
    ...stageProblems(stage),
    ...foreachProblems(file, stage, index),
    ...stage.jobs.flatMap((task) => taskProblems(file, task, index)),
  ]);
