import type { Score, Span } from '../../skills/new-episode/scripts/run-log.schema.pure';
import { answersTo } from '../../skills/new-episode/scripts/status-skills.pure';
import type { JobAgent } from './episode-pipeline-jobs.pure';

/** A skill `pipeline.yml` lists for a Job's agents: `agents` names the agent types listing it, once each. */
export interface SkillChip {
  name: string;
  state: 'pending' | 'run' | 'skipped';
  agents: string[];
}

/** A done-check a Job names, read by its latest `check:<name>` Score. */
export interface CheckChip {
  name: string;
  state: 'pending' | 'pass' | 'fail';
}

export interface JobChips {
  skills: SkillChip[];
  checks: CheckChip[];
}

/** What the chips are read from: the Job's latest span, its Attempts and agents, and the check Scores it owns. */
export interface ChipEvidence {
  span?: Span;
  attempts: readonly Span[];
  agents: readonly Span[];
  checkScores: readonly Score[];
}

const later = (a: { t: string; seq: number }, b: { t: string; seq: number }): boolean =>
  Date.parse(a.t) - Date.parse(b.t) > 0 || (a.t === b.t && a.seq > b.seq);

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

/** The Job span and the agents of its current Run and latest Attempt; none before the Job has started. */
function scope(evidence: ChipEvidence) {
  const { span } = evidence;
  if (span === undefined) return { spans: [], scores: [] };
  const latest = evidence.attempts
    .filter((attempt) => attempt.trace_id === span.trace_id)
    .reduce<Span | undefined>(
      (last, attempt) =>
        last && !later({ t: attempt.start_t, seq: attempt.seq }, { t: last.start_t, seq: last.seq }) ? last : attempt,
      undefined,
    );
  const current = inLatestAttempt(evidence, latest);
  const agents = evidence.agents.filter(
    (agent) => agent.trace_id === span.trace_id && current(agent.span_id, agent.start_t),
  );
  const scores = evidence.checkScores.filter(
    (score) => score.trace_id === span.trace_id && current(score.span_id, score.t),
  );
  return { spans: [span, ...agents], scores };
}

const invoked = (span: Span, name: string): boolean =>
  (span.skills ?? []).some((use) => use.name === name) || (span.skills_invoked ?? []).includes(name);

/** Run when any span in scope invoked it; skipped once every span answering to an agent listing it ended knowing its skills without it. */
function skillState(name: string, listing: readonly JobAgent[], spans: readonly Span[]): SkillChip['state'] {
  if (spans.some((span) => invoked(span, name))) return 'run';
  const answering = spans.filter((span) => listing.some((agent) => answersTo(span, agent)));
  const known = answering.every((span) => span.end_t !== null && span.skills_invoked !== undefined);
  return answering.length > 0 && known ? 'skipped' : 'pending';
}

function checkState(name: string, scores: readonly Score[]): CheckChip['state'] {
  const latest = scores
    .filter((score) => score.name === 'check' && score.source === `check:${name}`)
    .reduce<Score | undefined>((last, score) => (last && !later(score, last) ? last : score), undefined);
  if (latest?.value === 'pass') return 'pass';
  return latest?.value === 'fail' ? 'fail' : 'pending';
}

/** A Job's monitoring chips: its listed skills, once each in first-listed order, and its checks, as the evidence shows them. */
export function jobChips(
  config: { agents: readonly JobAgent[]; checks: readonly string[] },
  evidence: ChipEvidence,
): JobChips {
  const { spans, scores } = scope(evidence);
  const names = [...new Set(config.agents.flatMap((agent) => agent.skills))];
  return {
    skills: names.map((name) => {
      const listing = config.agents.filter((agent) => agent.skills.includes(name));
      return {
        name,
        state: skillState(name, listing, spans),
        agents: [...new Set(listing.map((agent) => agent.type))],
      };
    }),
    checks: config.checks.map((name) => ({ name, state: checkState(name, scores) })),
  };
}
