import { overOf } from './workflow-foreach.pure.ts';
import { isOptionalTask, producersBefore, producersFor, type Producer } from './workflow-outputs.pure.ts';
import type { StageDef, TaskDef, WorkflowFile } from './workflow-schema.types';

const isOptionalProducer = (producer: Producer | undefined): boolean =>
  producer !== undefined && isOptionalTask(producer.task);

function stageProblems(stage: StageDef): string[] {
  if (!stage.optional) return [];
  return stage.jobs
    .filter((task) => !isOptionalTask(task))
    .map((task) => `Stage "${stage.id}" is optional, so its task "${task.id}" must be optional too.`);
}

function taskProblems(file: WorkflowFile, task: TaskDef, index: number): string[] {
  if (isOptionalTask(task)) return [];
  const producers = producersFor(file, index, task);
  const slots = [...task.slots, ...(task.review?.slots ?? [])]
    .filter((slot) => !slot.free && isOptionalProducer(producers.get(slot.id)))
    .map(
      (slot) =>
        `Slot "${slot.id}" of task "${task.id}" takes the output of the optional task "${producers.get(slot.id)?.task.id}"; only an optional task may.`,
    );
  const needs = (file.stages[index]?.jobs ?? [])
    .filter((job) => isOptionalTask(job) && task.needs?.includes(job.id))
    .map((job) => `Task "${task.id}" needs the optional task "${job.id}"; only an optional task may.`);
  return [...slots, ...needs];
}

function foreachProblems(file: WorkflowFile, stage: StageDef, index: number): string[] {
  const over = stage.foreach && overOf(stage.foreach);
  const producer = over && producersBefore(file, index).get(over.output);
  if (!over || !isOptionalProducer(producer) || stage.jobs.every(isOptionalTask)) return [];
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
