import { unknownCheckMarkers } from './workflow-markers.pure.ts';
import type { Producer } from './workflow-outputs.pure';
import { slotSample } from './workflow-sample.pure.ts';
import type { SlotDef, StageDef, TaskDef, WorkflowFile } from './workflow-schema.types';

/* The checks of what a job's slots take and of the limits its prompts and checks name. One sentence per problem. */

/** The slot's id against what earlier stages hand on: unknown, or taken in the wrong mode. */
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

/** The checks of a review hold only `{{item}}` (in a repeated stage) and the job's limits; a limit's demo value is at most its full one. */
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

/** A blank slot is a free input and carries no sample. */
function blankProblems(slot: SlotDef, task: TaskDef): string[] {
  const where = `Slot "${slot.id}" of task "${task.id}"`;
  return [
    ...(slot.free ? [] : [`${where} is blank but not a free input.`]),
    ...(slot.sample === undefined ? [] : [`${where} is blank but has a sample.`]),
  ];
}

/** The problems of a slot that has no sample to check, or none when it has one: a blank slot, or a slot that lacks its sample. */
export function bareProblems(file: WorkflowFile, slot: SlotDef, task: TaskDef): string[] | undefined {
  if (slot.blank) return blankProblems(slot, task);
  if (slotSample(file, slot) === undefined) return [`Slot "${slot.id}" of task "${task.id}" needs a sample.`];
  return undefined;
}
