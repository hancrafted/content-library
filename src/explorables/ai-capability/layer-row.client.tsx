'use client';

import { memo, type CSSProperties } from 'react';
import styles from './ai-capability.module.css';
import type { LayerItemId, LayerItemWords, LayerRow, LayerSpan, LayerWords } from './ai-capability.types';
import { LayerFlowView, LayerPanelView, type LayerDetailLabels } from './layer-row-view';
import { Hypothesis } from './row-cells-view';
import { LEVELS, type Level } from './scene-frames.pure';
import { fadeStops, sliceOf, type Range } from './spans.pure';

// decision: FE-012 §4.1
export interface PlacedSpan extends LayerSpan {
  readonly range: Range;
}

export interface LayerRowProps {
  readonly row: LayerRow;
  readonly spans: readonly PlacedSpan[];
  readonly words: LayerWords;
  readonly open: readonly LayerItemId[];
  readonly onToggle: (id: LayerItemId) => void;
  readonly labels: LayerDetailLabels;
  readonly hypothesis: string | null;
}

const TINT_PERCENT = 24;
const INDENT_RATIO = 0.4;

function tint(span: PlacedSpan, shown: Range): CSSProperties {
  const stops = fadeStops(span.stops, span.range, shown).map(
    ({ at, strength }) => `color-mix(in oklch, var(--hue) ${Math.round(strength * TINT_PERCENT)}%, var(--card)) ${at}%`,
  );
  return { backgroundImage: `linear-gradient(90deg, ${stops.join(', ')})` };
}

const halfLevelTracks = ([from, to]: Range): CSSProperties => ({ gridColumn: `${from * 2 + 1} / ${to * 2 + 1}` });

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

function cardStyle(props: ItemProps): CSSProperties {
  const shown: Range = [props.shownFrom, props.shownTo];
  const at =
    props.offsetPercent === undefined
      ? halfLevelTracks(shown)
      : { marginLeft: `${props.offsetPercent * INDENT_RATIO}%` };
  return { ...at, ...tint(props.span, shown) };
}

interface ItemProps {
  readonly span: PlacedSpan;
  readonly words: LayerItemWords;
  readonly open: boolean;
  readonly shownFrom: number;
  readonly shownTo: number;
  readonly offsetPercent?: number;
  readonly continues?: boolean;
  readonly panelId: string;
  readonly labels: LayerDetailLabels;
  readonly onToggle: LayerRowProps['onToggle'];
}

const LayerItem = memo(function LayerItem(props: ItemProps) {
  const { span, open } = props;
  return (
    <div className={`${styles[span.tone]} ${props.offsetPercent === undefined ? styles.lane : styles.slice}`}>
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

interface Entry {
  readonly span: PlacedSpan;
  readonly words: LayerItemWords;
}

const itemOf = (props: LayerRowProps, { span, words }: Entry, where: string) => ({
  span,
  words,
  open: props.open.includes(span.id),
  panelId: `${where}-${span.id}`,
  labels: props.labels,
  onToggle: props.onToggle,
});

function Hint(props: LayerRowProps) {
  return (
    <div className="flex flex-wrap items-baseline gap-2 px-1 pt-1">
      {props.hypothesis === null ? null : <Hypothesis>{props.hypothesis}</Hypothesis>}
      <p className="text-caption text-muted-foreground">{props.words.hint}</p>
    </div>
  );
}

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
            shownFrom={at + slice.leftPercent / 100}
            shownTo={at + (slice.leftPercent + slice.widthPercent) / 100}
            offsetPercent={slice.leftPercent}
          />
        );
      })}
      <Hint {...props} />
    </div>
  );
}
