'use client';

import type { TargetProps } from '@/shared/lib/context-link.pure';
import { memo, type ReactNode } from 'react';
import styles from './ai-disciplines.module.css';
import type { DisciplineWords, SceneWords } from './ai-disciplines.types';
import { CardBackView, CardFrontView, type CardLabels } from './discipline-card-view';
import { DisciplineSceneView } from './discipline-scene-view';
import { Flip } from './flip.client';
import type { Discipline, Frame } from './scene-frames.pure';

export interface DisciplineColumnProps {
  readonly discipline: Discipline;
  readonly words: DisciplineWords;
  readonly scenes: SceneWords;
  readonly labels: CardLabels;
  readonly frame: Frame;
  /** This column is the lit one. */
  readonly on: boolean;
  /** Another column is lit, so this one steps back. */
  readonly dimmed: boolean;
  readonly flipped: boolean;
  readonly onLight: (discipline: Discipline | null) => void;
  readonly onFlip: (discipline: Discipline) => void;
  readonly target?: TargetProps;
  readonly marker?: ReactNode;
}

/** Hover and focus light the column; leaving it puts the light out. */
const lighting = (discipline: Discipline, onLight: DisciplineColumnProps['onLight']) => ({
  onPointerEnter: () => onLight(discipline),
  onPointerLeave: () => onLight(null),
  onFocus: () => onLight(discipline),
  onBlur: () => onLight(null),
});

/** The column's dot on the rail, centred over it, and its years. */
function RailStop({ year }: { readonly year: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        aria-hidden="true"
        className="relative z-10 size-4 rounded-full border-4 border-background bg-(--tone) ring-2 ring-(--tone)"
      />
      <span className="text-caption font-semibold text-(--tone) tabular-nums">{year}</span>
    </div>
  );
}

/** The column's card: the front names the stage and lifts when lit, the back gives its definition. */
function Card(props: DisciplineColumnProps) {
  const { discipline, words } = props;
  return (
    <Flip
      className={`transition-transform duration-300 motion-reduce:transition-none ${props.on ? '-translate-y-1' : ''}`}
      flipped={props.flipped}
      onFlip={() => props.onFlip(discipline)}
      label={`${words.name}: ${props.labels.definition}`}
      front={
        <CardFrontView
          words={words}
          labels={props.labels}
          lifted={props.on}
          emerging={discipline === 'factory'}
          marker={props.marker}
        />
      }
      back={<CardBackView words={words} labels={props.labels} />}
    />
  );
}

/**
 * One discipline's column: its dot and years on the rail, its card, its scene and its wire to the model. Memoised, so
 * a hover redraws only the columns whose `on` or `dimmed` flipped, and the playing one.
 */
export const DisciplineColumn = memo(function DisciplineColumn(props: DisciplineColumnProps) {
  const { discipline, words } = props;
  return (
    <li
      data-discipline={discipline}
      data-on={props.on}
      {...props.target}
      {...lighting(discipline, props.onLight)}
      className={`${styles[discipline]} ${styles.column} grid gap-3 transition-opacity motion-reduce:transition-none ${props.dimmed ? 'opacity-35' : ''}`}
    >
      <RailStop year={words.year} />
      <Card {...props} />
      <DisciplineSceneView
        discipline={discipline}
        frame={props.frame}
        words={props.scenes}
        interfaceName={words.interface}
        interfaceHint={words.interfaceHint}
      />
    </li>
  );
});
