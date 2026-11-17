'use client';

import { Tip } from '@/shared/components/core-components/tip/tip.client';
import type { StageMove } from './workflow.types';

const CIRCLE =
  'inline-flex size-6 cursor-help items-center justify-center rounded-full border border-foreground bg-card text-caption font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function MoveCircles({ moves, label }: { readonly moves: readonly StageMove[]; readonly label: string }) {
  return (
    <ul className="flex flex-wrap gap-1.5" data-moves="">
      {moves.map(({ letter, why }) => (
        <li key={letter}>
          <Tip text={why} align="start">
            <span
              tabIndex={0}
              role="img"
              aria-label={label.replace('{letter}', letter).replace('{why}', why)}
              data-move={letter}
              className={CIRCLE}
            >
              {letter}
            </span>
          </Tip>
        </li>
      ))}
    </ul>
  );
}
