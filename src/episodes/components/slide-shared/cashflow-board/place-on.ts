import type { CSSProperties } from 'react';
import { lanePlacement } from './cashflow-board.pure';

export function placeOn(column: number, extra: Record<string, string | number> = {}): CSSProperties {
  const { narrowColumn, narrowBand, wideColumn } = lanePlacement(column);
  const narrowRow = `calc(${narrowBand} * var(--lane-rows) + 1)`;
  return { '--nc': narrowColumn, '--nr': narrowRow, '--wc': wideColumn, ...extra } as CSSProperties;
}
