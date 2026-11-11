'use client';

import { memo, type CSSProperties } from 'react';
import styles from './ai-capability.module.css';
import type { LayerItemId, LayerItemWords, LayerRow, LayerSpan, LayerWords } from './ai-capability.types';
import { LayerDetailView, LayerFlowView, type LayerDetailLabels } from './layer-row-view';
import { Hypothesis } from './row-cells-view';
import { LEVELS, type Level } from './scene-frames.pure';
import { fadeStops, sliceOf, type Range } from './spans.pure';

/*
 * The two layer rows, AI disciplines and Oversight, in one look: each item a card spanning the Level edges it covers,
 * one lane per item, with a mini workflow, its name and a one-liner. Hover or focus lights a card, a click pins its
 * definition and source under the row. Wide, the row spans the four columns; narrow, each Level's card shows its slice.
 * The parent owns the lit and pinned items (FE-012 §4.2); a card only gets its `on` and `pinned` booleans.
 */

/** A layer item with its span on the four Levels, worked out once. */
export interface PlacedSpan extends LayerSpan {
  readonly range: Range;
}

/** What one layer row hands its cards: the items, their words, which is lit and pinned, and the callbacks. */
export interface LayerRowProps {
  readonly row: LayerRow;
  readonly spans: readonly PlacedSpan[];
  readonly words: LayerWords;
  readonly lit: LayerItemId | null;
  readonly pinned: LayerItemId | null;
  readonly onLight: (row: LayerRow, id: LayerItemId | null) => void;
  readonly onPin: (row: LayerRow, id: LayerItemId) => void;
  readonly labels: LayerDetailLabels;
  /** The tag a row's claims carry: Oversight's placement is a hypothesis; none for a row backed by its sources. */
  readonly hypothesis: string | null;
}

/** How strong a card's tone gets at full strength, in percent over the card colour. */
const TINT = 24;
/** How far a narrow slice indents per percent its span starts into the Level: less than its share, so it stays wide. */
const INDENT = 0.4;

/** A card's tint along its drawn part: its strength stops as a gradient of its tone over the card colour. */
function tint(span: PlacedSpan, shown: Range): CSSProperties {
  const stops = fadeStops(span.stops, span.range, shown).map(
    ({ at, strength }) => `color-mix(in oklch, var(--hue) ${Math.round(strength * TINT)}%, var(--card)) ${at}%`,
  );
  return { backgroundImage: `linear-gradient(90deg, ${stops.join(', ')})` };
}

/** The 8 half-Level tracks of the wide row: a span from 1.5 to 4 runs from line 4 to line 9. */
const tracks = ([from, to]: Range): CSSProperties => ({ gridColumn: `${from * 2 + 1} / ${to * 2 + 1}` });

/** What a card shows: its mini workflow, its name (tagged when emerging) and its one-liner. */
function CardFace({
  span,
  words,
  emerging,
}: {
  readonly span: PlacedSpan;
  readonly words: LayerItemWords;
  readonly emerging: string;
}) {
  return (
    <>
      <span className="text-(--hue)">
        <LayerFlowView id={span.id} />
      </span>
      <span className="flex min-w-0 flex-col text-left">
        <span className="text-caption font-semibold">
          {words.name}
          {span.emerging ? <span className="ml-1.5 font-normal text-muted-foreground italic">{emerging}</span> : null}
        </span>
        <span className={`${styles.oneLiner} text-caption text-muted-foreground`}>{words.line}</span>
      </span>
    </>
  );
}

/** Hover and focus light a card, leaving puts the light out, a click pins it. */
const handlers = ({ row, span, onLight, onPin }: Pick<CardProps, 'row' | 'span' | 'onLight' | 'onPin'>) => ({
  onPointerEnter: () => onLight(row, span.id),
  onPointerLeave: () => onLight(row, null),
  onFocus: () => onLight(row, span.id),
  onBlur: () => onLight(row, null),
  onClick: () => onPin(row, span.id),
});

/** A card's place and tint: on its tracks when wide, indented by its offset when narrow. */
function cardStyle(props: CardProps): CSSProperties {
  const shown: Range = [props.shownFrom, props.shownTo];
  const at = props.offset === undefined ? tracks(shown) : { marginLeft: `${props.offset * INDENT}%` };
  return { ...at, ...tint(props.span, shown) };
}

/** What a layer card takes. */
interface CardProps {
  readonly row: LayerRow;
  readonly span: PlacedSpan;
  readonly words: LayerItemWords;
  readonly on: boolean;
  readonly pinned: boolean;
  /** The drawn part of the span, on the 0 to 4 axis; wide, it is the whole span on its tracks. */
  readonly shownFrom: number;
  readonly shownTo: number;
  /** Narrow, how far into the Level's card the slice starts, in percent; wide, none. */
  readonly offset?: number;
  readonly continues?: boolean;
  readonly emerging: string;
  readonly onLight: LayerRowProps['onLight'];
  readonly onPin: LayerRowProps['onPin'];
}

/** One layer card: lit while hovered or focused, pinned by a click; memoised, so a hover redraws only what flipped. */
const LayerCard = memo(function LayerCard(props: CardProps) {
  const { span } = props;
  return (
    <button
      type="button"
      data-layer-item={span.id}
      data-on={props.on}
      aria-pressed={props.pinned}
      {...handlers(props)}
      style={cardStyle(props)}
      className={`${styles[span.tone]} ${styles.layerCard} ${span.emerging ? styles.emerging : ''}`}
    >
      <span className={styles.cardBody}>
        <CardFace span={span} words={props.words} emerging={props.emerging} />
      </span>
      {props.continues ? (
        <span aria-hidden="true" className="ml-auto self-center text-body text-(--hue)">
          ›
        </span>
      ) : null}
    </button>
  );
});

/** What every card of a row shares, and its own `on` and `pinned`: the props a card takes but its place. */
const cardOf = (props: LayerRowProps, span: PlacedSpan, words: LayerItemWords) => ({
  row: props.row,
  span,
  words,
  on: props.lit === span.id,
  pinned: props.pinned === span.id,
  emerging: props.labels.emerging,
  onLight: props.onLight,
  onPin: props.onPin,
});

/** Whether the shown card's discipline is still emerging. */
const emergingOf = (spans: readonly PlacedSpan[], id: LayerItemId | null) =>
  spans.find((each) => each.id === id)?.emerging === true;

/** The line under a row: the lit card's definition, else the pinned one's with its source, else the hint. */
function Detail(props: LayerRowProps) {
  const shown = props.lit ?? props.pinned;
  return (
    <div aria-live="polite" className="flex flex-wrap items-baseline gap-2 px-1 pt-1">
      {props.hypothesis === null ? null : <Hypothesis>{props.hypothesis}</Hypothesis>}
      <LayerDetailView
        row={props.words}
        item={shown === null ? null : (props.words.items[shown] ?? null)}
        emerging={emergingOf(props.spans, shown)}
        pinned={shown !== null && shown === props.pinned}
        labels={props.labels}
      />
    </div>
  );
}

/** A layer row in a wide container: one lane per item across the four columns, the line under it. */
export function LayerRowWide(props: LayerRowProps & { readonly line: number }) {
  return (
    <li
      data-row={props.row}
      style={{ gridRow: props.line }}
      className={`${styles.wide} ${styles.layerRow} ${styles.blend}`}
    >
      <div className={styles.lanes}>
        {props.spans.map((span) => {
          const words = props.words.items[span.id];
          if (words === undefined) return null;
          return (
            <LayerCard
              key={span.id}
              {...cardOf(props, span, words)}
              shownFrom={span.range[0]}
              shownTo={span.range[1]}
            />
          );
        })}
      </div>
      <Detail {...props} />
    </li>
  );
}

/** A layer row inside one Level's card in a narrow container: the items that reach this Level, each its slice. */
export function LayerSlices(props: LayerRowProps & { readonly level: Level }) {
  return (
    <div data-row={props.row} className={`${styles.slices} ${styles.blend}`}>
      {props.spans.map((span) => {
        const slice = sliceOf(span.range, props.level);
        const words = props.words.items[span.id];
        if (slice === null || words === undefined) return null;
        const at = LEVELS.indexOf(props.level);
        return (
          <LayerCard
            key={span.id}
            {...cardOf(props, span, words)}
            continues={slice.continues}
            shownFrom={at + slice.left / 100}
            shownTo={at + (slice.left + slice.width) / 100}
            offset={slice.left}
          />
        );
      })}
      <Detail {...props} />
    </div>
  );
}
