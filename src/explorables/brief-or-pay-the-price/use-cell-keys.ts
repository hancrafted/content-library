import { useEffect, type Dispatch } from 'react';
import type { CellKey, ExplorableEvent } from './explorable-state.pure';
import { neighbour } from './matrix-data.pure';

const STEPS = { ArrowRight: 1, ArrowLeft: -1 } as const;

export function useCellKeys(cell: CellKey | null, cells: readonly CellKey[], dispatch: Dispatch<ExplorableEvent>) {
  useEffect(() => {
    if (cell === null) return;
    const onKey = ({ key }: KeyboardEvent) => {
      if (key === 'Escape') dispatch({ type: 'closeCell' });
      if (key in STEPS) dispatch({ type: 'openCell', cell: neighbour(cells, cell, STEPS[key as keyof typeof STEPS]) });
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [cell, cells, dispatch]);
}
