'use client';

import { cn } from '@/lib/utils';
import { useId, type Dispatch, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { ConfidentBack } from './back-confident';
import { EveryWordBilledBack } from './back-every-word-billed';
import { InformedBack } from './back-informed';
import { ProbabilisticBack } from './back-probabilistic';
import { RelentlessBack } from './back-relentless';
import styles from './trait-flip.module.css';
import { rowAt, type FlipEvent, type FlipTarget, type Trait } from './trait-flip.pure';

/* The trait flip's pieces: a row's chip, cards and backs, and the closing line. `trait-flip.client.tsx` holds the state. */

/** One row of the mirror: its trait, the two fronts, and the strings its chip and backs show. */
export interface FlipRow {
  slug: Trait;
  name: string;
  /** The short line both backs show beside their beat. */
  back: string;
  /** The trait's aside in plain words, the chip's accessible description. */
  aside: string;
  freelancer: ReactNode;
  ai: ReactNode;
}

/** The words the backs draw: the prompt box, the handbook's title, the bill and the token count. */
export interface BackLabels {
  prompt: string;
  handbook: string;
  bill: string;
  tokens: string;
}

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

/** Both backs of a row, drawn by its trait. */
function Back({ slug, ai, labels }: { slug: Trait; ai: boolean; labels: BackLabels }) {
  switch (slug) {
    case 'probabilistic':
      return <ProbabilisticBack ai={ai} prompt={labels.prompt} />;
    case 'relentless':
      return <RelentlessBack ai={ai} />;
    case 'informed':
      return <InformedBack ai={ai} handbook={labels.handbook} />;
    case 'confident':
      return <ConfidentBack ai={ai} />;
    case 'every-word-billed':
      return <EveryWordBilledBack ai={ai} unit={ai ? labels.tokens : labels.bill} />;
  }
}

const FRONT = 'flex items-center rounded-2xl px-6 py-4 text-body';
const BACK = 'flex items-center gap-4 rounded-2xl px-5 py-3';
const FREELANCER_SURFACE = 'border border-border bg-card';
const AI_SURFACE = 'border border-ai/40 bg-linear-to-l from-ai/10 to-card shadow-sm shadow-ai/20';

/** One side of a row: its front, and behind it the back that plays; a new pass remounts the back to replay it. */
function Card({
  row,
  ai,
  pass,
  labels,
  className,
}: {
  row: FlipRow;
  ai: boolean;
  pass: number;
  labels: BackLabels;
  className: string;
}) {
  const surface = ai ? AI_SURFACE : FREELANCER_SURFACE;
  return (
    <div className={cn(styles.card, '@3xl:flex-1 @3xl:basis-0', className)}>
      <div className={styles.flip}>
        <p className={cn(styles.front, FRONT, surface)}>{ai ? <span>{row.ai}</span> : row.freelancer}</p>
        <div key={pass} className={cn(styles.back, BACK, surface)} aria-hidden="true">
          <Back slug={row.slug} ai={ai} labels={labels} />
          <span className={cn('min-w-0 text-body font-semibold text-balance', ai && 'text-ai')}>{row.back}</span>
        </div>
      </div>
    </div>
  );
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
        pathLength={1}
        strokeDasharray="1"
        d={toAi ? 'M1 6h20M17 2l4 4-4 4' : 'M23 6H3M7 2 3 6l4 4'}
        className={cn('fill-none', toAi ? 'stroke-ai' : 'stroke-muted-foreground')}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The chip: the trait's first letter large, its full name under it; the one control of its row. */
function Chip({ row, open, handlers }: { row: FlipRow; open: boolean; handlers: ReturnType<typeof controlHandlers> }) {
  const asideId = useId();
  return (
    <button
      type="button"
      aria-expanded={open}
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

/** The centre track: the chip between its two arrows. */
function ChipTrack({ row, open, dispatch }: { row: FlipRow; open: boolean; dispatch: Dispatch<FlipEvent> }) {
  return (
    <div className="flex items-center justify-center gap-1 @3xl:order-2 @3xl:w-60 @3xl:shrink-0">
      <Arrow toAi={false} />
      <Chip row={row} open={open} handlers={controlHandlers(row.slug, dispatch)} />
      <Arrow toAi />
    </div>
  );
}

/** One row: the chip between its arrows, the freelancer's card and the AI's; stacked on a narrow Slide. */
export function Row({
  row,
  open,
  elapsed,
  dispatch,
  labels,
}: {
  row: FlipRow;
  open: boolean;
  elapsed: number;
  dispatch: Dispatch<FlipEvent>;
  labels: BackLabels;
}) {
  const { playing, pass } = open ? rowAt(row.slug, elapsed) : { playing: false, pass: 0 };
  return (
    <li
      data-target={row.slug}
      className={cn(
        'focus-group__item flex flex-col gap-3 @3xl:flex-row @3xl:items-stretch',
        open && styles.isOpen,
        playing && styles.isPlaying,
      )}
    >
      <ChipTrack row={row} open={open} dispatch={dispatch} />
      <Card row={row} ai={false} pass={pass} labels={labels} className="@3xl:order-1" />
      <Card row={row} ai pass={pass} labels={labels} className="@3xl:order-3" />
    </li>
  );
}

/** The closing line: a button that wipes every row back to day one, its Context marker beside it. */
export function ClosingLine({
  text,
  marker,
  open,
  dispatch,
}: {
  text: string;
  marker: ReactNode;
  open: boolean;
  dispatch: Dispatch<FlipEvent>;
}) {
  return (
    <p data-target="closing" className="pt-4 text-center text-body font-semibold">
      <button
        type="button"
        aria-expanded={open}
        {...controlHandlers('closing', dispatch)}
        className={cn(styles.footer, 'touch-manipulation rounded-full px-3 py-1 font-semibold text-balance')}
      >
        {text}
      </button>{' '}
      {marker}
    </p>
  );
}
