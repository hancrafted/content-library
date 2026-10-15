import type { Span } from '../../skills/new-episode/scripts/run-log.schema.pure';
import type { DashboardJob } from './dashboard-projection.pure';

/** The grouping for a pipeline that lists no `stages`: Runs scaffolded before the stages layer existed. */
const LEGACY_STAGES = [
  { id: 'brief', jobs: ['brief-grill'] },
  {
    id: 'setup',
    jobs: ['scaffold-pipeline', 'categorize-research', 'retrieval', 'convert-references', 'customize-pipeline'],
  },
  { id: 'dossier', jobs: ['write-dossier', 'write-voice-script'] },
  { id: 'specification', jobs: ['write-spec', 'write-design-spec'] },
  { id: 'build', jobs: ['implement-episode', 'implement-episode-init'] },
  { id: 'pr', jobs: ['open-pr'] },
];

function legacyStage(job: DashboardJob): string {
  if (job.id.startsWith('write-research-')) return 'research';
  if (job.id.startsWith('implement-section-')) return 'build';
  return LEGACY_STAGES.find((stage) => stage.jobs.includes(job.id))?.id ?? job.id;
}

export type DashboardState = DashboardJob['state'] | 'unclosed';
export const isComplete = (state: DashboardState): boolean => state === 'ok' || state === 'reused';
export const needsAttention = (state: DashboardState): boolean =>
  ['gate', 'error', 'refused', 'crashed'].includes(state);

/** A Job waiting on Han or ended badly, or whose latest Attempt's reviewer left a line only Han can judge. */
export function jobNeedsAttention(job: Pick<DashboardJob, 'state' | 'attempts' | 'scores'>): boolean {
  if (needsAttention(job.state)) return true;
  const latest = job.attempts.reduce<Span | undefined>(
    (last, span) => (last && last.seq > span.seq ? last : span),
    undefined,
  );
  return (
    latest !== undefined &&
    job.scores.some((score) => score.span_id === latest.span_id && score.value === 'needs-human')
  );
}

function groupState(states: DashboardState[]): DashboardState {
  if (states.length === 0) return 'waiting';
  if (states.includes('gate')) return 'gate';
  if (states.includes('running')) return 'running';
  return (
    states.find(needsAttention) ??
    (states.every(isComplete) ? 'ok' : states.includes('unclosed') ? 'unclosed' : 'waiting')
  );
}

/**
 * Jobs grouped by their `stage` in the pipeline's `stages` order, a listed stage without Jobs kept as not planned
 * yet; a pipeline listing no stages falls back to the legacy grouping. The Jobs and their dependencies stay unchanged.
 */
export function projectStages(jobs: readonly DashboardJob[], order: readonly string[] = []) {
  const groups = new Map<string, DashboardJob[]>(order.map((id) => [id, []]));
  for (const job of jobs) {
    const id = order.length > 0 ? (job.stage ?? legacyStage(job)) : legacyStage(job);
    const group = groups.get(id) ?? [];
    group.push(job);
    groups.set(id, group);
  }
  const stages = [...groups].map(([id, grouped]) => ({
    id,
    jobs: grouped,
    planned: grouped.some((job) => job.foreach === undefined),
    state: groupState(grouped.map((job) => job.state)),
    completed: grouped.filter((job) => isComplete(job.state)).length,
    attention: grouped.filter(jobNeedsAttention).length,
  }));
  return {
    stages,
    completed: stages.filter((stage) => isComplete(stage.state)).length,
    attention: stages.reduce((total, stage) => total + stage.attention, 0),
  };
}

export type DashboardStage = ReturnType<typeof projectStages>['stages'][number];

/** A missing end is not proof of activity once its Job or Attempt has ended; raw folded evidence stays intact. */
export function agentState(job: DashboardJob, agent: Span): DashboardState {
  if (agent.status !== 'running') return agent.status;
  if (job.span && job.span.end_t !== null) return 'unclosed';
  const parent = job.attempts.find((attempt) => attempt.span_id === agent.parent_span_id);
  return parent && parent.end_t !== null ? 'unclosed' : 'running';
}

export function stageLayers(stage: DashboardStage): DashboardJob[][] {
  const jobs = new Map(stage.jobs.map((job) => [job.id, job]));
  const levels = new Map<string, number>();
  const levelOf = (id: string): number => {
    const known = levels.get(id);
    if (known !== undefined) return known;
    const job = jobs.get(id);
    if (!job) return -1;
    levels.set(id, 0);
    const level = Math.max(-1, ...[...job.needs, ...job.wants].map(levelOf)) + 1;
    levels.set(id, level);
    return level;
  };
  const layers: DashboardJob[][] = [];
  for (const job of stage.jobs) (layers[levelOf(job.id)] ??= []).push(job);
  return layers;
}
