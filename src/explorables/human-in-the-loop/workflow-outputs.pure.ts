import type { StageDef, TaskDef, WorkflowFile } from './workflow-schema.types';

export const templateOf = (file: WorkflowFile, task: TaskDef): string =>
  task.template === undefined ? '' : (file.templates[task.template] ?? '');

export interface Producer {
  readonly task: TaskDef;
  readonly stage: StageDef;
  readonly all: boolean;
}

export function producersOf(task: TaskDef, stage: StageDef): ReadonlyMap<string, Producer> {
  const names = new Map<string, Producer>();
  const { output } = task;
  if (output === undefined) return names;
  if (stage.foreach === undefined) return names.set(output, { task, stage, all: false });
  names.set(output, { task, stage, all: true });
  for (let at = 1; at <= stage.foreach.demo; at += 1) names.set(`${output}_${at}`, { task, stage, all: false });
  return names;
}

export function producersBefore(file: WorkflowFile, index: number): ReadonlyMap<string, Producer> {
  const names = new Map<string, Producer>();
  for (const stage of file.stages.slice(0, index)) {
    for (const task of stage.jobs) for (const [name, producer] of producersOf(task, stage)) names.set(name, producer);
  }
  return names;
}

export function producersFor(file: WorkflowFile, index: number, task: TaskDef): ReadonlyMap<string, Producer> {
  const names = new Map(producersBefore(file, index));
  const stage = file.stages[index];
  for (const job of stage?.jobs ?? []) {
    if (!task.needs?.includes(job.id)) continue;
    for (const [name, producer] of producersOf(job, stage as StageDef)) names.set(name, producer);
  }
  return names;
}

export const tasksOf = (file: WorkflowFile): TaskDef[] => file.stages.flatMap((stage) => stage.jobs);

export function producerIdsOf(file: WorkflowFile, stageIndex: number, task: TaskDef): string[] {
  const names = producersFor(file, stageIndex, task);
  const ids = [...(task.needs ?? []), ...task.slots.flatMap((slot) => names.get(slot.id)?.task.id ?? [])];
  return [...new Set(ids)];
}

export const isOptionalTask = (task: TaskDef): boolean => task.optional === true;
