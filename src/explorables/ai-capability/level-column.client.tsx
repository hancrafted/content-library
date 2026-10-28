'use client';

import type { TargetProps } from '@/shared/lib/context-link.pure';
import { memo, type ReactNode } from 'react';
import styles from './ai-capability.module.css';
import type { Ceiling, LevelWords, SceneWords } from './ai-capability.types';
import { Flip } from './flip.client';
import { CardBackView, CardFrontView, type CardLabels } from './level-card-view';
import { LevelSceneView } from './level-scene-view';
import { CeilingCellView, MismatchCellView, RoleCellView, type GapEnd } from './row-cells-view';
import type { Row } from './rows.pure';
import type { Frame, Level } from './scene-frames.pure';

export interface LevelColumnProps {
  readonly level: Level;
  readonly words: LevelWords;
  readonly scenes: SceneWords;
  readonly labels: CardLabels;
  readonly frame: Frame;
  /** This column is the lit one. */
  readonly on: boolean;
  /** Another column is lit, so this one steps back. */
  readonly dimmed: boolean;
  /** Its scene is running, not resting on its last frame. */
  readonly moving: boolean;
  readonly flipped: boolean;
  readonly onLight: (level: Level | null) => void;
  readonly onFlip: (level: Level) => void;
  readonly target?: TargetProps;
  readonly marker?: ReactNode;
  /** The rows the toolbar adds, in stacking order, and what they need. */
  readonly shown: readonly Row[];
  readonly ceiling: Ceiling;
  readonly gapEnd: GapEnd;
  readonly rowLabels: RowLabels;
}

/** The labels the added rows share across the four Levels. */
export interface RowLabels {
  readonly comparable: string;
  readonly hypothesis: string;
  readonly measured: string;
  readonly promise: string;
  readonly here: string;
  readonly expect: string;
}

/** One added row of this Level, by its key, handed only what the rows read. */
function AddedRow(
  props: { readonly row: Exclude<Row, 'explain'> } & Pick<
    LevelColumnProps,
    'level' | 'words' | 'rowLabels' | 'ceiling' | 'gapEnd'
  >,
) {
  const { row, level, words, rowLabels } = props;
  if (row === 'role') return <RoleCellView level={level} label={rowLabels.comparable} scale={words.scale} />;
  if (row === 'ceiling') return <CeilingCellView words={words} ceiling={props.ceiling} labels={rowLabels} />;
  return <MismatchCellView words={words} end={props.gapEnd} labels={rowLabels} />;
}

/** What an added row needs beyond the Level's words. */
const pick = ({ ceiling, gapEnd }: LevelColumnProps) => ({ ceiling, gapEnd });

/** Hover and focus light the column; leaving it puts the light out. */
const lighting = (level: Level, onLight: LevelColumnProps['onLight']) => ({
  onPointerEnter: () => onLight(level),
  onPointerLeave: () => onLight(null),
  onFocus: () => onLight(level),
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
function Card(props: LevelColumnProps) {
  const { level, words } = props;
  return (
    <Flip
      className={`transition-transform duration-300 motion-reduce:transition-none ${props.on ? '-translate-y-1' : ''}`}
      flipped={props.flipped}
      onFlip={() => props.onFlip(level)}
      label={`${words.name}: ${props.labels.definition}`}
      front={
        <CardFrontView
          words={words}
          labels={props.labels}
          lifted={props.on}
          emerging={level === 'factory'}
          marker={props.marker}
        />
      }
      back={<CardBackView words={words} labels={props.labels} />}
    />
  );
}

/**
 * One Level's column: its dot and years on the rail, its card, the rows the toolbar adds, its scene and its wire to the
 * model. Memoised, so a hover redraws only the columns whose `on` or `dimmed` flipped, and the playing one.
 */
export const LevelColumn = memo(function LevelColumn(props: LevelColumnProps) {
  const { level, words } = props;
  return (
    <li
      data-level={level}
      data-on={props.on}
      data-motion={props.moving ? 'playing' : 'settled'}
      {...props.target}
      {...lighting(level, props.onLight)}
      className={`${styles[level]} ${styles.column} transition-opacity motion-reduce:transition-none ${props.dimmed ? 'opacity-35' : ''}`}
    >
      <RailStop year={words.year} />
      <Card {...props} />
      {props.shown.map((row) =>
        row === 'explain' ? (
          <LevelSceneView
            key={row}
            level={level}
            frame={props.frame}
            words={props.scenes}
            interfaceName={words.interface}
            interfaceHint={words.interfaceHint}
          />
        ) : (
          <AddedRow key={row} row={row} {...{ level, words, rowLabels: props.rowLabels }} {...pick(props)} />
        ),
      )}
    </li>
  );
});
