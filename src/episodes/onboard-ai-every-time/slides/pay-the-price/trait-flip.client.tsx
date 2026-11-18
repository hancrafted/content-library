'use client';

import { useSlideZone } from '@/episodes/hooks/use-slide-zone';
import { isPlaying } from '@/episodes/lib/slide-zone.pure';
import { cn } from '@/shared/lib/utils';
import { useCallback, useEffect, useReducer, type ReactNode } from 'react';
import type { BackLabels, FlipRow } from './trait-flip-card.client';
import { ClosingLine, Row } from './trait-flip-row.client';
import styles from './trait-flip.module.css';
import { CLOSED, flip, nextTimer, type FlipTarget } from './trait-flip.pure';

interface TraitFlipProps {
  rows: readonly FlipRow[];
  closing: ReactNode;
  closingMarker: ReactNode;
  labels: BackLabels;
}

function useFlip() {
  const [state, dispatch] = useReducer(flip, CLOSED);
  const { open, blank } = state;
  const pass = open === null || open === 'closing' ? 0 : state.passes[open];
  useEffect(() => {
    const timer = nextTimer({ open, blank });
    if (timer === null) return;
    const id = window.setTimeout(() => dispatch(timer.event), timer.milliseconds);
    return () => window.clearTimeout(id);
  }, [open, blank, pass]);
  return { state, dispatch };
}

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
