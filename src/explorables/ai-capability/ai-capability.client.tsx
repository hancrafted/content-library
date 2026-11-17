'use client';

import type { TargetProps } from '@/shared/lib/context-link.pure';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import styles from './ai-capability.module.css';
import type { AiCapabilityPreset, AiCapabilityWords, LayerRow, LayerSpan, Productivity } from './ai-capability.types';
import { LAYER_ROWS, useLayerLight, useLayerRows } from './layer-light.client';
import { LayerRowWide, type LayerRowProps } from './layer-row.client';
import { CarouselNav, useCarousel } from './level-carousel.client';
import { LevelColumn } from './level-column.client';
import { LlmBand } from './llm-band.client';
import { RowToolbar } from './row-toolbar.client';
import { OPENING_ROWS, gridLine, gridRows, toggleRow, type Row } from './rows.pure';
import { LEVELS, onWire, type Frame, type Level } from './scene-frames.pure';
import { useScenePlayer } from './scene-player.client';

export interface AiCapabilityClientProps {
  readonly preset: AiCapabilityPreset;
  readonly words: AiCapabilityWords;
  readonly productivity: Readonly<Record<Level, Productivity>>;
  readonly layers: Readonly<Record<LayerRow, readonly LayerSpan[]>>;
  readonly targets?: Partial<Record<Level, TargetProps>>;
  readonly rowTargets?: Partial<Record<LayerRow, TargetProps>>;
  readonly markers?: Partial<Record<Level, ReactNode>>;
  readonly sourceMarkers?: Partial<Record<Level, ReactNode>>;
}

function Rail({
  list,
  rows,
  children,
}: {
  readonly list: RefObject<HTMLOListElement | null>;
  readonly rows: number;
  readonly children: ReactNode;
}) {
  return (
    <div className="relative">
      <div aria-hidden="true" className={`${styles.rail} absolute inset-x-[12.5%] top-0`} />
      <ol ref={list} className={`${styles.columns} relative`} style={{ '--rows': rows } as CSSProperties}>
        {children}
      </ol>
    </div>
  );
}

type Turnable = Level | 'llm';

const busyOf = (frames: Readonly<Record<Level, Frame>>) =>
  Object.fromEntries(LEVELS.map((each) => [each, onWire(frames[each]).length > 0])) as Record<Level, boolean>;

// decision: FE-009 §6.1
function useSwipePlays(carousel: ReturnType<typeof useCarousel>, playOne: (level: Level) => void) {
  const shown = useRef(carousel.index);
  useEffect(() => {
    if (!carousel.narrow || shown.current === carousel.index) return;
    shown.current = carousel.index;
    const level = LEVELS[carousel.index];
    if (level !== undefined) playOne(level);
  }, [carousel.narrow, carousel.index, playOne]);
}

function useTimeline(root: RefObject<HTMLDivElement | null>, preset: AiCapabilityPreset) {
  const list = useRef<HTMLOListElement>(null);
  const carousel = useCarousel(list);
  const [hovered, setHovered] = useState<Level | null>(null);
  const [shown, setShown] = useState<readonly Row[]>(OPENING_ROWS);
  const [flipped, setFlipped] = useState<Partial<Record<Turnable, boolean>>>(() =>
    preset.turned ? { [preset.turned]: true } : {},
  );
  const lit = hovered ?? preset.lit;
  const { frames, playAll, playOne, playing } = useScenePlayer(root, preset.autoplay, hovered);
  useSwipePlays(carousel, playOne);
  const onFlip = useCallback((each: Turnable) => setFlipped((now) => ({ ...now, [each]: !now[each] })), []);
  const onToggle = useCallback((row: Row) => setShown((now) => toggleRow(now, row)), []);
  const layer = useLayerLight();
  const active = busyOf(frames);
  const working = hovered !== null || Object.values(active).some(Boolean);
  const band = { active, working, flipped: flipped.llm ?? false, onFlip: () => onFlip('llm') };
  return { list, carousel, lit, playing, frames, playAll, flipped, onFlip, setHovered, shown, onToggle, band, layer };
}

function useShared(words: AiCapabilityWords) {
  return useMemo(
    () => ({
      labels: { definition: words.definition, flip: words.flip, source: words.source, newTab: words.newTab },
      rowLabels: {
        effort: words.rows.effort,
        hypothesis: words.hypothesis,
        measured: words.measured,
        promise: words.promise,
        noData: words.noData,
        expect: words.expect,
        expectation: words.expectation,
        expectationSource: words.expectationSource,
      },
      toolbar: { rows: words.rows, playAll: words.playAll },
      nav: { previous: words.previous, next: words.next },
    }),
    [words],
  );
}

function WideLayerRows(props: {
  readonly shown: readonly Row[];
  readonly rows: Readonly<Record<LayerRow, LayerRowProps>>;
}) {
  return LAYER_ROWS.map((row) => {
    const line = gridLine(props.shown, row);
    return line === null ? null : <LayerRowWide key={row} {...props.rows[row]} line={line} />;
  });
}

function Levels(
  props: AiCapabilityClientProps & {
    readonly state: ReturnType<typeof useTimeline>;
    readonly labels: ReturnType<typeof useShared>['labels'];
    readonly rowLabels: ReturnType<typeof useShared>['rowLabels'];
    readonly layerRows: Readonly<Record<LayerRow, LayerRowProps>>;
  },
) {
  const { words, productivity, targets, markers, sourceMarkers, state, layerRows } = props;
  const { lit, playing, frames, flipped, shown } = state;
  return (
    <Rail list={state.list} rows={gridRows(shown)}>
      {LEVELS.map((each) => (
        <LevelColumn
          key={each}
          level={each}
          {...{ words: words.levels[each], scenes: words.scenes, labels: props.labels, rowLabels: props.rowLabels }}
          {...{ frame: frames[each], on: lit === each, dimmed: lit !== null && lit !== each, moving: playing === each }}
          {...{ flipped: flipped[each] ?? false, onLight: state.setHovered, onFlip: state.onFlip }}
          {...{ target: targets?.[each], marker: markers?.[each], sourceMarker: sourceMarkers?.[each] }}
          {...{ shown, productivity: productivity[each], layers: layerRows }}
        />
      ))}
      <WideLayerRows shown={shown} rows={layerRows} />
    </Rail>
  );
}

export function AiCapabilityClient(props: AiCapabilityClientProps) {
  const root = useRef<HTMLDivElement>(null);
  const state = useTimeline(root, props.preset);
  const { labels, rowLabels, toolbar, nav } = useShared(props.words);
  const layerRows = useLayerRows(props.layers, props.words, state.layer);
  const { shown } = state;
  return (
    <div ref={root} className="@container flex flex-col gap-3">
      <RowToolbar
        words={toolbar}
        shown={shown}
        targets={props.rowTargets}
        onToggle={state.onToggle}
        onPlayAll={state.playAll}
      />
      <Levels {...props} state={state} labels={labels} rowLabels={rowLabels} layerRows={layerRows} />
      <CarouselNav count={LEVELS.length} index={state.carousel.index} onStep={state.carousel.step} labels={nav} />
      <LlmBand words={props.words.llm} labels={labels} {...state.band} />
    </div>
  );
}
