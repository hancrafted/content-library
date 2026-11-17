import { isPlaying, type SlideZone } from '@/episodes/lib/slide-zone.pure';

export type GridBentoCell = 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6';

export interface BentoTile {
  readonly cell: GridBentoCell;
  readonly cols: number;
  readonly rows: number;
}

export const BENTO_COLUMNS = { base: 1, sm: 2, md: 4 } as const;

export const BENTO_TILES: readonly BentoTile[] = [
  { cell: 'c1', cols: 2, rows: 2 },
  { cell: 'c2', cols: 2, rows: 1 },
  { cell: 'c3', cols: 1, rows: 1 },
  { cell: 'c4', cols: 1, rows: 2 },
  { cell: 'c5', cols: 1, rows: 1 },
  { cell: 'c6', cols: 2, rows: 1 },
];

interface Board {
  readonly columns: number;
  readonly taken: Set<string>;
}

function cellsAt(board: Board, tile: BentoTile, slot: number): string[] {
  const row = Math.floor(slot / board.columns);
  const col = slot % board.columns;
  const keys: string[] = [];
  for (let r = row; r < row + tile.rows; r++) for (let c = col; c < col + tile.cols; c++) keys.push(`${r}:${c}`);
  return keys;
}

function place(board: Board, tile: BentoTile, cursor: number): number {
  let slot = cursor;
  const fits = (at: number) =>
    (at % board.columns) + tile.cols <= board.columns && cellsAt(board, tile, at).every((key) => !board.taken.has(key));
  while (!fits(slot)) slot++;
  return slot;
}

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

// decision: FE-009 §6
export function loopPlayState(zone: SlideZone): 'running' | 'paused' {
  return isPlaying(zone) ? 'running' : 'paused';
}
