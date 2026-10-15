import { order, skillUses } from '../../skills/new-episode/scripts/run-log-fold.pure';
import type { Score, Span } from '../../skills/new-episode/scripts/run-log.schema.pure';
import { answersTo } from '../../skills/new-episode/scripts/status-skills.pure';
import type { JobAgent } from './episode-pipeline-definition.pure';

/** A skill `pipeline.yml` lists for a Job's agents, in one agent's row or aggregated for the Job box. */
export interface SkillChip {
  name: string;
  state: 'pending' | 'run' | 'skipped';
}

/** A done-check a Job names, read by its latest `check:<name>` Score. */
export interface CheckChip {
  name: string;
  state: 'pending' | 'pass' | 'fail';
}

/** One pipeline agent's row: its listed skills, each in that agent's own state. */
export interface AgentChips {
  type: string;
  session?: 'orchestrator';
  skills: SkillChip[];
}

export interface JobChips {
  /** The Job box: each skill once, run only when every agent listing it ran it, skipped when any skipped it. */
  skills: SkillChip[];
  /** The Job card: one row per agent that lists skills. */
  agents: AgentChips[];
  checks: CheckChip[];
}

/** What the chips are read from: the Job's latest span, its Attempts and agents, and the check Scores it owns. */
export interface ChipEvidence {
  span?: Span;
  attempts: readonly Span[];
  agents: readonly Span[];
  checkScores: readonly Score[];
}

const startOf = (span: Span) => ({ t: span.start_t, seq: span.seq });
const newest = <T>(items: readonly T[], at: (item: T) => { t: string; seq: number }): T | undefined =>
  items.reduce<T | undefined>((last, item) => (last && order(at(item), at(last)) < 0 ? last : item), undefined);

/** Whether a span sits in an earlier Attempt: it is one, or an agent under one. */
function inEarlierAttempt(evidence: ChipEvidence, latest: Span, spanId: string): boolean {
  const attempts = new Set(evidence.attempts.map((attempt) => attempt.span_id));
  attempts.delete(latest.span_id);
  const parent = evidence.agents.find((agent) => agent.span_id === spanId)?.parent_span_id ?? '';
  return attempts.has(spanId) || attempts.has(parent);
}

/**
 * Whether a fact on `spanId` at `t` belongs to the latest Attempt: on it or an agent under it, else on neither an
 * earlier Attempt nor its agents and no older than the latest Attempt's start.
 */
function inLatestAttempt(evidence: ChipEvidence, latest: Span | undefined) {
  return (spanId: string, t: string): boolean => {
    if (latest === undefined || spanId === latest.span_id) return true;
    const parent = evidence.agents.find((agent) => agent.span_id === spanId)?.parent_span_id;
    if (parent === latest.span_id) return true;
    return !inEarlierAttempt(evidence, latest, spanId) && Date.parse(t) >= Date.parse(latest.start_t);
  };
}

/**
 * The Job span as the latest Attempt saw it: its events from that Attempt's start on, and its `skills_invoked`
 * only while the Run has one Attempt, since that list covers the whole Job window.
 */
function jobSpanSince(span: Span, attempts: readonly Span[], latest: Span | undefined): Span {
  if (latest === undefined) return span;
  const events = span.events?.filter((event) => order(event, startOf(latest)) >= 0);
  const { skills_invoked, ...rest } = span;
  return { ...rest, events, ...(attempts.length === 1 && skills_invoked !== undefined && { skills_invoked }) };
}

/** The Job span and the agents of its current Run and latest Attempt; none before the Job has started. */
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

/** One agent's state: run when a span answering to it invoked it; skipped once each such span ended knowing its skills without it. */
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

/** A Job's monitoring chips: each agent's listed skills, those skills once each for the Job box, and its checks. */
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
