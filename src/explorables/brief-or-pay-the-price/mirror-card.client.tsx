'use client';

import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
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

function Scene({ id, ai, labels }: { readonly id: TraitId; readonly ai: boolean; readonly labels: SceneLabels }) {
  const { backs } = labels;
  switch (id) {
    case 'probabilistic':
      return <ProbabilisticScene ai={ai} prompt={backs.prompt} />;
    case 'relentless':
      return <RelentlessScene ai={ai} />;
    case 'informed':
      return <InformedScene ai={ai} handbook={backs.handbook} words={backs.handbookWords} />;
    case 'confident':
      return <ConfidentScene ai={ai} />;
    case 'every-word-billed':
      return <EveryWordBilledScene ai={ai} unit={ai ? backs.tokens : backs.bill} />;
  }
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
  readonly onTurn: () => void;
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

export function Card(props: CardProps) {
  const { id, side, short, text, shown, turned, pass, labels, onTurn, className } = props;
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
      <TurnButton turned={turned} label={labels.turn} onTurn={onTurn} />
      <div className={styles.flip}>
        <BeatFace key={pass} id={id} side={side} short={short} labels={labels} />
        <p inert={!turned} className={cn(styles.text, TEXT, ai ? AI_SURFACE : FREELANCER_SURFACE)}>
          {text}
        </p>
      </div>
    </div>
  );
}
