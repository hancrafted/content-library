'use client';

import type { TargetProps } from '@/shared/lib/context-link.pure';
import { memo } from 'react';
import styles from './ai-capability.module.css';
import { CHIP_ORDER, type Row } from './rows.pure';

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
  readonly target?: TargetProps | undefined;
  readonly onToggle: (row: Row) => void;
}) {
  return (
    <button
      type="button"
      data-row-toggle={props.row}
      aria-pressed={props.on}
      {...props.target}
      onClick={() => props.onToggle(props.row)}
      className={props.on ? 'font-semibold' : undefined}
    >
      {props.label}
    </button>
  );
}

interface ToolbarProps {
  readonly words: ToolbarWords;
  readonly shown: readonly Row[];
  /** The `data-target` a Speaker note lights, on a layer row's chip. */
  readonly targets?: Partial<Record<Row, TargetProps>> | undefined;
  readonly onToggle: (row: Row) => void;
  readonly onPlayAll: () => void;
}

/** The chips, Explain first, each pressed while its row is shown. */
function Chips(props: Pick<ToolbarProps, 'words' | 'shown' | 'targets' | 'onToggle'>) {
  return (
    <div role="group" aria-label={props.words.rows.label} className={styles.chips}>
      {CHIP_ORDER.map((row) => (
        <Chip
          key={row}
          row={row}
          label={props.words.rows[row]}
          on={props.shown.includes(row)}
          target={props.targets?.[row]}
          onToggle={props.onToggle}
        />
      ))}
    </div>
  );
}

/**
 * The toolbar above the Levels, in the context window's look: one pill holding a chip per row, Explain first, each switched on or off
 * on its own, then "Play all". The parent owns which rows are shown.
 */
export const RowToolbar = memo(function RowToolbar(props: ToolbarProps) {
  const { words } = props;
  return (
    <div role="toolbar" aria-label={words.rows.label} className={`${styles.toolbar} text-body`}>
      <Chips {...props} />
      <span aria-hidden="true" className={styles.sep} />
      <button type="button" onClick={props.onPlayAll} className={styles.play}>
        <span aria-hidden="true">▶</span>
        {words.playAll}
      </button>
    </div>
  );
});
