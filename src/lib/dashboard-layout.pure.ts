import type { DashboardJob } from './dashboard-projection.pure';
import { stageLayers, type DashboardStage } from './dashboard-stages.pure';

export const GRAPH_LAYOUT = {
  stageNode: 48,
  agentNode: 28,
  agentDot: 20,
  endNode: 16,
  nodeInset: 6,
  agentGap: 34,
  laneGap: 56,
  edgePadding: 8,
  minimumGap: 96,
  minimumColumn: 132,
  labelSpace: 64,
  minimumHeight: 128,
  maximumHeight: 560,
  clearance: 4,
  popoverGap: 8,
  popoverDelay: 180,
} as const;

interface Point {
  id: string;
  x: number;
  y: number;
}
export interface GraphEdge {
  from: Point;
  to: Point;
}
export interface JobGeometry {
  job: string;
  nodes: Point[];
  edges: GraphEdge[];
}
export interface StageGeometry {
  id: string;
  x: number;
  width: number;
  height: number;
  branches: JobGeometry[];
}

const countOf = (job: DashboardJob) => Math.max(1, job.config.length);
const parentsOf = (job: DashboardJob, jobs: readonly DashboardJob[]) =>
  jobs.filter((candidate) => [...job.needs, ...job.wants].includes(candidate.id));
const fan = (index: number, count: number) => (index - (count - 1) / 2) * GRAPH_LAYOUT.laneGap;

function rankedJobs(stage: DashboardStage) {
  const ranks = new Map<string, number>();
  return stageLayers(stage)
    .flat()
    .map((job) => {
      const rank = Math.max(0, ...parentsOf(job, stage.jobs).map((parent) => ranks.get(parent.id)! + countOf(parent)));
      ranks.set(job.id, rank);
      return { job, rank };
    });
}

function preferredLane(job: DashboardJob, jobs: DashboardJob[], placed: ReadonlyMap<string, JobGeometry>) {
  const parents = parentsOf(job, jobs);
  if (parents.length === 0) {
    const roots = jobs.filter((candidate) => parentsOf(candidate, jobs).length === 0);
    return fan(roots.indexOf(job), roots.length);
  }
  const parentY = parents.reduce((sum, parent) => sum + placed.get(parent.id)!.nodes[0].y, 0) / parents.length;
  if (parents.length > 1) return parentY;
  const siblings = jobs.filter((candidate) => parentsOf(candidate, jobs).some((parent) => parent.id === parents[0].id));
  return parentY + fan(siblings.indexOf(job), siblings.length);
}

function freeLane(xs: number[], preferred: number, occupied: readonly Point[]) {
  for (let attempt = 0; ; attempt++) {
    const offset = Math.ceil(attempt / 2) * (attempt % 2 ? -1 : 1) * GRAPH_LAYOUT.laneGap;
    const y = preferred + offset;
    const collision = occupied.some((node) =>
      xs.some(
        (x) =>
          Math.abs(x - node.x) < GRAPH_LAYOUT.agentNode + GRAPH_LAYOUT.clearance &&
          Math.abs(y - node.y) < GRAPH_LAYOUT.agentNode + GRAPH_LAYOUT.clearance,
      ),
    );
    if (!collision) return y;
  }
}

function placeJobs(stage: DashboardStage, ranked: ReturnType<typeof rankedJobs>) {
  const placed = new Map<string, JobGeometry>();
  const start = GRAPH_LAYOUT.stageNode / 2 + GRAPH_LAYOUT.agentNode / 2 + GRAPH_LAYOUT.edgePadding;
  for (const { job, rank } of ranked) {
    const xs = Array.from({ length: countOf(job) }, (_, index) => start + (rank + index) * GRAPH_LAYOUT.agentGap);
    const y = freeLane(
      xs,
      preferredLane(job, stage.jobs, placed),
      [...placed.values()].flatMap((branch) => branch.nodes),
    );
    placed.set(job.id, { job: job.id, nodes: xs.map((x, index) => ({ id: `${job.id}:${index}`, x, y })), edges: [] });
  }
  return placed;
}

function connectJobs(stage: DashboardStage, placed: Map<string, JobGeometry>, target: Point) {
  for (const job of stage.jobs) {
    const branch = placed.get(job.id)!;
    const parents = parentsOf(job, stage.jobs);
    const sources = parents.length
      ? parents.map((parent) => placed.get(parent.id)!.nodes.at(-1)!)
      : [{ id: stage.id, x: 0, y: 0 }];
    branch.edges = [
      ...sources.map((from) => ({ from, to: branch.nodes[0] })),
      ...branch.nodes.slice(1).map((to, index) => ({ from: branch.nodes[index], to })),
    ];
    if (!stage.jobs.some((candidate) => parentsOf(candidate, stage.jobs).includes(job))) {
      branch.edges.push({ from: branch.nodes.at(-1)!, to: target });
    }
  }
  return [...placed.values()];
}

function stageGap(ranked: ReturnType<typeof rankedJobs>, terminal: boolean) {
  const longest = Math.max(0, ...ranked.map(({ job, rank }) => rank + countOf(job)));
  const start = GRAPH_LAYOUT.stageNode / 2 + GRAPH_LAYOUT.agentNode / 2 + GRAPH_LAYOUT.edgePadding;
  const end =
    (terminal ? GRAPH_LAYOUT.endNode : GRAPH_LAYOUT.stageNode) / 2 +
    GRAPH_LAYOUT.agentNode / 2 +
    GRAPH_LAYOUT.edgePadding;
  return Math.max(
    terminal ? end : GRAPH_LAYOUT.minimumGap,
    start + Math.max(0, longest - 1) * GRAPH_LAYOUT.agentGap + end,
  );
}

/** Jobs occupy forward stage gaps; needs/wants determine ranks, forks, joins and exits. */
export function dashboardLayout(stages: readonly DashboardStage[]) {
  let x = GRAPH_LAYOUT.stageNode / 2 + GRAPH_LAYOUT.nodeInset;
  const layout = stages.map((stage, index) => {
    const ranked = rankedJobs(stage);
    const width = stageGap(ranked, index === stages.length - 1);
    const target = { id: stages[index + 1]?.id ?? 'run-end', x: width, y: 0 };
    const branches = connectJobs(stage, placeJobs(stage, ranked), target);
    const result = { id: stage.id, x, width, branches };
    x += width;
    return result;
  });
  const reach = Math.max(
    0,
    ...layout.flatMap((stage) => stage.branches.flatMap((branch) => branch.nodes.map((node) => Math.abs(node.y)))),
  );
  const height = Math.max(GRAPH_LAYOUT.minimumHeight, reach * 2 + GRAPH_LAYOUT.labelSpace);
  return {
    stages: layout.map((stage) => ({ ...stage, height })),
    end: { id: 'run-end', x, y: 0 },
    width: x + GRAPH_LAYOUT.endNode / 2 + GRAPH_LAYOUT.edgePadding,
    height,
  };
}

export function edgePath({ from, to }: GraphEdge) {
  const middle = (from.x + to.x) / 2;
  return `M ${from.x} ${from.y} C ${middle} ${from.y} ${middle} ${to.y} ${to.x} ${to.y}`;
}
