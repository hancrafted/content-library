import type { SlotDef, WorkflowFile } from './workflow-schema.types';

/*
 * A slot's sample as the popover shows it: its own, or, for a free input that carries none, the scenario of the
 * file (the summary, then the facts as a list), so the scenario stays the single source of the task text.
 */

export function slotSample(file: WorkflowFile, slot: SlotDef): SlotDef['sample'] {
  if (slot.sample !== undefined || !slot.free) return slot.sample;
  const { summary, facts } = file.scenario;
  return [summary, '', ...facts.map((fact) => `- ${fact}`)].join('\n');
}
