import { unknownCheckMarkers } from './workflow-markers.pure.ts';
import type { Producer } from './workflow-outputs.pure';
import { slotSample } from './workflow-sample.pure.ts';
import type { SlotDef, StageDef, TaskDef, WorkflowFile } from './workflow-schema.types';

export function slotNameProblems(slot: SlotDef, task: TaskDef, producer: Producer | undefined): string[] {
  const where = `Slot "${slot.id}" of task "${task.id}"`;
  if (slot.free) return [];
  if (!producer) return [`${where} names no output of an earlier stage.`];
  if (producer.stage.jobs.includes(task)) {
    return slot.mode === 'single'
      ? []
      : [`${where} takes the output of a job of its own stage; its mode must be single.`];
  }
  return modeProblems(slot, producer, where);
}

function modeProblems(slot: SlotDef, producer: Producer, where: string): string[] {
  if (producer.all && slot.mode === 'single')
    return [`${where} takes all rounds of a repeated stage; its mode must be multiple.`];
  if (!producer.all && slot.mode === 'multiple')
    return [`${where} is multiple but its output is not from a repeated stage.`];
  return [];
}

export function limitProblems(task: TaskDef, stage: StageDef): string[] {
  const limits = Object.keys(task.limits ?? {});
  const checks = unknownCheckMarkers(task.review?.checks ?? [], { repeated: stage.foreach !== undefined, limits });
  return [
    ...checks.map((marker) => `The checks of task "${task.id}" have the unknown marker {{${marker}}}.`),
    ...Object.entries(task.limits ?? {})
      .filter(([, limit]) => limit.demo > limit.full)
      .map(([name]) => `The limit "${name}" of task "${task.id}" has a demo value above its full value.`),
  ];
}

export function blankProblems(slot: SlotDef, task: TaskDef): string[] {
  const where = `Slot "${slot.id}" of task "${task.id}"`;
  return [
    ...(slot.free ? [] : [`${where} is blank but not a free input.`]),
    ...(slot.sample === undefined ? [] : [`${where} is blank but has a sample.`]),
  ];
}

export function missingSampleProblems(file: WorkflowFile, slot: SlotDef, task: TaskDef): string[] {
  return slotSample(file, slot) === undefined ? [`Slot "${slot.id}" of task "${task.id}" needs a sample.`] : [];
}
