import { unknownCheckMarkers } from './workflow-markers.pure';
import type { Producer } from './workflow-outputs.pure';
import type { SlotDef, StageDef, TaskDef } from './workflow-schema.types';

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

/** The checks of a review hold only `{{item}}` (in a repeated stage) and the job's limits; a limit's teaching value is at most its full one. */
export function limitProblems(task: TaskDef, stage: StageDef): string[] {
  const limits = Object.keys(task.limits ?? {});
  const checks = unknownCheckMarkers(task.review?.checks ?? [], { repeated: stage.foreach !== undefined, limits });
  return [
    ...checks.map((marker) => `The checks of task "${task.id}" have the unknown marker {{${marker}}}.`),
    ...Object.entries(task.limits ?? {})
      .filter(([, limit]) => limit.teaching > limit.full)
      .map(([name]) => `The limit "${name}" of task "${task.id}" has a teaching value above its full value.`),
  ];
}
