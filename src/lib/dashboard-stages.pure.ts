import type { Span } from '../../skills/new-episode/scripts/run-log.schema.pure';
import type { DashboardJob } from './dashboard-projection.pure';
import { parseDescription } from './episode-spawn-description.pure';

const STAGES = [
  { id: 'brief', jobs: ['brief-grill'] },
  { id: 'setup', jobs: ['categorize-research', 'customize-pipeline'] },
  { id: 'research', jobs: ['retrieval', 'convert-references'] },
  { id: 'dossier', jobs: ['write-dossier', 'write-voice-script'] },
  { id: 'specification', jobs: ['write-spec', 'write-design-spec'] },
  { id: 'build', jobs: ['implement-episode'] },
  { id: 'pr', jobs: ['open-pr'] },
];

export type DashboardState = DashboardJob['state'] | 'unclosed';
export const isComplete = (state: DashboardState): boolean => state === 'ok' || state === 'reused';
const needsAttention = (state: DashboardState): boolean => ['gate', 'error', 'refused', 'crashed'].includes(state);

function groupState(states: DashboardState[]): DashboardState {
  if (states.length === 0) return 'waiting';
  if (states.includes('gate')) return 'gate';
  if (states.includes('running')) return 'running';
  return (
    states.find(needsAttention) ??
    (states.every(isComplete) ? 'ok' : states.includes('unclosed') ? 'unclosed' : 'waiting')
  );
}

/** Presentation grouping only; the pipeline and its real Job dependencies stay unchanged. */
export function projectStages(jobs: readonly DashboardJob[]) {
  const groups = new Map<string, DashboardJob[]>();
  for (const job of jobs) {
    const id = job.id.startsWith('write-research-')
      ? 'research'
      : (STAGES.find((stage) => stage.jobs.includes(job.id))?.id ?? job.id);
    const group = groups.get(id) ?? [];
    group.push(job);
    groups.set(id, group);
  }
  const stages = [...groups].map(([id, grouped]) => ({
    id,
    jobs: grouped,
    state: groupState(grouped.map((job) => job.state)),
    completed: grouped.filter((job) => isComplete(job.state)).length,
    attention: grouped.filter((job) => needsAttention(job.state)).length,
  }));
  return {
    stages,
    completed: stages.filter((stage) => isComplete(stage.state)).length,
    attention: stages.reduce((total, stage) => total + stage.attention, 0),
  };
}

export type DashboardStage = ReturnType<typeof projectStages>['stages'][number];

export function runningAgents(job: DashboardJob): Span[] {
  return job.agents.filter(
    (agent) => agentState(job, agent) === 'running' && (!job.span || agent.trace_id === job.span.trace_id),
  );
}

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

export function agentIdentity(span: Span) {
  const parsed = parseDescription(span.description ?? '');
  if (parsed && parsed.job === span.job) return { ticket: span.ticket ?? parsed.ticket, role: parsed.role };
  return { ticket: span.ticket, role: span.role ?? span.name };
}

/** A lane is an observed ticket's sessions, never an inferred ticket or an estimate of remaining work. */
export function jobLanes(job: DashboardJob) {
  const groups = new Map<number | undefined, Span[]>();
  for (const agent of job.agents) {
    if (job.span && agent.trace_id !== job.span.trace_id) continue;
    const { ticket } = agentIdentity(agent);
    const group = groups.get(ticket) ?? [];
    group.push(agent);
    groups.set(ticket, group);
  }
  return [...groups].map(([ticket, agents]) => {
    const latest = new Map<string, Span>();
    for (const agent of [...agents].sort((a, b) => Date.parse(a.start_t) - Date.parse(b.start_t) || a.seq - b.seq)) {
      latest.set(ticket === undefined ? agent.span_id : agentIdentity(agent).role, agent);
    }
    return { ticket, agents, state: groupState([...latest.values()].map((agent) => agentState(job, agent))) };
  });
}
