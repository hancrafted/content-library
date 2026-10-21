import { useEffect, useRef, useState, type PointerEvent, type RefObject } from 'react';
import { catLabel, fill, k, type View } from './context-view';
import styles from './context.module.css';
import type { PlacedBlock } from './context.pure';
import { colourOf } from './context.pure';
import { loupeFrame, loupePlacement, loupeRows, ROWS } from './loupe.pure';
import { tint, vars } from './window-bits';

/*
 * The loupe: while a mouse is over the bar, the seven blocks around it as rows big enough to hover and click. The bar
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
  readonly v: View;
  readonly at: number;
  readonly bar: RefObject<HTMLDivElement | null>;
  readonly onEnter: () => void;
  readonly onLeave: () => void;
}

function LoupeRow({
  v,
  block: b,
  cursor,
}: {
  readonly v: View;
  readonly block: PlacedBlock;
  readonly cursor: boolean;
}) {
  return (
    <button
      type="button"
      className={styles.lrow}
      data-part={b.key}
      data-cursor={cursor ? '' : undefined}
      data-on={v.match(b.id, b.cat) ? '' : undefined}
      aria-pressed={v.state.pinned === b.key}
      style={tint(colourOf(b.cat, v.state.depth))}
    >
      <i />
      <span className={styles.lrowName}>
        {catLabel(v, b.cat)}{' '}
        <small className="text-caption">· {fill(v.words.zoomStep, { step: v.stepOf.get(b.id) ?? 0 })}</small>
      </span>
      <small className="text-caption">{k(v, b.tokens)}</small>
    </button>
  );
}

export function Loupe({ v, at, bar, onEnter, onLeave }: LoupeProps) {
  const barHeight = bar.current?.clientHeight ?? 0;
  const { rows, cursor } = loupeRows(v.frame.blocks, at, v.window.tokens);
  if (!rows.length) return null;
  const total = rows.reduce((sum, b) => sum + b.tokens, 0);
  const { y, tail } = loupePlacement({ at, barHeight, height: (ROWS + 1) * 36 });
  return (
    <div
      className={`${styles.loupe} ${styles.surface}`}
      role="group"
      aria-label={v.words.zoom}
      style={vars({ '--y': `${y}px`, '--tail': `${tail}px` })}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      <div className={styles.loupeTail} data-part={cursor} aria-hidden="true" />
      <div className={styles.loupeTitle}>
        <span>{v.words.zoomTitle}</span>
        <span>{fill(v.words.zoomTokens, { tokens: k(v, total) })}</span>
      </div>
      {rows.map((b) => (
        <LoupeRow key={b.key} v={v} block={b} cursor={b.key === cursor} />
      ))}
    </div>
  );
}

/** The frame on the bar round exactly the blocks the loupe shows. */
export function Lens({ v, at }: { readonly v: View; readonly at: number }) {
  const frame = loupeFrame(loupeRows(v.frame.blocks, at, v.window.tokens).rows, v.window.tokens);
  if (!frame) return null;
  return <div className={styles.lens} aria-hidden="true" style={vars({ '--s': frame.start, '--z': frame.size })} />;
}
