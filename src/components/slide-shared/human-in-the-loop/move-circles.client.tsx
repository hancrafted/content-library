'use client';

import type { StageMove } from './workflow.types';

/*
 * The BRIEF letters a stage applies, as circled capitals at the top of its column. Each is focusable and carries its
 * own tooltip (why the letter applies to this stage): the tip shows on hover and on keyboard focus, and is the circle's
 * accessible name too.
 */

const CIRCLE =
  'group relative inline-flex size-6 cursor-help items-center justify-center rounded-full border border-foreground bg-card text-caption font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring';

const TIP =
  'pointer-events-none absolute top-full left-0 z-20 mt-1.5 hidden w-56 rounded-lg bg-foreground px-2.5 py-1.5 text-start text-caption font-normal text-background group-hover:block group-focus-visible:block';

export function MoveCircles({ moves, label }: { readonly moves: readonly StageMove[]; readonly label: string }) {
  return (
    <ul className="flex flex-wrap gap-1" data-moves="">
      {moves.map(({ letter, why }) => (
        <li key={letter}>
          <span
            tabIndex={0}
            role="img"
            aria-label={label.replace('{letter}', letter).replace('{why}', why)}
            data-move={letter}
            className={CIRCLE}
          >
            <span aria-hidden="true">{letter}</span>
            <span aria-hidden="true" className={TIP}>
              {why}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
