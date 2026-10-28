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
import type { AiCapabilityPreset, AiCapabilityWords, Ceiling } from './ai-capability.types';
import { CarouselNav, useCarousel } from './level-carousel.client';
import { LevelColumn } from './level-column.client';
import { LlmBand } from './llm-band.client';
import type { GapEnd } from './row-cells-view';
import { RowToolbar } from './row-toolbar.client';
import { OPENING_ROWS, gridRows, toggleRow, type Row } from './rows.pure';
import { LEVELS, onWire, type Frame, type Level } from './scene-frames.pure';
import { useScenePlayer } from './scene-player.client';

export interface AiCapabilityClientProps {
  readonly preset: AiCapabilityPreset;
  readonly words: AiCapabilityWords;
  readonly ceilings: Readonly<Record<Level, Ceiling>>;
  readonly targets?: Partial<Record<Level, TargetProps>>;
  readonly markers?: Partial<Record<Level, ReactNode>>;
}

/** The Mismatch band starts where most people are and ends at what leaders expect. */
const GAP_ENDS: Record<Level, GapEnd> = { prompting: 'here', agents: null, workflows: null, factory: 'expect' };

/** The four Levels on one rail, which runs from the first column's centre to the last one's in a wide container. */
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

/** What turns over: each Level's card and the model band. */
type Turnable = Level | 'llm';

/** Which wires carry a message in their current frame. */
const busyOf = (frames: Readonly<Record<Level, Frame>>) =>
  Object.fromEntries(LEVELS.map((each) => [each, onWire(frames[each]).length > 0])) as Record<Level, boolean>;

/**
 * A Level the reader swipes to in the carousel plays its scene once, then rests: a one-shot, so nothing loops while the
 * Slide is off screen (FE-009 §6.1). The card the page opens on stays at rest.
 */
function useSwipePlays(carousel: ReturnType<typeof useCarousel>, playOne: (level: Level) => void) {
  const shown = useRef(carousel.index);
  useEffect(() => {
    if (!carousel.narrow || shown.current === carousel.index) return;
    shown.current = carousel.index;
    const level = LEVELS[carousel.index];
    if (level !== undefined) playOne(level);
  }, [carousel.narrow, carousel.index, playOne]);
}

/**
 * The parent's state: the lit Level, the shown rows, the turned cards, the carousel and the scene player. In a narrow
 * container the card swiped to plays its scene once; hovering a column in a wide one loops it.
 */
function useTimeline(root: RefObject<HTMLDivElement | null>, preset: AiCapabilityPreset) {
  const list = useRef<HTMLOListElement>(null);
  const carousel = useCarousel(list);
  const [hovered, setHovered] = useState<Level | null>(null);
  const [shown, setShown] = useState<readonly Row[]>(OPENING_ROWS);
  const [flipped, setFlipped] = useState<Partial<Record<Turnable, boolean>>>({});
  const lit = hovered ?? preset.lit;
  const { frames, playAll, playOne, playing } = useScenePlayer(root, preset.autoplay, hovered);
  useSwipePlays(carousel, playOne);
  const onFlip = useCallback((each: Turnable) => setFlipped((now) => ({ ...now, [each]: !now[each] })), []);
  const onToggle = useCallback((row: Row) => setShown((now) => toggleRow(now, row)), []);
  const active = busyOf(frames);
  // The tokens keep coming while a wire is busy or a scene is playing for the reader.
  const working = hovered !== null || Object.values(active).some(Boolean);
  const band = { active, working, flipped: flipped.llm ?? false, onFlip: () => onFlip('llm') };
  return { list, carousel, lit, playing, frames, playAll, flipped, onFlip, setHovered, shown, onToggle, band };
}

/** The words every column shares: the card labels and the added rows' labels. */
function useShared(words: AiCapabilityWords) {
  return useMemo(
    () => ({
      labels: { definition: words.definition, flip: words.flip, source: words.source, newTab: words.newTab },
      rowLabels: {
        comparable: words.comparable,
        hypothesis: words.hypothesis,
        measured: words.measured,
        promise: words.promise,
        here: words.here,
        expect: words.expect,
      },
      toolbar: { rows: words.rows, playAll: words.playAll },
      nav: { previous: words.previous, next: words.next },
    }),
    [words],
  );
}

/** The four Levels on the rail, each column handed its slice of the parent's state. */
function Levels(
  props: AiCapabilityClientProps & {
    readonly state: ReturnType<typeof useTimeline>;
    readonly labels: ReturnType<typeof useShared>['labels'];
    readonly rowLabels: ReturnType<typeof useShared>['rowLabels'];
  },
) {
  const { words, ceilings, targets, markers, state } = props;
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
          {...{ target: targets?.[each], marker: markers?.[each] }}
          {...{ shown, ceiling: ceilings[each], gapEnd: GAP_ENDS[each] }}
        />
      ))}
    </Rail>
  );
}

/**
 * The parent of the timeline: it owns the lit Level (hover, focus or the card in view, else the Preset's), the rows
 * the toolbar adds, the turned cards and the scene player, and hands each part its slice. Toolbar on top, the four
 * Levels on a rail (a carousel when the container is narrow), the model under them.
 */
export function AiCapabilityClient(props: AiCapabilityClientProps) {
  const root = useRef<HTMLDivElement>(null);
  const state = useTimeline(root, props.preset);
  const { labels, rowLabels, toolbar, nav } = useShared(props.words);
  const { shown } = state;
  return (
    <div ref={root} className="@container flex flex-col gap-3">
      <RowToolbar words={toolbar} shown={shown} onToggle={state.onToggle} onPlayAll={state.playAll} />
      <Levels {...props} state={state} labels={labels} rowLabels={rowLabels} />
      <CarouselNav count={LEVELS.length} index={state.carousel.index} onStep={state.carousel.step} labels={nav} />
      <LlmBand words={props.words.llm} labels={labels} {...state.band} />
    </div>
  );
}
