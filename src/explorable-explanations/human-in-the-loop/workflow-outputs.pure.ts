import type { StageDef, TaskDef, WorkflowFile } from './workflow-schema.types';

/*
 * What a task hands on, by name. A task's `output` is a name a later slot takes; in a repeated stage `x` hands on
 * `x_1` … `x_N` (N the demo rounds), and `x` itself names them all (a `multiple` slot). Every name points at the producing task.
 */

export interface Producer {
  readonly task: TaskDef;
  readonly stage: StageDef;
  /** The `x` of a repeated stage: it may be taken only by a `multiple` slot. */
  readonly all: boolean;
}

/** The names a task hands on, with what each one is. */
export function producersOf(task: TaskDef, stage: StageDef): ReadonlyMap<string, Producer> {
  const names = new Map<string, Producer>();
  const { output } = task;
  if (output === undefined) return names;
  if (stage.foreach === undefined) return names.set(output, { task, stage, all: false });
  names.set(output, { task, stage, all: true });
  for (let at = 1; at <= stage.foreach.demo; at += 1) names.set(`${output}_${at}`, { task, stage, all: false });
  return names;
}

/** The names handed on by the stages before the `index`th, in order. */
export function producersBefore(file: WorkflowFile, index: number): ReadonlyMap<string, Producer> {
  const names = new Map<string, Producer>();
  for (const stage of file.stages.slice(0, index)) {
    for (const task of stage.jobs) for (const [name, producer] of producersOf(task, stage)) names.set(name, producer);
  }
  return names;
}

/** What a task's slots may take: the earlier stages' outputs, and those of the jobs of its own stage it `needs`. */
export function producersFor(file: WorkflowFile, index: number, task: TaskDef): ReadonlyMap<string, Producer> {
  const names = new Map(producersBefore(file, index));
  const stage = file.stages[index];
  for (const job of stage?.jobs ?? []) {
    if (!task.needs?.includes(job.id)) continue;
    for (const [name, producer] of producersOf(job, stage as StageDef)) names.set(name, producer);
  }
  return names;
}

/** Every task of the file, in drawing order. */
export const tasksOf = (file: WorkflowFile): TaskDef[] => file.stages.flatMap((stage) => stage.jobs);

/** The ids of the tasks a task takes from: the producers of its slots, once each. */
export function producerIdsOf(file: WorkflowFile, stageIndex: number, task: TaskDef): string[] {
  const names = producersFor(file, stageIndex, task);
  const ids = [...(task.needs ?? []), ...task.slots.flatMap((slot) => names.get(slot.id)?.task.id ?? [])];
  return [...new Set(ids)];
}
