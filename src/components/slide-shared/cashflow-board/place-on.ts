import type { CSSProperties } from 'react';
import { lanePlacement } from './cashflow-board.pure';

/** The custom properties that place an item on a column's lane in the board's narrow and wide layouts. */
export function placeOn(column: number, extra: Record<string, string | number> = {}): CSSProperties {
  const { narrowColumn, narrowRow, wideColumn } = lanePlacement(column);
  return { '--nc': narrowColumn, '--nr': narrowRow, '--wc': wideColumn, ...extra } as CSSProperties;
}
