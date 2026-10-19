'use client';

import { useSlideZone } from '@/hooks/use-slide-zone';
import { isPlaying } from '@/lib/slide-zone.pure';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useReducer, useState, type ReactNode } from 'react';
import { ClosingLine, Row, type BackLabels, type FlipRow } from './trait-flip-row.client';
import styles from './trait-flip.module.css';
import { CLOSED, flip, nextChangeIn, wipeAt, type FlipTarget } from './trait-flip.pure';

interface TraitFlipProps {
  rows: readonly FlipRow[];
  closing: string;
  /** The Context marker after the closing line, outside its button. */
  closingMarker: ReactNode;
  labels: BackLabels;
}

/** The open target and how long it has been open, advanced only at the next change the rules name. */
function useFlip() {
  const [state, dispatch] = useReducer(flip, CLOSED);
  const [clock, setClock] = useState<{ target: FlipTarget | null; elapsed: number }>({ target: null, elapsed: 0 });
  // A new target restarts the clock, read during render rather than in an effect.
  const elapsed = clock.target === state.open ? clock.elapsed : 0;
  if (clock.target !== state.open) setClock({ target: state.open, elapsed: 0 });
  useEffect(() => {
    const open = state.open;
    if (open === null) return;
    const wait = nextChangeIn(open, elapsed);
    const timer = window.setTimeout(() => setClock({ target: open, elapsed: elapsed + wait }), wait);
    return () => window.clearTimeout(timer);
  }, [state.open, elapsed]);
  return { open: state.open, elapsed, dispatch };
}

/** Closes on a tap elsewhere, on Escape, and whenever the Slide leaves `active`, so no beat or clock runs off-screen. */
function useDismiss(open: FlipTarget | null, dismiss: () => void) {
  const playing = isPlaying(useSlideZone());
  useEffect(() => {
    if (!playing) dismiss();
  }, [playing, dismiss]);
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
 * The trait flip (.scratch/freelancer-trait-flip/handoff.md): pointing at or focusing a chip flips its row, and both
 * backs play the same beat, hold the last frame and replay; the closing line wipes every row back to day one. The
 * fronts are the print and static-HTML state; the rules live in `trait-flip.pure.ts`.
 */
export function TraitFlip({ rows, closing, closingMarker, labels }: TraitFlipProps) {
  const { open, elapsed, dispatch } = useFlip();
  const dismiss = useCallback(() => dispatch({ type: 'dismiss' }), [dispatch]);
  useDismiss(open, dismiss);
  const wipe = open === 'closing' ? wipeAt(elapsed) : { flipped: false, blank: false };
  return (
    <div className={cn(styles.root, 'flex flex-col gap-8')}>
      <ol
        className={cn(
          'focus-group focus-group--dim-others flex flex-col gap-3',
          wipe.flipped && styles.isWiping,
          wipe.blank && styles.isBlank,
        )}
      >
        {rows.map((row) => (
          <Row
            key={row.slug}
            row={row}
            open={open === row.slug}
            elapsed={elapsed}
            dispatch={dispatch}
            labels={labels}
          />
        ))}
      </ol>
      <ClosingLine text={closing} marker={closingMarker} open={open === 'closing'} dispatch={dispatch} />
    </div>
  );
}
