import { boxesOf, drawsArrow, fans, type Plan } from './scenario-layout-parts.pure';
import type { Edge, GoalCircle, LaidOutEdge, Layout, NodeRect, ScenarioFile, StageBand } from './scenario.types';

const NARROW = {
  w: 520,
  lane: 24,
  left: 74,
  right: 446,
  bandH: 230,
  top: 16,
  nodeW: 220,
  nodeH: 120,
  gap: 14,
  goalR: 56,
  nodeTop: 60,
  labelY: 30,
};
const INNER = NARROW.right - NARROW.left;

function bandsOf(file: ScenarioFile): StageBand[] {
  return file.stages.map((stage, row) => {
    const y = NARROW.top + row * NARROW.bandH;
    return {
      id: stage.id,
      x: NARROW.left - 12,
      y,
      w: INNER + 24,
      h: NARROW.bandH - 10,
      lx: NARROW.left,
      ly: y + NARROW.labelY,
      anchor: 'start',
    };
  });
}

function nodesOf(file: ScenarioFile, stages: readonly StageBand[]): Record<string, NodeRect> {
  const nodes: Record<string, NodeRect> = {};
  file.stages.forEach((stage, row) => {
    const side = file.nodes.filter((node) => node.stage === stage.id);
    const count = side.length;
    const w = Math.min(NARROW.nodeW, (INNER - (count - 1) * NARROW.gap) / count);
    const cy = (stages[row] as StageBand).y + NARROW.nodeTop + NARROW.nodeH / 2;
    side.forEach((node, column) => {
      const cx = NARROW.left + INNER / 2 + (column - (count - 1) / 2) * (w + NARROW.gap);
      nodes[node.id] = { x: cx - w / 2, y: cy - NARROW.nodeH / 2, w, h: NARROW.nodeH, cx, cy };
    });
  });
  return nodes;
}

const portOf = (plan: Plan, id: string, side: 'in' | 'out') => {
  const { goal } = plan;
  if (id === 'goal') return { x: goal.cx, y: side === 'in' ? goal.cy - goal.r : goal.cy + goal.r };
  const node = plan.nodes[id] as NodeRect;
  return { x: node.cx, y: side === 'in' ? node.y : node.y + node.h };
};

function chipSpot(plan: Plan, edge: Edge, x: number): LaidOutEdge['mid'] {
  const fromStage = plan.file.nodes.find((node) => node.id === edge.from)?.stage;
  const band = plan.stages.find((stage) => stage.id === fromStage) as StageBand;
  const room = Math.min(plan.nodes[edge.from]?.w ?? 200, plan.nodes[edge.to]?.w ?? 200);
  return { x, y: band.y + NARROW.bandH - 5, room };
}

function pathOf(plan: Plan, edge: Edge): string {
  const a = portOf(plan, edge.from, 'out');
  const b = portOf(plan, edge.to, 'in');
  const f = fans(plan.file);
  if (Math.abs(a.x - b.x) < 1) return `M${a.x} ${a.y}V${b.y - 4}`;
  const bend = f.out(edge.from) > 1 ? a.y + 16 : f.into(edge.to) > 1 ? b.y - 16 : (a.y + b.y) / 2;
  return `M${a.x} ${a.y}V${bend}H${b.x}V${b.y - 4}`;
}

function edgeOf(plan: Plan, edge: Edge): LaidOutEdge {
  const a = portOf(plan, edge.from, 'out');
  const b = portOf(plan, edge.to, 'in');
  const x = fans(plan.file).out(edge.from) > 1 ? b.x : a.x;
  return {
    id: `${edge.from}>${edge.to}`,
    ...edge,
    d: pathOf(plan, edge),
    mid: chipSpot(plan, edge, x),
    arrow: drawsArrow(plan.file, edge),
  };
}

export function layoutVertical(file: ScenarioFile): Layout {
  const stages = bandsOf(file);
  const nodes = nodesOf(file, stages);
  const goalY = NARROW.top + file.stages.length * NARROW.bandH + NARROW.goalR + 20;
  const goal: GoalCircle = { cx: NARROW.left + INNER / 2, cy: goalY, r: NARROW.goalR };
  const plan: Plan = { file, nodes, goal, stages };
  const lanes = { under: NARROW.lane, over: NARROW.w - NARROW.lane };
  const edges = file.edges.map((edge) => edgeOf(plan, edge));
  return {
    orient: 'vertical',
    w: NARROW.w,
    h: goalY + goal.r + 56,
    stages,
    nodes,
    goal,
    edges,
    boxes: boxesOf(plan, 0),
    lanes,
  };
}
