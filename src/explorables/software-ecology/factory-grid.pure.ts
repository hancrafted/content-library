// decision: docs/decision-records/0024-software-ecology-flow-model-and-use-case-files.md
import { CUSTOMER_PANEL, PANELS } from './cartoon-panels.pure.ts';
import type { Topology } from './factory-model.pure.ts';

export type Cell = readonly [number, number];

export interface Grid {
  readonly cols: number;
  readonly rows: number;
  readonly at: Readonly<Record<string, Cell>>;
}

export interface Tile {
  readonly id: string;
  readonly at: Cell;
}

type GridFactory = Pick<Topology, 'cust' | 'centers' | 'nodes'> & {
  readonly B: { readonly data: { panels?: boolean } };
};

const near = (list: readonly number[], v: number) =>
  list.reduce((bi, x, i) => (Math.abs(x - v) < Math.abs((list[bi] as number) - v) ? i : bi), 0);

function factoryGrid(m: GridFactory): Grid {
  const xs = [...new Set(m.centers.map((n) => n.def.x))].sort((a, b) => a - b),
    ys = [...new Set(m.centers.map((n) => n.def.y))].sort((a, b) => a - b);
  const at: Record<string, Cell> = { customer: [1, near(ys, m.cust.def.y) + 1] };
  for (const n of m.centers) at[n.id] = [xs.indexOf(n.def.x) + 2, ys.indexOf(n.def.y) + 1];
  return { cols: xs.length + 1, rows: ys.length, at };
}

const PER_ROW = 5;
const cartoonCell = (i: number): Cell => [(i % PER_ROW) + 1, Math.floor(i / PER_ROW) + 1];

function cartoonGrid(m: GridFactory): Grid {
  const at: Record<string, Cell> = {};
  PANELS.forEach((p, i) => {
    if (p === CUSTOMER_PANEL) at.customer = cartoonCell(i);
    else for (const n of m.centers) if (p.node && n.roleId === p.node) at[n.id] = cartoonCell(i);
  });
  return { cols: PER_ROW, rows: Math.ceil(PANELS.length / PER_ROW), at };
}

export const gridOf = (m: GridFactory): Grid => (m.B.data.panels ? cartoonGrid(m) : factoryGrid(m));

const extraPanels = (m: GridFactory) =>
  m.B.data.panels ? PANELS.filter((p) => p !== CUSTOMER_PANEL && (p.target || !p.node || !m.nodes.has(p.node))) : [];

export function tilesOf(m: GridFactory): Tile[] {
  return extraPanels(m).map((p) => ({ id: p.id, at: cartoonCell(PANELS.indexOf(p)) }));
}
