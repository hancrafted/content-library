'use client';

import type { BoardThoughtExperimentWords } from './brief-or-pay-the-price.types';
import { SeamArc } from './seam-arc.client';
import { BoardThoughtExperimentView, SEAM } from './thought-experiment-board-view';

export function BoardThoughtExperiment({ words }: { readonly words: BoardThoughtExperimentWords }) {
  return (
    <BoardThoughtExperimentView words={words} seam={<SeamArc from={SEAM.from} to={SEAM.to} label={words.seam} />} />
  );
}
