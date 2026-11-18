import { boxesOf, drawsArrow, fans, type Plan } from './scenario-layout-parts.pure';
import type { Edge, GoalCircle, LaidOutEdge, Layout, NodeRect, ScenarioFile, StageBand } from './scenario.types';

const WIDE = {
  w: 1920,
  h: 900,
  margin: 40,
  goalW: 200,
  nodeW: 176,
  nodeH: 130,
  cy: 440,
  spread: 420,
  overY: 112,
  underY: 832,
};

function nodesOf(file: ScenarioFile, columnWidth: number): Record<string, NodeRect> {
  const nodes: Record<string, NodeRect> = {};
  file.stages.forEach((stage, column) => {
    const stack = file.nodes.filter((node) => node.stage === stage.id);
    const count = stack.length;
    const gap = count > 1 ? Math.min(WIDE.spread / (count - 1), 260) : 0;
    const h = count > 1 ? Math.min(WIDE.nodeH, gap - 26) : WIDE.nodeH;
    const cx = WIDE.margin + column * columnWidth + columnWidth / 2;
    stack.forEach((node, row) => {
      const cy = WIDE.cy + (row - (count - 1) / 2) * gap;
      nodes[node.id] = { x: cx - WIDE.nodeW / 2, y: cy - h / 2, w: WIDE.nodeW, h, cx, cy };
    });
  });
  return nodes;
}

const portOf = (plan: Plan, id: string, side: 'in' | 'out') => {
  if (id === 'goal')
    return { x: side === 'in' ? plan.goal.cx - plan.goal.r : plan.goal.cx + plan.goal.r, y: plan.goal.cy };
  const node = plan.nodes[id] as NodeRect;
  return { x: side === 'in' ? node.x : node.x + node.w, y: node.cy };
};

function edgeOf(plan: Plan, edge: Edge): LaidOutEdge {
  const a = portOf(plan, edge.from, 'out');
  const b = portOf(plan, edge.to, 'in');
  const f = fans(plan.file);
  const base = { id: `${edge.from}>${edge.to}`, ...edge, arrow: drawsArrow(plan.file, edge) };
  if (Math.abs(a.y - b.y) < 1)
    return { ...base, d: `M${a.x} ${a.y}H${b.x - 4}`, mid: { x: (a.x + b.x - 12) / 2, y: a.y, room: b.x - a.x - 16 } };
  const d = (xm: number): string => `M${a.x} ${a.y}H${xm}V${b.y}H${b.x - 4}`;
  if (f.out(edge.from) > 1) {
    const xm = a.x + 22;
    return { ...base, d: d(xm), mid: { x: (xm + b.x - 12) / 2, y: b.y, room: b.x - xm - 16 } };
  }
  const xm = f.into(edge.to) > 1 ? b.x - 22 : (a.x + b.x) / 2;
  return { ...base, d: d(xm), mid: { x: (a.x + xm) / 2, y: a.y, room: xm - a.x - 6 } };
}

function bandsOf(file: ScenarioFile, columnWidth: number): StageBand[] {
  return file.stages.map((stage, column) => {
    const x = WIDE.margin + column * columnWidth;
    return { id: stage.id, x, y: 18, w: columnWidth, h: 864, lx: x + columnWidth / 2, ly: 56, anchor: 'middle' };
  });
}

export function layoutHorizontal(file: ScenarioFile): Layout {
  const columnWidth = (WIDE.w - 2 * WIDE.margin - WIDE.goalW) / file.stages.length;
  const stages = bandsOf(file, columnWidth);
  const nodes = nodesOf(file, columnWidth);
  const goal: GoalCircle = { cx: WIDE.w - WIDE.margin - WIDE.goalW / 2, cy: WIDE.cy, r: 72 };
  const plan: Plan = { file, nodes, goal, stages };
  const lanes = { under: WIDE.underY, over: WIDE.overY };
  const edges = file.edges.map((edge) => edgeOf(plan, edge));
  return { orient: 'horizontal', w: WIDE.w, h: WIDE.h, stages, nodes, goal, edges, boxes: boxesOf(plan, 44), lanes };
}
