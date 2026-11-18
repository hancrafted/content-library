import type { Layout, ScenarioNode } from './scenario.types';

export interface Box {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export interface Flip {
  readonly dx: number;
  readonly dy: number;
  readonly scale: number;
}

export const flipFrom = (first: Box, last: Box): Flip => ({
  dx: first.left - last.left,
  dy: first.top - last.top,
  scale: last.height === 0 ? 1 : first.height / last.height,
});

export interface Origin {
  readonly x: number;
  readonly y: number;
}

export function originOf(layout: Layout, target: 'goal' | string): Origin | null {
  const centre = target === 'goal' ? layout.goal : layout.nodes[target];
  if (centre === undefined) return null;
  return { x: (centre.cx / layout.w) * 100, y: (centre.cy / layout.h) * 100 };
}

export const originCss = ({ x, y }: Origin): string => `${x}% ${y}%`;

export function enterOrder(layout: Layout, nodes: readonly ScenarioNode[]): readonly string[] {
  const distance = (id: string): number => {
    const rect = layout.nodes[id];
    return rect === undefined ? Infinity : Math.hypot(rect.cx - layout.goal.cx, rect.cy - layout.goal.cy);
  };
  return nodes.map(({ id }) => id).sort((a, b) => distance(a) - distance(b));
}

export const NARROW_REM = 48;

export const isNarrow = (width: number, rootFontSize: number): boolean => width < NARROW_REM * rootFontSize;

export const BADGE_INSET = { right: 56, bottom: 54 } as const;

export interface Entry {
  readonly id: string;
  readonly toGoal: { readonly dx: number; readonly dy: number };
}

export function entriesOf(layout: Layout, nodes: readonly ScenarioNode[]): readonly Entry[] {
  return enterOrder(layout, nodes).flatMap((id) => {
    const rect = layout.nodes[id];
    if (rect === undefined) return [];
    const dx = layout.goal.cx - (rect.x + rect.w - BADGE_INSET.right);
    const dy = layout.goal.cy - (rect.y + rect.h - BADGE_INSET.bottom);
    return [{ id, toGoal: { dx, dy } }];
  });
}
