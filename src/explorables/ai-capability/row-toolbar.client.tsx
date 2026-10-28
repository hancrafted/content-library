'use client';

import { memo } from 'react';
import styles from './ai-capability.module.css';
import { ROWS, type Row } from './rows.pure';

/** The toolbar's words: its label, one chip per row, and the button that plays the four scenes in turn. */
export interface ToolbarWords {
  readonly rows: Readonly<Record<Row, string>> & { readonly label: string };
  readonly playAll: string;
}

/** One row's chip: pressed while its row is shown, its square filled. */
function Chip(props: {
  readonly row: Row;
  readonly label: string;
  readonly on: boolean;
  readonly onToggle: (row: Row) => void;
}) {
  return (
    <button
      type="button"
      data-row-toggle={props.row}
      aria-pressed={props.on}
      onClick={() => props.onToggle(props.row)}
      className={props.on ? 'font-semibold' : undefined}
    >
      {props.label}
    </button>
  );
}

/**
 * The toolbar above the Levels, in the context window's look: one pill holding a chip per row, each switched on or off
 * on its own, then "Play all". The parent owns which rows are shown.
 */
export const RowToolbar = memo(function RowToolbar(props: {
  readonly words: ToolbarWords;
  readonly shown: readonly Row[];
  readonly onToggle: (row: Row) => void;
  readonly onPlayAll: () => void;
}) {
  const { words, shown } = props;
  return (
    <div role="toolbar" aria-label={words.rows.label} className={`${styles.toolbar} text-body`}>
      <div role="group" aria-label={words.rows.label} className={styles.chips}>
        {ROWS.map((row) => (
          <Chip key={row} row={row} label={words.rows[row]} on={shown.includes(row)} onToggle={props.onToggle} />
        ))}
      </div>
      <span aria-hidden="true" className={styles.sep} />
      <button type="button" onClick={props.onPlayAll} className={styles.play}>
        <span aria-hidden="true">▶</span>
        {words.playAll}
      </button>
    </div>
  );
});
