// decision: docs/adr/0011-episode-design-is-reviewed-as-a-static-html-spec.md
import type { Job } from './episode-pipeline-definition.pure';
import { ancestors } from './episode-pipeline-graph.pure';
import { SPEC_FILE } from './episode-spec-page.pure';
import { unless } from './finding.pure';

export interface SpecGateScope {
  staging: string;
  expanded: boolean;
  reads: ReadonlyMap<string, readonly string[]>;
}

function dossierReadersAfterGate(jobs: readonly Job[], byId: ReadonlyMap<string, Job>, scope: SpecGateScope): string[] {
  const dossier = `${scope.staging}/dossier.md`;
  return jobs
    .filter(({ id }) => ancestors(id, byId).has('write-spec'))
    .filter(({ id }) => (scope.reads.get(id) ?? []).some((path) => path.split('#')[0] === dossier))
    .map(
      ({ id }) => `Job "${id}" reads ${dossier}, which the Spec Gate deletes; after it every job reads the Spec alone.`,
    );
}

function checkStageJobs(byId: ReadonlyMap<string, Job>, staging: string): string[] {
  const voice = byId.get('write-voice-script');
  const spec = byId.get('write-spec');
  const init = byId.get('implement-episode-init');
  const page = `${staging}/${SPEC_FILE}`;
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

const CALIBRATION = 'references/spec-calibration.md';
const RETIRED_ASSETS = ['assets/spec-frame.html', 'assets/spec-review.html'];

function checkSpecReads(spec: Job | undefined, reads: ReadonlyMap<string, readonly string[]>): string[] {
  if (spec === undefined) return [];
  const paths = (reads.get(spec.id) ?? []).map((path) => path.split('#')[0]);
  return [
    ...unless(
      paths.includes(CALIBRATION),
      `Job "write-spec" does not read ${CALIBRATION}; the Spec calibration holds what every Spec shares (design-ADR-0011).`,
    ),
    ...RETIRED_ASSETS.filter((asset) => paths.includes(asset)).map(
      (asset) =>
        `Job "write-spec" reads ${asset}, which the Spec template replaced; it reads the Spec calibration instead (design-ADR-0011).`,
    ),
  ];
}

export function checkSpecGate(jobs: readonly Job[], scope: SpecGateScope): string[] {
  if (scope.expanded) return [];
  const byId = new Map(jobs.map((job) => [job.id, job]));
  return [
    ...checkStageJobs(byId, scope.staging),
    ...checkSpecReads(byId.get('write-spec'), scope.reads),
    ...dossierReadersAfterGate(jobs, byId, scope),
  ];
}
