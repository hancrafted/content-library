/*
 * Swing and Roles keep every card at its factory place (design-ADR 0024 §13): the Customer in the first column, each
 * work center in the grid cell of its factory column and row, and the cartoon panels that are no work center here
 * (Documentation, Billing, what the customer really needed) in the empty cells. Ported from the reference build's
 * `gridOf` and `renderTiles`; cells are 1-based [column, row].
 */
import { CUSTOMER_PANEL, PANELS, panelFor } from './cartoon-panels.pure.ts';
import type { Factory } from './factory.types';

export type Cell = readonly [number, number];
export type GridView = 'swing' | 'roles';

export interface Grid {
  readonly cols: number;
  readonly rows: number;
  /** Each node's cell, the Customer's included. */
  readonly at: Readonly<Record<string, Cell>>;
  /** Work centers with no cartoon panel: they sit out Swing, their cell left empty. */
  readonly outOfSwing: readonly string[];
}

export interface Tile {
  /** The panel's id. */
  readonly id: string;
  readonly at: Cell;
}

type GridFactory = Pick<Factory, 'cust' | 'centers' | 'nodes'> & {
  readonly B: { readonly data: { panels?: boolean } };
};

const near = (list: readonly number[], v: number) =>
  list.reduce((bi, x, i) => (Math.abs(x - v) < Math.abs((list[bi] as number) - v) ? i : bi), 0);

export function gridOf(m: GridFactory): Grid {
  const xs = [...new Set(m.centers.map((n) => n.def.x))].sort((a, b) => a - b),
    ys = [...new Set(m.centers.map((n) => n.def.y))].sort((a, b) => a - b);
  const at: Record<string, Cell> = { customer: [1, near(ys, m.cust.def.y) + 1] };
  for (const n of m.centers) at[n.id] = [xs.indexOf(n.def.x) + 2, ys.indexOf(n.def.y) + 1];
  return {
    cols: xs.length + 1,
    rows: ys.length,
    at,
    outOfSwing: m.B.data.panels ? m.centers.filter((n) => !panelFor(n)).map((n) => n.id) : [],
  };
}

/** The cartoon panels that are no node here, in cartoon order; empty for a use case without the cartoon. */
const extraPanels = (m: GridFactory) =>
  m.B.data.panels ? PANELS.filter((p) => p !== CUSTOMER_PANEL && (p.target || !p.node || !m.nodes.has(p.node))) : [];

/** The tiles a view shows and their cells: the closing panel under the Customer (Swing only), the rest in free cells. */
export function tilesOf(m: GridFactory, view: GridView): Tile[] {
  const g = gridOf(m),
    used = new Set(Object.values(g.at).map((c) => c.join(','))),
    free: Cell[] = [];
  for (let r = 1; r <= g.rows; r++) for (let c = 2; c <= g.cols; c++) if (!used.has(`${c},${r}`)) free.push([c, r]);
  const custRow = (g.at.customer as Cell)[1];
  for (let r = 1; r <= g.rows; r++) if (r !== custRow) free.push([1, r]);
  const take = (want: Cell | null): Cell => {
    const i = want ? free.findIndex((c) => c[0] === want[0] && c[1] === want[1]) : -1;
    return free.splice(i >= 0 ? i : 0, 1)[0] as Cell;
  };
  return extraPanels(m).flatMap((p) => {
    const at = take(p.target ? [1, Math.min(g.rows, custRow + 1)] : null);
    return view === 'swing' || !p.target ? [{ id: p.id, at }] : [];
  });
}
