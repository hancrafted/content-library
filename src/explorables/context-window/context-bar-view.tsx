import type { ReactNode } from 'react';
import type { BarBlock } from './context-bars.pure';
import styles from './context.module.css';
import { tint, vars } from './window-bits';

/*
 * The context window's bar as a pure view: blocks, the autocompact buffer and the smart-zone lines drawn from plain
 * props. No hooks, no handlers, no 'use client' (a lint rule holds that for every `*-view.tsx`), so a Slide renders
 * it from the server as static HTML, and the interactive part reuses its buffer and lines inside its own bar.
 */

export type BarOrientation = 'vertical' | 'horizontal';

/** A smart-zone line across the bar: where it sits as a share of the window, and whether the fill has crossed it. */
export interface BarLine {
  readonly id: string;
  readonly at: number;
  readonly crossed: boolean;
}

/** The autocompact buffer kept free at the end of the window, as a share of it. */
export function BarBuffer({ size, total }: { readonly size: number; readonly total: number }) {
  return <div className={styles.buffer} aria-hidden="true" style={vars({ '--z': (size / total) * 100 })} />;
}

/** The smart-zone lines. */
export function BarLines({ lines }: { readonly lines: readonly BarLine[] }) {
  return lines.map((line) => (
    <div
      key={line.id}
      className={styles.line}
      aria-hidden="true"
      data-crossed={line.crossed ? '' : undefined}
      style={vars({ '--f': line.at })}
    />
  ));
}

export interface ContextBarViewProps {
  readonly orientation: BarOrientation;
  /** The scale the blocks sit on: the window's tokens, or the minutes of a call. */
  readonly total: number;
  readonly blocks: readonly BarBlock[];
  /** The buffer kept free, in the unit of `total`. */
  readonly buffer?: number;
  readonly lines?: readonly BarLine[];
  /** What the bar shows, for assistive technology. */
  readonly label: string;
  /**
   * A Slide's words for each block, in block order. Given, the bar is a list read top to bottom: each block a row that
   * holds its words, sized from its share but never smaller than its words, then a row for the free space.
   */
  readonly labels?: readonly ReactNode[];
  /** The free-space row's words, drawn only with `labels`. */
  readonly free?: ReactNode;
  /**
   * How a labelled bar splits, top to bottom: each part holds its next `rows` blocks, a line runs between two parts,
   * and a part's `aside` stands beside exactly its rows. Left out, the bar is one part with no aside.
   */
  readonly parts?: readonly BarPart[];
}

/** One part of a labelled bar: how many of its blocks it holds, and what stands beside them. */
export interface BarPart {
  readonly rows: number;
  readonly aside?: ReactNode;
}

/** One block at its place on the scale, holding a Slide's words when the bar is a list. */
function Block({
  block,
  total,
  words,
  listed,
}: {
  readonly block: BarBlock;
  readonly total: number;
  readonly words: ReactNode;
  readonly listed: boolean;
}) {
  return (
    <div
      className={styles.block}
      role={listed ? 'listitem' : undefined}
      data-block={block.key}
      data-faded={block.faded ? '' : undefined}
      data-ring={block.ring ? '' : undefined}
      style={tint(block.colour, { '--s': (block.start / total) * 100, '--z': (block.size / total) * 100 })}
    >
      {words}
    </div>
  );
}

/** One row of the labelled list, top to bottom: a block, the line before part `part`, or the free space. */
type ListRow =
  | { readonly kind: 'block'; readonly block: BarBlock; readonly words: ReactNode }
  | { readonly kind: 'split'; readonly part: number }
  | { readonly kind: 'free' };

/** An aside and the grid lines it runs between: its part's first row to past its last. */
interface AsideSpan {
  readonly aside: ReactNode;
  readonly from: number;
  readonly to: number;
}

/** The labelled list's rows and its asides' spans, from the parts; parts must hold every block. */
function listLayout(
  blocks: readonly BarBlock[],
  labels: readonly ReactNode[],
  parts: readonly BarPart[],
): { readonly rows: readonly ListRow[]; readonly spans: readonly AsideSpan[] } {
  const held = parts.reduce((sum, part) => sum + part.rows, 0);
  if (held !== blocks.length)
    throw new Error(`context bar: its parts hold ${held} rows, but it has ${blocks.length} blocks`);
  const rows: ListRow[] = [];
  const spans: AsideSpan[] = [];
  let next = 0;
  parts.forEach((part, i) => {
    if (i > 0) rows.push({ kind: 'split', part: i });
    const from = rows.length + 1;
    blocks
      .slice(next, next + part.rows)
      .forEach((block, j) => rows.push({ kind: 'block', block, words: labels[next + j] }));
    next += part.rows;
    if (part.aside !== undefined) spans.push({ aside: part.aside, from, to: rows.length + 1 });
  });
  rows.push({ kind: 'free' });
  return { rows, spans };
}

/** A grid track per row: a block or the free space grows by its share of the window, never below its words. */
const track = (row: ListRow, total: number, free: number): string => {
  if (row.kind === 'split') return 'auto';
  const share = row.kind === 'block' ? row.block.size / total : free / total;
  return `minmax(min-content, ${Number(share.toFixed(4))}fr)`;
};

function ListRowView({
  row,
  total,
  free,
}: {
  readonly row: ListRow;
  readonly total: number;
  readonly free: ReactNode;
}) {
  if (row.kind === 'split') return <div className={styles.split} data-split="" aria-hidden="true" />;
  if (row.kind === 'free')
    return (
      <div className={styles.freeRow} role="listitem">
        {free}
      </div>
    );
  return <Block block={row.block} total={total} words={row.words} listed />;
}

/** Each aside beside its part's rows. */
function Asides({ spans }: { readonly spans: readonly AsideSpan[] }) {
  return spans.map(({ aside, from, to }) => (
    <div key={from} className={styles.aside} data-aside="" style={vars({ '--from': from, '--to': to })}>
      {aside}
    </div>
  ));
}

const rowKey = (row: ListRow): string =>
  row.kind === 'block' ? row.block.key : row.kind === 'split' ? `split-${row.part}` : 'free';

/**
 * The labelled bar: a list of rows on a grid whose tracks its asides share, so each aside spans exactly its part's
 * rows. Shares are fractions of one, so a grid with no height to share keeps every row at its words' height.
 */
function ListedBar(props: Omit<ContextBarViewProps, 'labels'> & { readonly labels: readonly ReactNode[] }) {
  const { orientation, total, blocks, lines = [], label, labels, parts = [{ rows: blocks.length }] } = props;
  const { rows, spans } = listLayout(blocks, labels, parts);
  const free = total - blocks.reduce((sum, block) => sum + block.size, 0);
  return (
    <div
      className={styles.listed}
      data-listed=""
      data-asides={spans.length > 0 ? '' : undefined}
      style={{ gridTemplateRows: rows.map((row) => track(row, total, free)).join(' ') }}
    >
      <div
        className={`${styles.bar} ${styles.barView}`}
        data-orientation={orientation}
        data-labelled=""
        role="list"
        aria-label={label}
      >
        {rows.map((row) => (
          <ListRowView key={rowKey(row)} row={row} total={total} free={props.free} />
        ))}
        <BarLines lines={lines} />
      </div>
      <Asides spans={spans} />
    </div>
  );
}

/** A static bar: one block per `blocks` entry at its place on the scale; a list of rows when given `labels`. */
export function ContextBarView(props: ContextBarViewProps) {
  const { orientation, total, blocks, buffer = 0, lines = [], label, labels } = props;
  if (labels !== undefined) return <ListedBar {...props} labels={labels} />;
  return (
    <div className={`${styles.bar} ${styles.barView}`} data-orientation={orientation} role="img" aria-label={label}>
      {blocks.map((block) => (
        <Block key={block.key} block={block} total={total} words={undefined} listed={false} />
      ))}
      {buffer > 0 && <BarBuffer size={buffer} total={total} />}
      <BarLines lines={lines} />
    </div>
  );
}
