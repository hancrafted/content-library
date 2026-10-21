'use client';

import { cn } from '@/lib/utils';
import type { Dispatch, ReactNode } from 'react';
import { ConfidentBack } from './back-confident';
import { EveryWordBilledBack } from './back-every-word-billed';
import { InformedBack } from './back-informed';
import { ProbabilisticBack } from './back-probabilistic';
import { RelentlessBack } from './back-relentless';
import styles from './trait-flip.module.css';
import type { FlipEvent, Side, Trait } from './trait-flip.pure';

/* A row's card: its beat face, the text behind it, and the button that turns one to the other. */

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

/** The words the backs draw: the prompt box, the handbook's title, the bill and the token count; and a card's turn. */
export interface BackLabels {
  prompt: string;
  handbook: string;
  bill: string;
  tokens: string;
  /** The accessible name of the button that turns a card to its text and back. */
  turn: string;
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

const TEXT = 'flex items-center rounded-2xl px-6 py-4 text-body';
const BEAT = 'flex items-center justify-between gap-4 rounded-2xl px-5 py-3';
const FREELANCER_SURFACE = 'border border-border bg-card';
const AI_SURFACE = 'border border-ai/40 bg-linear-to-l from-ai/10 to-card shadow-sm shadow-ai/20';

interface CardProps {
  row: FlipRow;
  side: Side;
  shown: boolean;
  turned: boolean;
  pass: number;
  labels: BackLabels;
  dispatch: Dispatch<FlipEvent>;
  className: string;
}

/** The card's whole face as one button that turns it to its text and back. */
function TurnButton({ row, side, turned, labels, dispatch }: CardProps) {
  return (
    <button
      type="button"
      aria-pressed={turned}
      aria-label={labels.turn}
      onClick={(event) => {
        event.stopPropagation();
        dispatch({ type: 'turn', target: row.slug, side });
      }}
      className={cn(styles.turn, 'rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring')}
    />
  );
}

/** The beat face, mirrored so the drawing sits next to the chip. */
function BeatFace({ row, side, labels }: CardProps) {
  const ai = side === 'ai';
  return (
    <div
      className={cn(styles.face, BEAT, ai ? AI_SURFACE : FREELANCER_SURFACE, !ai && 'flex-row-reverse')}
      aria-hidden="true"
    >
      <Back slug={row.slug} ai={ai} labels={labels} />
      <span className={cn('min-w-0 text-body font-semibold text-balance', ai ? 'text-right text-ai' : 'text-left')}>
        {row.back}
      </span>
    </div>
  );
}

/**
 * One side of a row: the beat face, remounted by a new pass to replay it, and behind it the text a click turns to.
 * Hidden and inert until its row is first shown.
 */
export function Card(props: CardProps) {
  const { row, side, shown, turned, pass, className } = props;
  const ai = side === 'ai';
  return (
    <div
      inert={!shown}
      className={cn(
        styles.card,
        ai ? styles.fromLeft : styles.fromRight,
        shown && styles.isShown,
        turned && styles.isTurned,
        '@3xl:flex-1 @3xl:basis-0',
        className,
      )}
    >
      <TurnButton {...props} />
      <div className={styles.flip}>
        <BeatFace key={pass} {...props} />
        <p inert={!turned} className={cn(styles.text, TEXT, ai ? AI_SURFACE : FREELANCER_SURFACE)}>
          {ai ? <span>{row.ai}</span> : row.freelancer}
        </p>
      </div>
    </div>
  );
}
