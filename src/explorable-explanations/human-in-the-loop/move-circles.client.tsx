'use client';

import { Tip } from '@/shared/components/core-components/tip/tip.client';
import type { StageMove } from './workflow.types';

/*
 * The BRIEF letters a stage applies, as circled capitals at the top of its column. Each is focusable and carries its
 * own tooltip (why the letter applies to this stage): the shared tip shows on hover and on keyboard focus, and the
 * why is the circle's accessible name too. The circle is 24px with a gap between neighbours (WCAG 2.5.8).
 */

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
