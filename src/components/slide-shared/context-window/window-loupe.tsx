import { useEffect, useRef, useState, type PointerEvent, type RefObject } from 'react';
import { catLabel, fill, k, type View } from './context-view';
import styles from './context-window.module.css';
import type { PlacedBlock } from './context-window.pure';
import { colourOf } from './context-window.pure';
import { tint, vars } from './window-bits';

/*
 * The loupe: while a mouse is over the bar, the seven blocks around it as rows big enough to hover and click. The bar
 * stays true to scale (a 28-token message is 0.003% of 1M); the loupe is the way in.
 */

const ROWS = 7;
const LEAVE_MS = 250;

/** The seven blocks around a point of the bar, and the one under it. */
export function loupeRows(blocks: readonly PlacedBlock[], at: number, windowTokens: number) {
  const t = at * windowTokens;
  let i = blocks.findIndex((b) => t >= b.start && t < b.start + b.tokens);
  if (i < 0) i = t < (blocks[0]?.start ?? 0) ? 0 : blocks.length - 1;
  const from = Math.max(0, Math.min(blocks.length - ROWS, i - 3));
  return { rows: blocks.slice(from, from + ROWS), cursor: blocks[i]?.key ?? '' };
}

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
  const height = (ROWS + 1) * 36;
  const y = Math.max(0, Math.min(barHeight - height, at * barHeight - height / 2));
  return (
    <div
      className={`${styles.loupe} ${styles.surface}`}
      role="group"
      aria-label={v.words.zoom}
      style={vars({ '--y': `${y}px` })}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
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

/** The frame on the bar around the blocks the loupe shows. */
export function Lens({ v, at }: { readonly v: View; readonly at: number }) {
  const { rows } = loupeRows(v.frame.blocks, at, v.window.tokens);
  const first = rows[0];
  const last = rows.at(-1);
  if (!first || !last) return null;
  const pct = (n: number) => (n / v.window.tokens) * 100;
  return (
    <div
      className={styles.lens}
      aria-hidden="true"
      style={vars({ '--s': pct(first.start), '--z': pct(last.start + last.tokens - first.start) })}
    />
  );
}
