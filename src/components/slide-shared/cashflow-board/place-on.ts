import type { CSSProperties } from 'react';
import { lanePlacement, narrowBand } from './cashflow-board.pure';

/**
 * The custom properties that place an item on a column's lane in the board's narrow and wide layouts. A narrow
 * board's lane row starts after the rows of lanes above it, each `--lane-rows` tall, which the board sets.
 */
export function placeOn(column: number, extra: Record<string, string | number> = {}): CSSProperties {
  const { narrowColumn, wideColumn } = lanePlacement(column);
  const narrowRow = `calc(${narrowBand(column)} * var(--lane-rows) + 1)`;
  return { '--nc': narrowColumn, '--nr': narrowRow, '--wc': wideColumn, ...extra } as CSSProperties;
}
