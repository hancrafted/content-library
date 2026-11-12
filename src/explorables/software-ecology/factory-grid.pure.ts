/*
 * The roles state's grid (design-ADR 0024 §13; feedback 09): the tire swing is the cartoon's ten panels in two rows of
 * five, in cartoon order, each work center in the cell of its panel and the panels that are no work center here
 * (Documentation, Billing, what the customer needed) in theirs; Quality assurance has no panel and shows in the factory
 * only. A use case without the cartoon keeps every card at its factory column and row. Cells are 1-based [column, row].
 */
import { CUSTOMER_PANEL, PANELS } from './cartoon-panels.pure.ts';
import type { Topology } from './factory-model.pure.ts';

export type Cell = readonly [number, number];

export interface Grid {
  readonly cols: number;
  readonly rows: number;
  /** Each node's cell, the Customer's included. */
  readonly at: Readonly<Record<string, Cell>>;
}

export interface Tile {
  /** The panel's id. */
  readonly id: string;
  readonly at: Cell;
}

type GridFactory = Pick<Topology, 'cust' | 'centers' | 'nodes'> & {
  readonly B: { readonly data: { panels?: boolean } };
};

const near = (list: readonly number[], v: number) =>
  list.reduce((bi, x, i) => (Math.abs(x - v) < Math.abs((list[bi] as number) - v) ? i : bi), 0);

/** Where a use case without the cartoon keeps its cards: the factory's columns and rows. */
function factoryGrid(m: GridFactory): Grid {
  const xs = [...new Set(m.centers.map((n) => n.def.x))].sort((a, b) => a - b),
    ys = [...new Set(m.centers.map((n) => n.def.y))].sort((a, b) => a - b);
  const at: Record<string, Cell> = { customer: [1, near(ys, m.cust.def.y) + 1] };
  for (const n of m.centers) at[n.id] = [xs.indexOf(n.def.x) + 2, ys.indexOf(n.def.y) + 1];
  return { cols: xs.length + 1, rows: ys.length, at };
}

/** The cartoon's own order is the cell order: ten panels, two rows of five. */
const PER_ROW = 5;
const cartoonCell = (i: number): Cell => [(i % PER_ROW) + 1, Math.floor(i / PER_ROW) + 1];

/** The tire swing: each panel in cartoon order, a work center in the cell of its panel; a role with no panel (QA) has none. */
function cartoonGrid(m: GridFactory): Grid {
  const at: Record<string, Cell> = {};
  PANELS.forEach((p, i) => {
    if (p === CUSTOMER_PANEL) at.customer = cartoonCell(i);
    else for (const n of m.centers) if (p.node && n.roleId === p.node) at[n.id] = cartoonCell(i);
  });
  return { cols: PER_ROW, rows: Math.ceil(PANELS.length / PER_ROW), at };
}

export const gridOf = (m: GridFactory): Grid => (m.B.data.panels ? cartoonGrid(m) : factoryGrid(m));

/** The cartoon panels that are no node here, in cartoon order; empty for a use case without the cartoon. */
const extraPanels = (m: GridFactory) =>
  m.B.data.panels ? PANELS.filter((p) => p !== CUSTOMER_PANEL && (p.target || !p.node || !m.nodes.has(p.node))) : [];

/** The tiles and their cells: each panel that is no node here keeps its place in the cartoon's order. */
export function tilesOf(m: GridFactory): Tile[] {
  return extraPanels(m).map((p) => ({ id: p.id, at: cartoonCell(PANELS.indexOf(p)) }));
}
