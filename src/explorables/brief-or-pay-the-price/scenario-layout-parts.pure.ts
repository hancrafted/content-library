import type { Box, Edge, GoalCircle, NodeRect, ScenarioFile, StageBand } from './scenario.types';

export interface Plan {
  readonly file: ScenarioFile;
  readonly nodes: Readonly<Record<string, NodeRect>>;
  readonly goal: GoalCircle;
  readonly stages: readonly StageBand[];
}

export const fans = (file: ScenarioFile) => ({
  out: (id: string): number => file.edges.filter((edge) => edge.from === id).length,
  into: (id: string): number => file.edges.filter((edge) => edge.to === id).length,
});

export const drawsArrow = (file: ScenarioFile, edge: Edge): boolean =>
  fans(file).into(edge.to) <= 1 || edge === file.edges.filter((each) => each.to === edge.to).at(-1);

const boxOfNode = (node: NodeRect): Box => ({
  cx: node.cx,
  cy: node.cy,
  top: node.y,
  bottom: node.y + node.h,
  left: node.x,
  right: node.x + node.w,
});

export const boxesOf = (plan: Pick<Plan, 'nodes' | 'goal'>, goalBelow: number): Record<string, Box> => {
  const { goal, nodes } = plan;
  return {
    ...Object.fromEntries(Object.entries(nodes).map(([id, node]) => [id, boxOfNode(node)])),
    goal: {
      cx: goal.cx,
      cy: goal.cy,
      top: goal.cy - goal.r,
      bottom: goal.cy + goal.r + goalBelow,
      left: goal.cx - goal.r,
      right: goal.cx + goal.r,
    },
  };
};
