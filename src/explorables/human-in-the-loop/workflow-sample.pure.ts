import type { SlotDef, WorkflowFile } from './workflow-schema.types';

export function slotSample(file: WorkflowFile, slot: SlotDef): SlotDef['sample'] {
  if (slot.sample !== undefined || !slot.free || slot.blank) return slot.sample;
  const { summary, facts } = file.scenario;
  return [summary, '', ...facts.map((fact) => `- ${fact}`)].join('\n');
}
