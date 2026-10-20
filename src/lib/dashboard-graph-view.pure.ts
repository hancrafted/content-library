/*
 * The Graph view model: every node the pipeline dashboard draws, resolved once. A Stage node carries its label,
 * worded state, counts, activity and selection; a Job node its agents, attention, fan-out label and ticket lanes.
 * The graph, its popovers and the drawer read these nodes instead of re-deriving them from the projection, and the
 * geometry that places them comes from the same call, so a drawn node always has its place.
 */

import type { Span } from '../../skills/new-episode/scripts/run-log.schema.pure';
import { graphGeometry } from './dashboard-graph-geometry.pure';
import type { DashboardJob, DashboardView } from './dashboard-projection.pure';
import {
  agentState,
  isComplete,
  jobNeedsAttention,
  projectStages,
  type DashboardStage,
  type DashboardState,
} from './dashboard-stages.pure';
import { parseDescription } from './episode-spawn-description.pure';

/** The message-file words a node is labelled with. */
export interface GraphLabels {
  stageNames: Readonly<Record<string, string>>;
  gate: string;
  complete: string;
}

/** What the drawer shows: a stage, and one of its Jobs when a Job was picked. */
export interface GraphSelection {
  stage: string;
  job?: string;
}

/** What the drawer shows, and whether the Job network is drawn instead of the Stage view. */
export interface GraphOptions {
  selection: GraphSelection | null;
  showJobs: boolean;
}

/** One node on a Job's branch: a configured agent, or the Job itself when it configures none. */
export interface AgentNode {
  /** `<job>:<index>`, the id Graph geometry gives the node at the same place on the branch. */
  id: string;
  role: string;
  label: string;
  state: DashboardState;
  span?: Span;
}

export interface JobNode {
  id: string;
  /** The stage the Job is drawn in. */
  stage: string;
  job: DashboardJob;
  selected: boolean;
  /** Waiting on Han, ended badly, or holding a reviewer line only Han can judge. */
  attention: boolean;
  /** A template Job's `foreach` heading: the item it writes one Job per; absent on a real Job. */
  fanOut?: string;
  /** The tickets the current Run's sessions name, in order of first sight; never inferred. */
  tickets: number[];
  agents: AgentNode[];
}

export interface StageNode extends DashboardStage {
  label: string;
  stateLabel: string;
  selected: boolean;
  complete: boolean;
  /** The Jobs running or waiting on Han. */
  active: string[];
  /** Sessions of the current Run still running. */
  sessions: number;
  nodes: JobNode[];
}

/** A stage's title from the message files' `stageNames`; an id they do not name is title-cased. */
function stageTitle(id: string, names: GraphLabels['stageNames']): string {
  return (
    names[id] ??
    id
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );
}

function agentIdentity(span: Span) {
  const parsed = parseDescription(span.description ?? '');
  if (parsed && parsed.job === span.job) return { ticket: span.ticket ?? parsed.ticket, role: parsed.role };
  return { ticket: span.ticket, role: span.role ?? span.name };
}

const byStart = (a: Span, b: Span) => Date.parse(a.start_t) - Date.parse(b.start_t) || a.seq - b.seq;

function inCurrentAttempt(agent: Span, latest: Span | undefined, earlier: ReadonlySet<string>): boolean {
  if (!latest || agent.parent_span_id === latest.span_id) return true;
  return !earlier.has(agent.parent_span_id ?? '') && Date.parse(agent.start_t) >= Date.parse(latest.start_t);
}

/** A configured node never borrows a successful role from another Run or an earlier Attempt. */
function currentAgent(job: DashboardJob, role: string): Span | undefined {
  if (!job.span) return undefined;
  const trace = job.span.trace_id;
  const attempts = job.attempts.filter((attempt) => attempt.trace_id === trace).sort(byStart);
  const latest = attempts.at(-1);
  const earlier = new Set(attempts.slice(0, -1).map((attempt) => attempt.span_id));
  return job.agents
    .filter(
      (agent) =>
        agent.trace_id === trace && agentIdentity(agent).role === role && inCurrentAttempt(agent, latest, earlier),
    )
    .sort(byStart)
    .at(-1);
}

function agentNodes(job: DashboardJob): AgentNode[] {
  const drawn =
    job.config.length === 0
      ? [{ role: job.id, state: job.state, span: job.span }]
      : job.config.map((config) => {
          const span = currentAgent(job, config.type);
          const orchestrated = config.session === 'orchestrator';
          return {
            role: config.type,
            state: span ? agentState(job, span) : orchestrated ? job.state : ('waiting' as const),
            span: span ?? (orchestrated ? job.span : undefined),
          };
        });
  return drawn.map((agent, index) => ({ id: `${job.id}:${index}`, label: `${job.id} · ${agent.role}`, ...agent }));
}

function inCurrentRun(job: DashboardJob, agent: Span): boolean {
  return !job.span || agent.trace_id === job.span.trace_id;
}

function tickets(job: DashboardJob): number[] {
  const seen = job.agents.filter((agent) => inCurrentRun(job, agent)).map((agent) => agentIdentity(agent).ticket);
  return [...new Set(seen)].filter((ticket) => ticket !== undefined);
}

function jobNode(job: DashboardJob, stage: string, selection: GraphSelection | null): JobNode {
  return {
    id: job.id,
    stage,
    job,
    selected: selection?.job === job.id,
    attention: jobNeedsAttention(job),
    ...(job.foreach !== undefined && { fanOut: job.foreach.split('#').at(-1) }),
    tickets: tickets(job),
    agents: agentNodes(job),
  };
}

function sessions(stage: DashboardStage): number {
  return stage.jobs.flatMap((job) =>
    job.agents.filter((agent) => agentState(job, agent) === 'running' && inCurrentRun(job, agent)),
  ).length;
}

function stateLabel(stage: DashboardStage, labels: GraphLabels): string {
  if (stage.state === 'gate') return labels.gate;
  return isComplete(stage.state) ? labels.complete : stage.state;
}

export function graphView(
  view: { jobs: readonly DashboardJob[]; stages?: DashboardView['stages'] },
  labels: GraphLabels,
  options: Partial<GraphOptions> = {},
) {
  const { selection, showJobs } = { selection: null, showJobs: false, ...options };
  const projected = projectStages(view.jobs, view.stages);
  const stages: StageNode[] = projected.stages.map((stage) => ({
    ...stage,
    label: stageTitle(stage.id, labels.stageNames),
    stateLabel: stateLabel(stage, labels),
    selected: selection?.stage === stage.id,
    complete: isComplete(stage.state),
    active: stage.jobs.filter((job) => job.state === 'running' || job.state === 'gate').map((job) => job.id),
    sessions: sessions(stage),
    nodes: stage.jobs.map((job) => jobNode(job, stage.id, selection)),
  }));
  const stage = stages.find((candidate) => candidate.selected);
  const job = stage?.nodes.find((candidate) => candidate.selected);
  return {
    stages,
    completed: projected.completed,
    total: stages.length,
    attention: projected.attention,
    next: stages.find((candidate) => candidate.state === 'waiting'),
    selection: stage && { stage, job, title: job?.id ?? stage.label },
    geometry: graphGeometry(stages, showJobs),
  };
}

export type GraphView = ReturnType<typeof graphView>;
