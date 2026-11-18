'use client';

import { cn } from '@/shared/lib/utils';
import { memo, type ReactNode } from 'react';
import type { TraitId, Words } from './brief-or-pay-the-price.types';
import type { Side } from './explorable-state.pure';
import styles from './mirror.module.css';
import { ConfidentScene } from './scene-confident';
import { EveryWordBilledScene } from './scene-every-word-billed';
import { InformedScene } from './scene-informed';
import { ProbabilisticScene } from './scene-probabilistic';
import { RelentlessScene } from './scene-relentless';

export interface SceneLabels {
  readonly backs: Words['backs'];
  readonly turn: string;
}

interface SceneProps {
  readonly ai: boolean;
  readonly labels: SceneLabels;
}

const SCENES: Readonly<Record<TraitId, (props: SceneProps) => ReactNode>> = {
  probabilistic: ({ ai, labels }) => <ProbabilisticScene ai={ai} prompt={labels.backs.prompt} />,
  relentless: ({ ai }) => <RelentlessScene ai={ai} />,
  informed: ({ ai, labels }) => (
    <InformedScene ai={ai} handbook={labels.backs.handbook} words={labels.backs.handbookWords} />
  ),
  confident: ({ ai }) => <ConfidentScene ai={ai} />,
  'every-word-billed': ({ ai, labels }) => (
    <EveryWordBilledScene ai={ai} unit={ai ? labels.backs.tokens : labels.backs.bill} />
  ),
};

function Scene({ id, ...props }: SceneProps & { readonly id: TraitId }) {
  return SCENES[id](props);
}

const TEXT = 'flex items-center rounded-2xl px-6 py-4 text-body';
const BEAT = 'flex items-center justify-between gap-4 rounded-2xl px-5 py-3';
const FREELANCER_SURFACE = 'border border-border bg-card';
const AI_SURFACE = 'border border-ai/40 bg-linear-to-l from-ai/10 to-card shadow-sm shadow-ai/20';

export interface CardProps {
  readonly id: TraitId;
  readonly side: Side;
  readonly short: string;
  readonly text: ReactNode;
  readonly shown: boolean;
  readonly turned: boolean;
  readonly pass: number;
  readonly labels: SceneLabels;
  readonly index: number;
  readonly onTurn: (row: number, side: Side) => void;
  readonly className?: string;
}

function TurnButton({ turned, label, onTurn }: { turned: boolean; label: string; onTurn: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={turned}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onTurn();
      }}
      className={cn(styles.turn, 'rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring')}
    />
  );
}

function BeatFace({ id, side, short, labels }: Pick<CardProps, 'id' | 'side' | 'short' | 'labels'>) {
  const ai = side === 'ai';
  return (
    <div
      className={cn(styles.face, BEAT, ai ? AI_SURFACE : FREELANCER_SURFACE, !ai && 'flex-row-reverse')}
      aria-hidden="true"
    >
      <Scene id={id} ai={ai} labels={labels} />
      <span className={cn('min-w-0 text-body font-semibold text-balance', ai ? 'text-right text-ai' : 'text-left')}>
        {short}
      </span>
    </div>
  );
}

// decision: FE-012 §4.2
export const Card = memo(function Card(props: CardProps) {
  const { id, side, short, text, shown, turned, pass, labels, index, onTurn, className } = props;
  const ai = side === 'ai';
  return (
    <div
      inert={!shown}
      data-card={side}
      className={cn(
        styles.card,
        ai ? styles.fromLeft : styles.fromRight,
        shown && styles.isShown,
        turned && styles.isTurned,
        className,
      )}
    >
      <TurnButton turned={turned} label={labels.turn} onTurn={() => onTurn(index, side)} />
      <div className={styles.flip}>
        <BeatFace key={pass} id={id} side={side} short={short} labels={labels} />
        <p inert={!turned} className={cn(styles.text, TEXT, ai ? AI_SURFACE : FREELANCER_SURFACE)}>
          {text}
        </p>
      </div>
    </div>
  );
});
