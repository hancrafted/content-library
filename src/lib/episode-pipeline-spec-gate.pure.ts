/*
 * The Specification Stage's shape (design-ADR-0011): write-spec writes the one
 * Spec page and holds its Gate, write-voice-script has no Gate of its own, the
 * retired write-design-spec is gone, and Build's init job waits for the Spec.
 * Each rule asks only about the jobs a pipeline holds. Called by the schema
 * check for the template and every draft per-run pipeline; an approved per-run
 * pipeline keeps the stage it was approved with, so a Run in flight is not
 * migrated.
 */

import type { Job } from './episode-pipeline-definition.pure';
import { ancestors } from './episode-pipeline-graph.pure';
import { unless } from './finding.pure';

/** Where the Spec page sits, and whether the pipeline is an approved per-run one, whose stage is left as approved. */
export interface SpecGateScope {
  staging: string;
  expanded: boolean;
}

export function checkSpecGate(jobs: readonly Job[], { staging, expanded }: SpecGateScope): string[] {
  if (expanded) return [];
  const byId = new Map(jobs.map((job) => [job.id, job]));
  const voice = byId.get('write-voice-script');
  const spec = byId.get('write-spec');
  const init = byId.get('implement-episode-init');
  const page = `${staging}/spec/spec.html`;
  return [
    ...unless(
      !byId.has('write-design-spec'),
      'Job "write-design-spec" is retired; write-spec designs the Slides and writes the one Spec page (design-ADR-0011).',
    ),
    ...unless(
      voice === undefined || !voice.gate,
      'Job "write-voice-script" has gate: human; the Voice script is reviewed with the Spec, so it has no Gate of its own.',
    ),
    ...unless(
      spec === undefined || spec.gate,
      'Job "write-spec" lacks gate: human; Han approves the Spec at its Gate.',
    ),
    ...unless(
      spec === undefined || spec.outputs.includes(page),
      `Job "write-spec" does not write ${page}; the Spec page is its output.`,
    ),
    ...unless(
      spec === undefined || init === undefined || ancestors(init.id, byId).has(spec.id),
      'Job "implement-episode-init" does not need "write-spec"; Build starts from the approved Spec.',
    ),
  ];
}
