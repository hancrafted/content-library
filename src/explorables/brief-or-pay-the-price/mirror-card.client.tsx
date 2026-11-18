'use client';

import { cn } from '@/shared/lib/utils';
import { memo, type ReactNode } from 'react';
import type { SceneKey, Words } from './brief-or-pay-the-price.types';
import type { Side } from './explorable-state.pure';
import styles from './mirror.module.css';
import {
  AutonomyScene,
  BackwardsScene,
  ContractsScene,
  EngineerTrustScene,
  ResolveDependenciesScene,
} from './scene-brace';
import {
  BreakItDownScene,
  EvaluateEachStepScene,
  FreshStartScene,
  InterviewYourselfScene,
  RequirementsFirstScene,
} from './scene-brief';
import { ConfidentScene } from './scene-confident';
import { EveryWordBilledScene } from './scene-every-word-billed';
import { InformedScene } from './scene-informed';
import { ProbabilisticScene } from './scene-probabilistic';
import { RelentlessScene } from './scene-relentless';
import { CheckScene, DraftScene, GrillScene, HardenScene, ParallelScene, PlanScene } from './scene-stages';

export interface SceneLabels {
  readonly backs: Words['backs'];
  readonly turn: string;
}

interface SceneProps {
  readonly ai: boolean;
  readonly labels: SceneLabels;
}

const SCENES: Readonly<Record<SceneKey, (props: SceneProps) => ReactNode>> = {
  probabilistic: ({ ai, labels }) => <ProbabilisticScene ai={ai} prompt={labels.backs.prompt} />,
  relentless: ({ ai }) => <RelentlessScene ai={ai} />,
  informed: ({ ai, labels }) => (
    <InformedScene ai={ai} handbook={labels.backs.handbook} words={labels.backs.handbookWords} />
  ),
  confident: ({ ai }) => <ConfidentScene ai={ai} />,
  'every-word-billed': ({ ai, labels }) => (
    <EveryWordBilledScene ai={ai} unit={ai ? labels.backs.tokens : labels.backs.bill} />
  ),
  'break-it-down': ({ ai }) => <BreakItDownScene ai={ai} />,
  'requirements-first': ({ ai }) => <RequirementsFirstScene ai={ai} />,
  'interview-yourself-with-ai': ({ ai }) => <InterviewYourselfScene ai={ai} />,
  'evaluate-each-step': ({ ai }) => <EvaluateEachStepScene ai={ai} />,
  'fresh-start-for-each-piece': ({ ai, labels }) => <FreshStartScene ai={ai} word={labels.backs.fresh} />,
  'backwards-from-the-goal': ({ ai }) => <BackwardsScene ai={ai} />,
  'resolve-dependencies-early': ({ ai }) => <ResolveDependenciesScene ai={ai} />,
  'autonomy-through-intent': ({ ai }) => <AutonomyScene ai={ai} />,
  'contracts-at-the-seams': ({ ai }) => <ContractsScene ai={ai} />,
  'engineer-trust': ({ ai }) => <EngineerTrustScene ai={ai} />,
  grill: ({ ai }) => <GrillScene ai={ai} />,
  plan: ({ ai }) => <PlanScene ai={ai} />,
  parallel: ({ ai }) => <ParallelScene ai={ai} />,
  check: ({ ai }) => <CheckScene ai={ai} />,
  harden: ({ ai }) => <HardenScene ai={ai} />,
  draft: ({ ai }) => <DraftScene ai={ai} />,
};

function Scene({ id, ...props }: SceneProps & { readonly id: SceneKey }) {
  return SCENES[id](props);
}

const TEXT = 'flex items-center rounded-2xl px-6 py-4 text-body';
const BEAT = 'flex items-center justify-between gap-4 rounded-2xl px-5 py-3';
const FREELANCER_SURFACE = 'border border-border bg-card';
const AI_SURFACE = 'border border-ai/40 bg-linear-to-l from-ai/10 to-card shadow-sm shadow-ai/20';

export interface CardProps {
  readonly id: SceneKey;
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
