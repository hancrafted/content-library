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

/** The list's last row: what is left of the window. */
function FreeRow({
  blocks,
  total,
  children,
}: {
  readonly blocks: readonly BarBlock[];
  readonly total: number;
  readonly children: ReactNode;
}) {
  const used = blocks.reduce((sum, block) => sum + block.size, 0);
  return (
    <div className={styles.freeRow} role="listitem" style={vars({ '--z': ((total - used) / total) * 100 })}>
      {children}
    </div>
  );
}

/** A static bar: one block per `blocks` entry at its place on the scale; a list of rows when given `labels`. */
export function ContextBarView(props: ContextBarViewProps) {
  const { orientation, total, blocks, buffer = 0, lines = [], label, labels, free } = props;
  const listed = labels !== undefined;
  return (
    <div
      className={`${styles.bar} ${styles.barView}`}
      data-orientation={orientation}
      data-labelled={listed ? '' : undefined}
      role={listed ? 'list' : 'img'}
      aria-label={label}
    >
      {blocks.map((block, i) => (
        <Block key={block.key} block={block} total={total} words={labels?.[i]} listed={listed} />
      ))}
      {listed ? (
        <FreeRow blocks={blocks} total={total}>
          {free}
        </FreeRow>
      ) : (
        buffer > 0 && <BarBuffer size={buffer} total={total} />
      )}
      <BarLines lines={lines} />
    </div>
  );
}
