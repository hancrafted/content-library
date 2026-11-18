import { LETTERS, type Annotation, type Layout, type Letter, type Scenario } from './scenario.types';

export interface Lit {
  readonly nodes: readonly string[];
  readonly edges: readonly string[];
  readonly stages: readonly string[];
  readonly goal: boolean;
}

export interface Point {
  readonly x: number;
  readonly y: number;
}

export const NO_LIT: Lit = { nodes: [], edges: [], stages: [], goal: false };

export const MAX_STEP = LETTERS.length;

export const annotationsOf = (scenario: Scenario, letter: Letter): readonly Annotation[] =>
  scenario.annotations?.[letter] ?? [];

export function litOf(scenario: Scenario, letter: Letter): Lit {
  return annotationsOf(scenario, letter).reduce<Lit>((lit, annotation) => {
    if (annotation.type !== 'highlight') return lit;
    return {
      nodes: [...lit.nodes, ...(annotation.nodes ?? [])],
      edges: [...lit.edges, ...(annotation.edges ?? [])],
      stages: [...lit.stages, ...(annotation.stages ?? [])],
      goal: lit.goal || annotation.goal === true,
    };
  }, NO_LIT);
}

export function stepState(scenario: Scenario, step: number) {
  const shown = Math.min(Math.max(Math.trunc(step), 0), MAX_STEP);
  return {
    shown,
    isShown: (letter: Letter): boolean => LETTERS.indexOf(letter) < shown,
    isPast: (letter: Letter): boolean => LETTERS.indexOf(letter) < shown - 1,
    lit: shown === 0 ? NO_LIT : litOf(scenario, LETTERS[shown - 1] as Letter),
  };
}

const PILL_HEIGHT = 32;
const PILL_PAD = 16;
const GLYPH_WIDTH = 0.56;
const MIN_FONT = 11;

export interface Pill {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly textX: number;
  readonly textY: number;
  readonly size: number;
}

export function pillAt(
  at: Point,
  text: string,
  options: { readonly size?: number; readonly room?: number; readonly align?: 'middle' | 'end' } = {},
): Pill {
  const { size: wanted = 17, room = Infinity, align = 'middle' } = options;
  const size = Math.max(MIN_FONT, Math.min(wanted, (room - PILL_PAD) / (text.length * GLYPH_WIDTH)));
  const w = Math.min(text.length * size * GLYPH_WIDTH + PILL_PAD, Math.max(room, 40));
  const cx = align === 'end' ? at.x - w / 2 : at.x;
  return {
    x: cx - w / 2,
    y: at.y - PILL_HEIGHT / 2,
    w,
    h: PILL_HEIGHT,
    textX: cx,
    textY: at.y + size * 0.36,
    size,
  };
}

export const rightEdgeOf = (layout: Layout): number => {
  const band = layout.stages[0];
  return band === undefined ? layout.w : band.x + band.w - 12;
};

const NARROW_GROUP_PAD = 10;
const WIDE_GROUP_PAD = 24;

export interface GroupBox {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly pad: number;
}

export function groupBoxOf(layout: Layout, nodes: readonly string[]): GroupBox {
  const pad = layout.orient === 'vertical' ? NARROW_GROUP_PAD : WIDE_GROUP_PAD;
  const rects = nodes.map((id) => layout.nodes[id]).filter((rect) => rect !== undefined);
  const x1 = Math.min(...rects.map((rect) => rect.x)) - pad;
  const y1 = Math.min(...rects.map((rect) => rect.y)) - pad;
  const x2 = Math.max(...rects.map((rect) => rect.x + rect.w)) + pad;
  const y2 = Math.max(...rects.map((rect) => rect.y + rect.h)) + pad;
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1, pad };
}

type Spot = (layout: Layout, annotation: never) => Point | undefined;

const spotOfHighlight = (layout: Layout, annotation: Extract<Annotation, { type: 'highlight' }>): Point | undefined => {
  if (annotation.goal === true) return { x: layout.goal.cx, y: layout.goal.cy };
  const rect = layout.nodes[annotation.nodes?.[0] ?? ''];
  return rect && { x: rect.cx, y: rect.cy };
};

const spotOfArrow = (layout: Layout, annotation: Extract<Annotation, { type: 'arrow' }>): Point => {
  const a = layout.box(annotation.from);
  const b = layout.box(annotation.to);
  const lane = annotation.route === 'under' ? layout.lanes.under : layout.lanes.over;
  return layout.orient === 'vertical' ? { x: lane, y: (a.cy + b.cy) / 2 } : { x: (a.cx + b.cx) / 2, y: lane };
};

const spotOfGroup = (layout: Layout, annotation: Extract<Annotation, { type: 'group' }>): Point => {
  const box = groupBoxOf(layout, annotation.nodes);
  return { x: box.x + box.w / 2, y: box.y + box.h };
};

const spotOfTag = (layout: Layout, annotation: Extract<Annotation, { type: 'tag' }>): Point | undefined => {
  const rect = layout.nodes[annotation.node];
  if (rect === undefined) return undefined;
  return layout.orient === 'vertical'
    ? { x: rightEdgeOf(layout) - 60, y: rect.y - 32 }
    : { x: rect.cx, y: rect.y - 30 };
};

const spotOfChip = (layout: Layout, annotation: Extract<Annotation, { type: 'chip' }>): Point | undefined =>
  layout.edges.find((edge) => edge.id === annotation.edge)?.mid;

const spotOfMark = (layout: Layout, annotation: Extract<Annotation, { type: 'mark' }>): Point | undefined => {
  const rect = layout.nodes[annotation.nodes[0] ?? ''];
  return rect && { x: rect.x, y: rect.y };
};

const SPOT_OF = {
  highlight: spotOfHighlight,
  arrow: spotOfArrow,
  group: spotOfGroup,
  tag: spotOfTag,
  chip: spotOfChip,
  mark: spotOfMark,
} as const;

const spotOf = (layout: Layout, annotation: Annotation): Point | undefined =>
  (SPOT_OF[annotation.type] as unknown as Spot)(layout, annotation as never);

export function anchorOf(scenario: Scenario, layout: Layout, letter: Letter): Point | undefined {
  const spots = annotationsOf(scenario, letter).map((annotation) => ({
    weak: annotation.type === 'highlight',
    at: spotOf(layout, annotation),
  }));
  return (spots.find((spot) => !spot.weak && spot.at) ?? spots.find((spot) => spot.at))?.at;
}
