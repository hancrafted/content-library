import type { JobAgent } from './episode-pipeline-definition.pure';
import { order, skillUses } from './run-log-fold.pure';
import type { Score, Span } from './run-log.schema.pure';
import { answersTo } from './status-skills.pure';

export interface SkillChip {
  name: string;
  state: 'pending' | 'run' | 'skipped';
}

export interface CheckChip {
  name: string;
  state: 'pending' | 'pass' | 'fail';
}

export interface AgentChips {
  type: string;
  session?: 'orchestrator';
  skills: SkillChip[];
}

export interface JobChips {
  skills: SkillChip[];
  agents: AgentChips[];
  checks: CheckChip[];
}

export interface ChipEvidence {
  span?: Span;
  attempts: readonly Span[];
  agents: readonly Span[];
  checkScores: readonly Score[];
}

const startOf = (span: Span) => ({ t: span.start_t, seq: span.seq });
const newest = <T>(items: readonly T[], at: (item: T) => { t: string; seq: number }): T | undefined =>
  items.reduce<T | undefined>((last, item) => (last && order(at(item), at(last)) < 0 ? last : item), undefined);

function inEarlierAttempt(evidence: ChipEvidence, latest: Span, spanId: string): boolean {
  const attempts = new Set(evidence.attempts.map((attempt) => attempt.span_id));
  attempts.delete(latest.span_id);
  const parent = evidence.agents.find((agent) => agent.span_id === spanId)?.parent_span_id ?? '';
  return attempts.has(spanId) || attempts.has(parent);
}

function inLatestAttempt(evidence: ChipEvidence, latest: Span | undefined) {
  return (spanId: string, t: string): boolean => {
    if (latest === undefined || spanId === latest.span_id) return true;
    const parent = evidence.agents.find((agent) => agent.span_id === spanId)?.parent_span_id;
    if (parent === latest.span_id) return true;
    return !inEarlierAttempt(evidence, latest, spanId) && Date.parse(t) >= Date.parse(latest.start_t);
  };
}

function jobSpanSince(span: Span, attempts: readonly Span[], latest: Span | undefined): Span {
  if (latest === undefined) return span;
  const events = span.events?.filter((event) => order(event, startOf(latest)) >= 0);
  const { skills_invoked, ...rest } = span;
  return { ...rest, events, ...(attempts.length === 1 && skills_invoked !== undefined && { skills_invoked }) };
}

function scope(evidence: ChipEvidence) {
  const { span } = evidence;
  if (span === undefined) return { spans: [], scores: [] };
  const attempts = evidence.attempts.filter((attempt) => attempt.trace_id === span.trace_id);
  const latest = newest(attempts, startOf);
  const current = inLatestAttempt(evidence, latest);
  const agents = evidence.agents.filter(
    (agent) => agent.trace_id === span.trace_id && current(agent.span_id, agent.start_t),
  );
  const scores = evidence.checkScores.filter(
    (score) => score.trace_id === span.trace_id && current(score.span_id, score.t),
  );
  return { spans: [jobSpanSince(span, attempts, latest), ...agents], scores };
}

const invoked = (span: Span, name: string): boolean =>
  skillUses(span).some((use) => use.name === name) || (span.skills_invoked ?? []).includes(name);

function skillState(name: string, agent: JobAgent, spans: readonly Span[]): SkillChip['state'] {
  const answering = spans.filter((span) => answersTo(span, agent));
  if (answering.some((span) => invoked(span, name))) return 'run';
  const known = answering.every((span) => span.end_t !== null && span.skills_invoked !== undefined);
  return answering.length > 0 && known ? 'skipped' : 'pending';
}

function aggregate(states: readonly SkillChip['state'][]): SkillChip['state'] {
  if (states.includes('skipped')) return 'skipped';
  return states.every((state) => state === 'run') ? 'run' : 'pending';
}

function checkState(name: string, scores: readonly Score[]): CheckChip['state'] {
  const latest = newest(
    scores.filter((score) => score.name === 'check' && score.source === `check:${name}`),
    (score) => score,
  );
  if (latest?.value === 'pass') return 'pass';
  return latest?.value === 'fail' ? 'fail' : 'pending';
}

export function jobChips(
  config: { agents: readonly JobAgent[]; checks: readonly string[] },
  evidence: ChipEvidence,
): JobChips {
  const { spans, scores } = scope(evidence);
  const agents = config.agents
    .filter((agent) => agent.skills.length > 0)
    .map((agent) => ({
      type: agent.type,
      ...(agent.session && { session: agent.session }),
      skills: [...new Set(agent.skills)].map((name) => ({ name, state: skillState(name, agent, spans) })),
    }));
  const names = [...new Set(agents.flatMap((row) => row.skills.map((chip) => chip.name)))];
  return {
    skills: names.map((name) => ({
      name,
      state: aggregate(
        agents.flatMap((row) => row.skills.filter((chip) => chip.name === name).map((chip) => chip.state)),
      ),
    })),
    agents,
    checks: config.checks.map((name) => ({ name, state: checkState(name, scores) })),
  };
}
