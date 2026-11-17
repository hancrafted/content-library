'use client';

import type { TargetProps } from '@/shared/lib/context-link.pure';
import { memo, type ReactNode } from 'react';
import styles from './ai-capability.module.css';
import type { LayerRow, LevelWords, Productivity, SceneWords } from './ai-capability.types';
import { Flip } from './flip.client';
import { LayerSlices, type LayerRowProps } from './layer-row.client';
import { CardBackView, CardFrontView, type CardLabels } from './level-card-view';
import { LevelSceneView } from './level-scene-view';
import { AdoptionCellView, EffortCellView, ProductivityCellView, type AdoptionLabels } from './row-cells-view';
import type { Row } from './rows.pure';
import type { Frame, Level } from './scene-frames.pure';

export interface LevelColumnProps {
  readonly level: Level;
  readonly words: LevelWords;
  readonly scenes: SceneWords;
  readonly labels: CardLabels;
  readonly frame: Frame;
  readonly on: boolean;
  readonly dimmed: boolean;
  readonly moving: boolean;
  readonly flipped: boolean;
  readonly onLight: (level: Level | null) => void;
  readonly onFlip: (level: Level) => void;
  readonly target?: TargetProps;
  readonly marker?: ReactNode;
  readonly sourceMarker?: ReactNode;
  readonly shown: readonly Row[];
  readonly productivity: Productivity;
  readonly rowLabels: RowLabels;
  readonly layers: Readonly<Record<LayerRow, LayerRowProps>>;
}

export interface RowLabels extends AdoptionLabels {
  readonly effort: string;
  readonly measured: string;
  readonly promise: string;
}

const EXPECTED: Level = 'factory';

function AddedRow(
  props: { readonly row: Exclude<Row, 'explain'> } & Pick<
    LevelColumnProps,
    'level' | 'words' | 'rowLabels' | 'productivity' | 'layers'
  >,
) {
  const { row, level, words, rowLabels } = props;
  if (row === 'effort') return <EffortCellView level={level} label={rowLabels.effort} scale={words.scale} />;
  if (row === 'productivity')
    return <ProductivityCellView words={words} range={props.productivity} labels={rowLabels} />;
  if (row === 'adoption')
    return <AdoptionCellView words={words.adoption} expected={level === EXPECTED} labels={rowLabels} />;
  return <LayerSlices {...props.layers[row]} level={level} />;
}

const pick = ({ productivity, layers }: LevelColumnProps) => ({ productivity, layers });

const lighting = (level: Level, onLight: LevelColumnProps['onLight']) => ({
  onPointerEnter: () => onLight(level),
  onPointerLeave: () => onLight(null),
  onFocus: () => onLight(level),
  onBlur: () => onLight(null),
});

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
      back={
        <CardBackView words={words} labels={props.labels} marker={props.marker} sourceMarker={props.sourceMarker} />
      }
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
