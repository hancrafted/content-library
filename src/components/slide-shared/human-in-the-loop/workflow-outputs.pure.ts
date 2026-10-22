import type { StageDef, TaskDef, WorkflowFile } from './workflow-schema.types';

/*
 * What a task hands on, by name. A task's `output` is a name a later slot takes; a fan-out `x` of N chats hands on
 * `x_1` … `x_N`, and `x` itself names them all (a `multiple` slot). Every name points at the producing task.
 */

export interface Producer {
  readonly task: TaskDef;
  readonly stage: StageDef;
  /** The `x` of a fan-out: it may be taken only by a `multiple` slot. */
  readonly all: boolean;
}

/** The names a task hands on, with what each one is. */
export function namesOf(task: TaskDef, stage: StageDef): ReadonlyMap<string, Producer> {
  const names = new Map<string, Producer>();
  if (task.fanOut === undefined) return names.set(task.output, { task, stage, all: false });
  names.set(task.output, { task, stage, all: true });
  for (let at = 1; at <= task.fanOut; at += 1) names.set(`${task.output}_${at}`, { task, stage, all: false });
  return names;
}

/** The names handed on by the stages before the `index`th, in order; a later task of the same stage is not earlier. */
export function namesBefore(file: WorkflowFile, index: number): ReadonlyMap<string, Producer> {
  const names = new Map<string, Producer>();
  for (const stage of file.stages.slice(0, index)) {
    for (const task of stage.tasks) for (const [name, producer] of namesOf(task, stage)) names.set(name, producer);
  }
  return names;
}

/** Every task of the file, in drawing order. */
export const tasksOf = (file: WorkflowFile): TaskDef[] => file.stages.flatMap((stage) => stage.tasks);

/** The ids of the tasks a task takes from: the producers of its slots, once each. */
export function sourcesOf(file: WorkflowFile, stageIndex: number, task: TaskDef): string[] {
  const names = namesBefore(file, stageIndex);
  const ids = task.slots.flatMap((slot) => names.get(slot.id)?.task.id ?? []);
  return [...new Set(ids)];
}
