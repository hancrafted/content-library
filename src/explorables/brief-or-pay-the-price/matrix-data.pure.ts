import { MOVE_IDS, TRAIT_IDS, type MoveId, type TraitId } from './brief-or-pay-the-price.types';
import type { CellKey } from './explorable-state.pure';
import type { ScenarioNode } from './scenario.types';

export type Counters = Readonly<Record<MoveId, readonly TraitId[]>>;

export const isCounter = (counters: Counters, { move, trait }: CellKey): boolean => counters[move].includes(trait);

export function cellsOf(counters: Counters): readonly CellKey[] {
  return MOVE_IDS.flatMap((move) =>
    TRAIT_IDS.filter((trait) => counters[move].includes(trait)).map((trait) => ({ move, trait })),
  );
}

export function neighbour(cells: readonly CellKey[], from: CellKey, delta: 1 | -1): CellKey {
  const at = cells.findIndex((cell) => cell.move === from.move && cell.trait === from.trait);
  return cells[(at + delta + cells.length) % cells.length] as CellKey;
}

export type Part = string | { readonly bold: string };

export function fill(template: string, names: { readonly move: string; readonly trait: string }): Part[] {
  return template
    .split(/(\{move\}|\{trait\})/)
    .filter((piece) => piece !== '')
    .map((piece) => {
      if (piece === '{move}') return { bold: names.move };
      if (piece === '{trait}') return { bold: names.trait };
      return piece;
    });
}

export const plain = (template: string, names: { readonly move: string; readonly trait: string }): string =>
  template.replace('{move}', names.move).replace('{trait}', names.trait);

export type CellMark = 'on' | 'mark' | 'context' | 'dim' | 'none';

export function markOf(counters: Counters, node: ScenarioNode | null, cell: CellKey): CellMark {
  const counter = isCounter(counters, cell);
  if (node === null) return counter ? 'on' : 'none';
  const inNode = node.cells.some((each) => each.move === cell.move && each.trait === cell.trait);
  if (inNode) return counter ? 'mark' : 'context';
  return counter ? 'dim' : 'none';
}

export const cellsIn = (counters: Counters, node: ScenarioNode | null): readonly CellKey[] =>
  node === null ? cellsOf(counters) : node.cells.map(({ move, trait }) => ({ move, trait }));

export const format = (template: string, values: Readonly<Record<string, string | number>>): string =>
  template.replace(/\{(\w+)\}/g, (whole, key: string) => (key in values ? String(values[key]) : whole));
