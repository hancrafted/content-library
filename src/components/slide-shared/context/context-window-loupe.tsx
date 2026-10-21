import { memo, useEffect, useMemo, useRef, useState, type PointerEvent, type RefObject } from 'react';
import type { ContextWindowProps } from './context-parts.types';
import { matcher } from './context-state.pure';
import { catLabel, fill, k, type Say } from './context-view';
import styles from './context.module.css';
import type { PlacedBlock } from './context.pure';
import { colourOf } from './context.pure';
import { loupeFrame, loupePlacement, loupeRows } from './loupe.pure';
import { tint, vars } from './window-bits';

/*
 * The loupe: while a mouse is over the bar, the blocks around it as rows big enough to hover and click. The bar
 * stays true to scale (a 28-token message is 0.003% of 1M); the loupe is the way in. A tail on its near edge, at the
 * pointer's height, bridges the gap to the bar and is part of the loupe, so the pointer never leaves it on the way.
 */

// Long enough to cross the tail's bridge from the bar at a slow pace.
const LEAVE_MS = 400;

const hoverCapable = () => window.matchMedia('(hover: hover)').matches;

/** Where the pointer is on the bar, 0 to 1, or null when the loupe is closed. */
export function useLoupe(bar: RefObject<HTMLDivElement | null>, enabled: boolean) {
  const [at, setAt] = useState<number | null>(null);
  const timer = useRef(0);
  const frame = useRef(0);
  useEffect(() => () => (clearTimeout(timer.current), cancelAnimationFrame(frame.current)), []);
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const el = bar.current;
    if (event.pointerType !== 'mouse' || !enabled || !hoverCapable() || !el || el.clientHeight <= el.clientWidth)
      return;
    clearTimeout(timer.current);
    const r = el.getBoundingClientRect();
    const f = Math.max(0, Math.min(1, (event.clientY - r.top) / r.height));
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => setAt(f));
  };
  const leave = () => {
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAt(null), LEAVE_MS);
  };
  const stay = () => clearTimeout(timer.current);
  return { at: enabled ? at : null, handlers: { onPointerMove, onPointerLeave: leave }, leave, stay };
}

interface LoupeProps {
  readonly p: ContextWindowProps;
  readonly say: Say;
  readonly at: number;
  readonly bar: RefObject<HTMLDivElement | null>;
  readonly onEnter: () => void;
  readonly onLeave: () => void;
}

interface RowProps {
  readonly say: Say;
  readonly block: PlacedBlock;
  readonly stepNo: number;
  readonly cursor: boolean;
  readonly on: boolean;
  readonly pressed: boolean;
}

const LoupeRow = memo(function LoupeRow({ say, block: b, stepNo, cursor, on, pressed }: RowProps) {
  return (
    <button
      type="button"
      className={styles.lrow}
      data-part={b.key}
      data-cursor={cursor ? '' : undefined}
      data-on={on ? '' : undefined}
      aria-pressed={pressed}
      style={tint(colourOf(b.cat, say.tech ? 'technical' : 'simple'))}
    >
      <i />
      <span className={styles.lrowName}>
        {catLabel(say, b.cat)} <small className="text-caption">· {fill(say.words.zoomStep, { step: stepNo })}</small>
      </span>
      <small className="text-caption">{k(say, b.tokens)}</small>
    </button>
  );
});

interface ListProps {
  readonly p: ContextWindowProps;
  readonly say: Say;
  readonly rows: readonly PlacedBlock[];
  readonly cursor: string;
}

/** The loupe's title and its rows: each row's `on` comes from the lit key, and is all a hover changes. */
function LoupeList({ p, say, rows, cursor }: ListProps) {
  const match = useMemo(() => matcher(p.lit), [p.lit]);
  const total = rows.reduce((sum, b) => sum + b.tokens, 0);
  return (
    <>
      <div className={styles.loupeTitle}>
        <span>{say.words.zoomTitle}</span>
        <span>{fill(say.words.zoomTokens, { tokens: k(say, total) })}</span>
      </div>
      {rows.map((b) => (
        <LoupeRow
          key={b.key}
          say={say}
          block={b}
          stepNo={p.stepOf.get(b.id) ?? 0}
          cursor={b.key === cursor}
          on={match(b.id, b.cat)}
          pressed={p.pinned === b.key}
        />
      ))}
    </>
  );
}

export function Loupe({ p, say, at, bar, onEnter, onLeave }: LoupeProps) {
  const barHeight = bar.current?.clientHeight ?? 0;
  const { rows, cursor } = loupeRows(p.frame.blocks, { at, windowTokens: p.window.tokens }, p.zoom);
  if (!rows.length) return null;
  const { y, tail } = loupePlacement({ at, barHeight, height: (rows.length + 1) * 36 });
  return (
    <div
      className={`${styles.loupe} ${styles.surface}`}
      role="group"
      aria-label={say.words.zoom}
      style={vars({ '--y': `${y}px`, '--tail': `${tail}px` })}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      <div className={styles.loupeTail} data-part={cursor} aria-hidden="true" />
      <LoupeList p={p} say={say} rows={rows} cursor={cursor} />
    </div>
  );
}

/** The frame on the bar round exactly the blocks the loupe shows. */
export function Lens({
  p,
  at,
  bar,
}: {
  readonly p: ContextWindowProps;
  readonly at: number;
  readonly bar: RefObject<HTMLDivElement | null>;
}) {
  const { rows } = loupeRows(p.frame.blocks, { at, windowTokens: p.window.tokens }, p.zoom);
  const frame = loupeFrame(rows, p.window.tokens, bar.current?.clientHeight ?? 0);
  if (!frame) return null;
  return (
    <div
      className={styles.lens}
      aria-hidden="true"
      style={vars({ '--top': `${frame.top}px`, '--h': `${frame.height}px` })}
    />
  );
}
