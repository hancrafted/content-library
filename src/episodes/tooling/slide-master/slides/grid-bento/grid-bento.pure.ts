import { isPlaying, type SlideZone } from '@/episodes/lib/slide-zone.pure';

/** The six cells of the Bento grid Slide, in reading order: the lead first, then the five supporting tiles. */
export type GridBentoCell = 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6';

/** One tile's footprint on the wide grid, in columns and rows. */
export interface BentoTile {
  readonly cell: GridBentoCell;
  readonly cols: number;
  readonly rows: number;
}

/** Columns per breakpoint: one below `sm`, two from `sm`, four from `md`. */
export const BENTO_COLUMNS = { base: 1, sm: 2, md: 4 } as const;

/**
 * The tiles in source order. Auto-placed on four columns they fill three rows exactly:
 * the 2×2 lead on the left, a wide tile over a square and a tall tile on the right, then a square and a wide tile below.
 */
export const BENTO_TILES: readonly BentoTile[] = [
  { cell: 'c1', cols: 2, rows: 2 },
  { cell: 'c2', cols: 2, rows: 1 },
  { cell: 'c3', cols: 1, rows: 1 },
  { cell: 'c4', cols: 1, rows: 2 },
  { cell: 'c5', cols: 1, rows: 1 },
  { cell: 'c6', cols: 2, rows: 1 },
];

/** The cells taken so far on a grid of `columns` columns, keyed `row:column`. */
interface Board {
  readonly columns: number;
  readonly taken: Set<string>;
}

/** Every `row:column` key `tile` covers when its top-left corner sits at `slot` (reading-order index). */
function cellsAt(board: Board, tile: BentoTile, slot: number): string[] {
  const row = Math.floor(slot / board.columns);
  const col = slot % board.columns;
  const keys: string[] = [];
  for (let r = row; r < row + tile.rows; r++) for (let c = col; c < col + tile.cols; c++) keys.push(`${r}:${c}`);
  return keys;
}

/** The first slot from `cursor` where `tile` fits, as CSS grid's sparse auto-placement finds it. */
function place(board: Board, tile: BentoTile, cursor: number): number {
  let slot = cursor;
  const fits = (at: number) =>
    (at % board.columns) + tile.cols <= board.columns && cellsAt(board, tile, at).every((key) => !board.taken.has(key));
  while (!fits(slot)) slot++;
  return slot;
}

/**
 * Packs `tiles` the way `grid-auto-flow: row` would on `columns` columns and reports the rows used and the cells left
 * empty, so a layout change that opens a hole fails a test instead of a screenshot review.
 */
export function packTiles(tiles: readonly BentoTile[], columns: number): { rows: number; holes: number } {
  if (!Number.isInteger(columns) || columns < 1) throw new Error(`"${columns}" is not a column count.`);
  const board: Board = { columns, taken: new Set() };
  let cursor = 0;
  for (const tile of tiles) {
    if (tile.cols > columns) throw new Error(`Tile "${tile.cell}" spans ${tile.cols} of ${columns} columns.`);
    cursor = place(board, tile, cursor);
    cellsAt(board, tile, cursor).forEach((key) => board.taken.add(key));
  }
  const rows = Math.max(0, ...[...board.taken].map((key) => Number(key.split(':')[0]) + 1));
  return { rows, holes: rows * columns - board.taken.size };
}

/** The lead tile's gradient loop runs in `active` only (FE-009 §6); everywhere else it holds its frame. */
export function loopPlayState(zone: SlideZone): 'running' | 'paused' {
  return isPlaying(zone) ? 'running' : 'paused';
}
