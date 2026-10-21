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
  /** What the bar shows, for assistive technology: the blocks carry no text. */
  readonly label: string;
}

/** A static bar: one block per `blocks` entry at its place on the scale. */
export function ContextBarView({ orientation, total, blocks, buffer = 0, lines = [], label }: ContextBarViewProps) {
  return (
    <div className={`${styles.bar} ${styles.barView}`} data-orientation={orientation} role="img" aria-label={label}>
      {blocks.map((block) => (
        <div
          key={block.key}
          className={styles.block}
          data-faded={block.faded ? '' : undefined}
          data-ring={block.ring ? '' : undefined}
          style={tint(block.colour, { '--s': (block.start / total) * 100, '--z': (block.size / total) * 100 })}
        />
      ))}
      {buffer > 0 && <BarBuffer size={buffer} total={total} />}
      <BarLines lines={lines} />
    </div>
  );
}

/** A legend swatch in the tint of a block: a colour custom property, or the faded one. */
export function BarSwatch({ colour }: { readonly colour: string | 'faded' | 'buffer' }) {
  const style = colour === 'faded' || colour === 'buffer' ? undefined : tint(colour);
  return <span className={`${styles.swatch} ${styles.barView}`} data-tone={style ? undefined : colour} style={style} />;
}
