'use client';

import { memo, type CSSProperties } from 'react';
import styles from './ai-capability.module.css';
import type { LayerItemId, LayerItemWords, LayerRow, LayerSpan, LayerWords } from './ai-capability.types';
import { LayerFlowView, LayerPanelView, type LayerDetailLabels } from './layer-row-view';
import { Hypothesis } from './row-cells-view';
import { LEVELS, type Level } from './scene-frames.pure';
import { fadeStops, sliceOf, type Range } from './spans.pure';

/*
 * The two layer rows, AI disciplines and Oversight, in one look: each item a collapsible card spanning the Level edges
 * it covers, one lane per item, with a mini workflow, its name and a one-liner. A click opens the card to the
 * definitions of the item and the pages they come from. Wide, the row spans the four columns; narrow, each Level's card
 * shows its slice. The parent owns which cards are open (FE-012 §4.1); a card only gets its `open` boolean.
 */

/** A layer item with its span on the four Levels, worked out once. */
export interface PlacedSpan extends LayerSpan {
  readonly range: Range;
}

/** What one layer row hands its cards: the items, their words, which are open, and the callback. */
export interface LayerRowProps {
  readonly row: LayerRow;
  readonly spans: readonly PlacedSpan[];
  readonly words: LayerWords;
  readonly open: readonly LayerItemId[];
  readonly onToggle: (id: LayerItemId) => void;
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

/** A card's place and tint: on its tracks when wide, indented by its offset when narrow. */
function cardStyle(props: ItemProps): CSSProperties {
  const shown: Range = [props.shownFrom, props.shownTo];
  const at = props.offset === undefined ? tracks(shown) : { marginLeft: `${props.offset * INDENT}%` };
  return { ...at, ...tint(props.span, shown) };
}

/** What a layer item takes: its card, and the panel under it while it is open. */
interface ItemProps {
  readonly span: PlacedSpan;
  readonly words: LayerItemWords;
  readonly open: boolean;
  /** The drawn part of the span, on the 0 to 4 axis; wide, it is the whole span on its tracks. */
  readonly shownFrom: number;
  readonly shownTo: number;
  /** Narrow, how far into the Level's card the slice starts, in percent; wide, none. */
  readonly offset?: number;
  readonly continues?: boolean;
  readonly panelId: string;
  readonly labels: LayerDetailLabels;
  readonly onToggle: LayerRowProps['onToggle'];
}

/** One collapsible layer item: its card, a button that opens it, and the definitions under it; memoised. */
const LayerItem = memo(function LayerItem(props: ItemProps) {
  const { span, open } = props;
  return (
    <div className={`${styles[span.tone]} ${props.offset === undefined ? styles.lane : styles.slice}`}>
      <button
        type="button"
        data-layer-item={span.id}
        aria-expanded={open}
        aria-controls={open ? props.panelId : undefined}
        onClick={() => props.onToggle(span.id)}
        style={cardStyle(props)}
        className={`${styles.layerCard} ${span.emerging ? styles.emerging : ''}`}
      >
        <span className={styles.cardBody}>
          <CardFace span={span} words={props.words} emerging={props.labels.emerging} />
        </span>
        {props.continues ? (
          <span aria-hidden="true" className="ml-auto self-center text-body text-(--hue)">
            ›
          </span>
        ) : null}
        <span aria-hidden="true" className={`${styles.caret} self-center text-body text-(--hue)`}>
          ▾
        </span>
      </button>
      {open ? <LayerPanelView id={props.panelId} item={props.words} labels={props.labels} /> : null}
    </div>
  );
});

/** An item's span with its words. */
interface Entry {
  readonly span: PlacedSpan;
  readonly words: LayerItemWords;
}

/** What every item of a row shares, and its own `open`: the props an item takes but its place. */
const itemOf = (props: LayerRowProps, { span, words }: Entry, where: string) => ({
  span,
  words,
  open: props.open.includes(span.id),
  panelId: `${where}-${span.id}`,
  labels: props.labels,
  onToggle: props.onToggle,
});

/** The line under a row: its hypothesis tag, if it has one, and its hint. */
function Hint(props: LayerRowProps) {
  return (
    <div className="flex flex-wrap items-baseline gap-2 px-1 pt-1">
      {props.hypothesis === null ? null : <Hypothesis>{props.hypothesis}</Hypothesis>}
      <p className="text-caption text-muted-foreground">{props.words.hint}</p>
    </div>
  );
}

/** A layer row in a wide container: one lane per item across the four columns, the hint under it. */
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
            <LayerItem
              key={span.id}
              {...itemOf(props, { span, words }, 'wide')}
              shownFrom={span.range[0]}
              shownTo={span.range[1]}
            />
          );
        })}
      </div>
      <Hint {...props} />
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
          <LayerItem
            key={span.id}
            {...itemOf(props, { span, words }, props.level)}
            continues={slice.continues}
            shownFrom={at + slice.left / 100}
            shownTo={at + (slice.left + slice.width) / 100}
            offset={slice.left}
          />
        );
      })}
      <Hint {...props} />
    </div>
  );
}
