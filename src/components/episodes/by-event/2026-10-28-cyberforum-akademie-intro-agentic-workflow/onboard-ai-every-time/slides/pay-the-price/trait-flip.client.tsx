'use client';

import { useSlideZone } from '@/hooks/use-slide-zone';
import { isPlaying } from '@/lib/slide-zone.pure';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useReducer, type ReactNode } from 'react';
import type { BackLabels, FlipRow } from './trait-flip-card.client';
import { ClosingLine, Row } from './trait-flip-row.client';
import styles from './trait-flip.module.css';
import { CLOSED, flip, nextTimer, type FlipTarget } from './trait-flip.pure';

interface TraitFlipProps {
  rows: readonly FlipRow[];
  closing: ReactNode;
  /** The Context marker after the closing line, outside its button. */
  closingMarker: ReactNode;
  labels: BackLabels;
}

/** The flip's state, with the one timer its rules name: the pointed row's next replay, or the wipe's blank. */
function useFlip() {
  const [state, dispatch] = useReducer(flip, CLOSED);
  const { open, blank } = state;
  // The pointed row's pass restarts the timer after each replay; turning a card does not push the next one back.
  const pass = open === null || open === 'closing' ? 0 : state.passes[open];
  useEffect(() => {
    const timer = nextTimer({ open, blank });
    if (timer === null) return;
    const id = window.setTimeout(() => dispatch(timer.event), timer.ms);
    return () => window.clearTimeout(id);
  }, [open, blank, pass]);
  return { state, dispatch };
}

/** Closes on a tap elsewhere or Escape; back to rest whenever the Slide leaves `active`, so no clock runs off-screen. */
function useDismiss(open: FlipTarget | null, dismiss: () => void, reset: () => void) {
  const playing = isPlaying(useSlideZone());
  useEffect(() => {
    if (!playing) reset();
  }, [playing, reset]);
  useEffect(() => {
    if (open === null) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && dismiss();
    document.addEventListener('click', dismiss);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', dismiss);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, dismiss]);
}

/**
 * The trait flip (.scratch/price-progressive-disclosure/handoff.md): at rest only the chips show. Pointing at or
 * focusing a chip brings in its row's two cards playing the same beat, looping while it is pointed at; left, the row
 * stays and its pass runs out. A click turns a card to its text and back. The closing line shows every row and blanks
 * it, back to day one, until it is left. Print shows every card's text; the rules live in `trait-flip.pure.ts`.
 */
export function TraitFlip({ rows, closing, closingMarker, labels }: TraitFlipProps) {
  const { state, dispatch } = useFlip();
  const dismiss = useCallback(() => dispatch({ type: 'dismiss' }), [dispatch]);
  const reset = useCallback(() => dispatch({ type: 'reset' }), [dispatch]);
  useDismiss(state.open, dismiss, reset);
  return (
    <div className={cn(styles.root, 'flex flex-col gap-8')}>
      <ol className="focus-group focus-group--dim-others flex flex-col gap-3">
        {rows.map((row) => (
          <Row key={row.slug} row={row} state={state} dispatch={dispatch} labels={labels} />
        ))}
      </ol>
      <ClosingLine text={closing} marker={closingMarker} open={state.open === 'closing'} dispatch={dispatch} />
    </div>
  );
}
