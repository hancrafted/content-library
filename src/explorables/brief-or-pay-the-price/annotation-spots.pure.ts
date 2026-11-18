import type { Annotation, Box, Layout, NodeRect } from './scenario.types';

export interface Point {
  readonly x: number;
  readonly y: number;
}

export const boxIn = (layout: Layout, id: string): Box => layout.boxes[id] as Box;

export const rightEdgeOf = (layout: Layout): number => {
  const band = layout.stages[0];
  return band === undefined ? layout.w : band.x + band.w - 12;
};

const TAG_HALF_WIDTH = 60;

export interface TagSpot {
  readonly at: Point;
  readonly anchor: Point;
  readonly size?: number;
  readonly align?: 'end';
}

export function tagSpot(layout: Layout, rect: NodeRect): TagSpot {
  if (layout.orient === 'vertical') {
    const at = { x: rightEdgeOf(layout), y: rect.y - 32 };
    return {
      at,
      anchor: { x: at.x - TAG_HALF_WIDTH, y: at.y },
      size: 13,
      align: 'end',
    };
  }
  const at = { x: rect.cx, y: rect.y - 30 };
  return { at, anchor: at };
}

export interface ArrowSpot {
  readonly from: Box;
  readonly to: Box;
  readonly lane: number;
  readonly mid: Point;
}

export function arrowSpot(layout: Layout, annotation: Extract<Annotation, { type: 'arrow' }>): ArrowSpot {
  const from = boxIn(layout, annotation.from);
  const to = boxIn(layout, annotation.to);
  const lane = annotation.route === 'under' ? layout.lanes.under : layout.lanes.over;
  const mid =
    layout.orient === 'vertical' ? { x: lane, y: (from.cy + to.cy) / 2 } : { x: (from.cx + to.cx) / 2, y: lane };
  return { from, to, lane, mid };
}
