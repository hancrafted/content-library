import { dashboardLayout, edgePath, GRAPH_LAYOUT } from './dashboard-layout.pure';
import type { RailStop } from './dashboard-scrub.pure';
import type { DashboardStage } from './dashboard-stages.pure';

type Layout = ReturnType<typeof dashboardLayout>;

const px = (value: number) => `${value}px`;
const percent = (fraction: number) => `${fraction * 100}%`;
const stageCentre = GRAPH_LAYOUT.stageNode / 2 + GRAPH_LAYOUT.nodeInset;

function centres(layout: Layout, showJobs: boolean) {
  const column = GRAPH_LAYOUT.minimumColumn;
  const positions = layout.stages.map((stage, index) => (showJobs ? stage.x : (index + 0.5) * column));
  positions.push(showJobs ? layout.end.x : (layout.stages.length + 0.5) * column);
  const total = showJobs ? layout.width : positions.length * column;
  return { fractions: positions.map((position) => position / total), total };
}

/** Each Stage centre, Run end included, at its stage index fraction along the shared replay rail. */
function railStops(fractions: readonly number[]): RailStop[] {
  const left = fractions[0];
  const width = fractions.at(-1)! - left || 1;
  return fractions.map((fraction, index) => ({
    at: index / Math.max(1, fractions.length - 1),
    position: (fraction - left) / width,
  }));
}

function cssVars(fractions: readonly number[], total: number, height: number) {
  return {
    '--stage-columns': `repeat(${fractions.length}, minmax(0, 1fr))`,
    '--canvas-min': px(total),
    '--start-inset': percent(fractions[0]),
    '--end-inset': percent(1 - fractions.at(-1)!),
    '--network-height': px(height),
    '--stage-size': px(GRAPH_LAYOUT.stageNode),
    '--stage-centre': px(stageCentre),
    '--stage-anchor-size': px(stageCentre * 2),
    '--node-inset': px(GRAPH_LAYOUT.nodeInset),
    '--job-size': px(GRAPH_LAYOUT.agentNode),
    '--job-dot-size': px(GRAPH_LAYOUT.agentDot),
    '--end-size': px(GRAPH_LAYOUT.endNode),
  };
}

function stagePlacement(stage: Layout['stages'][number], layout: Layout) {
  return { left: percent(stage.x / layout.width), width: percent(stage.width / layout.width) };
}

function stageBranches(stage: Layout['stages'][number]) {
  return stage.branches.map((branch) => ({
    job: branch.job,
    nodes: branch.nodes.map((node) => ({
      id: node.id,
      x: node.x,
      y: node.y,
      left: percent(node.x / stage.width),
      top: `calc(50% + ${node.y}px)`,
    })),
    edges: branch.edges.map((edge) => ({ id: `${edge.from.id}-${edge.to.id}`, path: edgePath(edge) })),
  }));
}

/**
 * The one owner of graph geometry: Stage and Job node positions, edge paths, the replay rail
 * ends and stops, and the CSS variables the stylesheet consumes without re-deriving them.
 * Positions are ready to apply as styles; `showJobs` switches between the Stage view and the Job network.
 */
export function graphGeometry(stages: readonly DashboardStage[], showJobs: boolean) {
  const layout = dashboardLayout(stages);
  const { fractions, total } = centres(layout, showJobs);
  return {
    stages: layout.stages.map((stage, index) => ({
      id: stage.id,
      centre: fractions[index],
      width: stage.width,
      placement: showJobs ? stagePlacement(stage, layout) : undefined,
      viewBox: `0 ${-stage.height / 2} ${stage.width} ${stage.height}`,
      branches: stageBranches(stage),
    })),
    end: fractions.at(-1)!,
    width: total,
    stops: railStops(fractions),
    cssVars: cssVars(fractions, total, layout.height),
    maxHeight: GRAPH_LAYOUT.maximumHeight,
  };
}

export type GraphGeometry = ReturnType<typeof graphGeometry>;
export type StageGeometry = GraphGeometry['stages'][number];
export type BranchGeometry = StageGeometry['branches'][number];
