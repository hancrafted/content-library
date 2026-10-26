'use client';

import { cn } from '@/shared/lib/utils';
import { useId, type Dispatch, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { Card, type BackLabels, type FlipRow } from './trait-flip-card.client';
import styles from './trait-flip.module.css';
import { rowAt, type FlipEvent, type FlipState, type FlipTarget } from './trait-flip.pure';

/* The trait flip's pieces: a row's chip, cards and backs, and the closing line. `trait-flip.client.tsx` holds the state. */

/** Pointing at or focusing a control opens its target; leaving or blurring it closes it; a tap opens it. */
function controlHandlers(target: FlipTarget, dispatch: Dispatch<FlipEvent>) {
  return {
    onPointerEnter: (event: PointerEvent) => event.pointerType !== 'touch' && dispatch({ type: 'open', target }),
    onPointerLeave: (event: PointerEvent) => event.pointerType !== 'touch' && dispatch({ type: 'leave', target }),
    onFocus: () => dispatch({ type: 'open', target }),
    onBlur: () => dispatch({ type: 'leave', target }),
    onClick: (event: MouseEvent) => {
      event.stopPropagation();
      dispatch({ type: 'open', target });
    },
  };
}

/** A hairline arrow from the chip out to one side: muted towards the freelancer, `ai` towards the AI. */
function Arrow({ toAi }: { toAi: boolean }) {
  return (
    <svg
      viewBox="0 0 24 12"
      className={cn(styles.arrow, toAi ? styles.arrowRight : styles.arrowLeft, 'hidden h-3 w-6 shrink-0 @3xl:block')}
      aria-hidden="true"
    >
      <path
        d={toAi ? 'M1 6h20M17 2l4 4-4 4' : 'M23 6H3M7 2 3 6l4 4'}
        className={cn('fill-none', toAi ? 'stroke-ai' : 'stroke-muted-foreground')}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface ChipProps {
  row: FlipRow;
  expanded: boolean;
  handlers: ReturnType<typeof controlHandlers>;
}

/** The chip: the trait's first letter large, its full name under it; the control that brings in its row. */
function Chip({ row, expanded, handlers }: ChipProps) {
  const asideId = useId();
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-describedby={asideId}
      {...handlers}
      className={cn(
        styles.chip,
        'flex w-40 touch-manipulation flex-col items-center gap-1 rounded-full bg-primary px-4 py-2 text-primary-foreground shadow-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      )}
    >
      <span translate="no" className="text-heading leading-none font-semibold">
        {row.name[0]}
      </span>
      <span translate="no" className="text-caption whitespace-nowrap text-primary-foreground/80">
        {row.name}
      </span>
      <span id={asideId} className="sr-only">
        {row.aside}
      </span>
    </button>
  );
}

/** The centre track: the chip between its two arrows, drawn once its cards show. */
function ChipTrack({ row, expanded, dispatch }: { row: FlipRow; expanded: boolean; dispatch: Dispatch<FlipEvent> }) {
  return (
    <div className="flex items-center justify-center gap-1 @3xl:order-2 @3xl:w-60 @3xl:shrink-0">
      <Arrow toAi={false} />
      <Chip row={row} expanded={expanded} handlers={controlHandlers(row.slug, dispatch)} />
      <Arrow toAi />
    </div>
  );
}

/** One row: the chip between its arrows, the freelancer's card and the AI's; stacked on a narrow Slide. */
export function Row({
  row,
  state,
  dispatch,
  labels,
}: {
  row: FlipRow;
  state: FlipState;
  dispatch: Dispatch<FlipEvent>;
  labels: BackLabels;
}) {
  const { shown, pass, looping, blank, turned } = rowAt(state, row.slug);
  const card = { row, shown, pass, labels, dispatch };
  return (
    <li
      data-target={row.slug}
      className={cn(
        'focus-group__item flex flex-col gap-3 @3xl:flex-row @3xl:items-stretch',
        shown && styles.isShown,
        pass > 0 && styles.isPlayed,
        looping && styles.isLooping,
        blank && styles.isBlank,
      )}
    >
      <ChipTrack row={row} expanded={shown} dispatch={dispatch} />
      <Card {...card} side="freelancer" turned={turned.freelancer} className="@3xl:order-1" />
      <Card {...card} side="ai" turned={turned.ai} className="@3xl:order-3" />
    </li>
  );
}

/** The closing line: a button that shows and wipes every row back to day one, its Context marker beside it. */
export function ClosingLine({
  text,
  marker,
  open,
  dispatch,
}: {
  text: ReactNode;
  marker: ReactNode;
  open: boolean;
  dispatch: Dispatch<FlipEvent>;
}) {
  return (
    <p data-target="closing" className="flex items-center justify-center gap-1 pt-4 text-center text-body">
      <button
        type="button"
        aria-expanded={open}
        {...controlHandlers('closing', dispatch)}
        className={cn(styles.footer, 'touch-manipulation rounded-full px-3 py-1 text-balance')}
      >
        {text}
      </button>
      {marker}
    </p>
  );
}
