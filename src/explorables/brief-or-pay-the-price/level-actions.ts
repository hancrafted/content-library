import type { CellKey } from './explorable-state.pure';

export interface LevelActions {
  readonly onWorkflow: () => void;
  readonly onCloseCell: () => void;
  readonly onCell: (cell: CellKey) => void;
  readonly onNode: (node: string) => void;
  readonly onStep: (step: number) => void;
  readonly onPlay: () => void;
  readonly onTick: () => void;
}
