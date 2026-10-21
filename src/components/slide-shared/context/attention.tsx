import { memo, useMemo, useRef, type FocusEvent, type PointerEvent } from 'react';
import { axisMaxOf, bucketOf, EDGE } from './attention-curve.pure';
import { useDock } from './attention-dock';
import { AttentionMenu } from './attention-menu.client';
import type { AttentionProps } from './context-parts.types';
import { matcher } from './context-state.pure';
import { readoutAt } from './context-usage.pure';
import { fill, stepCat, type Say } from './context-view';
import styles from './context.module.css';
import { colourOf } from './context.pure';
import type { AttentionLayout, Step } from './context.types';
import { nameOf } from './conversation-body';
import { Crossed, crossedText } from './details-cards';
import { partOf, useLighting } from './use-lighting';
import { useSay } from './use-say';
import { tint, vars } from './window-bits';

/* The attention part: the 100 units of attention over the steps in the window, as a list, with the first and last
 * three pinned, or compressed to one bar per share that the pointer magnifies like the Mac dock. */

/** Rows pinned at each end of the `pinned` layout. */
const PINNED = 3;

/** Where a row sticks in the pinned layout: its side and its slot from that edge, or none for the rows between. */
interface Pin {
  readonly side: 'top' | 'bottom';
  readonly slot: number;
}

interface RowProps {
  readonly say: Say;
  readonly step: Step;
  readonly units: number;
  /** The axis maximum in percent: the bar's full track stands for this much attention. */
  readonly max: number;
  readonly on: boolean;
  readonly pin: Pin | null;
  /** The curve bucket the row falls in, a stable hook for a Slide that marks the middle (`data-attention-bucket`). */
  readonly bucket: string;
}

const pinAttrs = (pin: Pin | null) => (pin ? { 'data-pin': pin.side, style: vars({ '--slot': pin.slot }) } : {});

const AttentionRow = memo(function AttentionRow({ say, step, units, max, on, pin, bucket }: RowProps) {
  const name = nameOf(say, step);
  const colour = colourOf(stepCat(step), say.tech ? 'technical' : 'simple');
  return (
    <div
      className={styles.attRow}
      data-row=""
      data-part={step.id}
      data-on={on ? '' : undefined}
      data-attention-bucket={bucket}
      {...pinAttrs(pin)}
    >
      <button type="button" className={on ? `${styles.attName} font-semibold` : styles.attName} title={name}>
        {name}
      </button>
      <div className={styles.attBar}>
        <i style={tint(colour, { '--w': Math.min(1, units / max) })} />
      </div>
      <span className={styles.attNum} />
      {/* The percentage shows on hover or focus only, in both render modes: a resting number clips on thin rows. */}
      <span className={`${styles.attPct} text-caption font-mono`} data-pct="" aria-hidden="true">{`${units}%`}</span>
    </div>
  );
});

function pinOf(layout: AttentionLayout, index: number, count: number): Pin | null {
  if (layout !== 'pinned') return null;
  if (index < PINNED) return { side: 'top', slot: index };
  return index >= count - PINNED ? { side: 'bottom', slot: count - 1 - index } : null;
}

/** Hovering a row also brings its chat message into view; once per row, not on every move inside it. */
function useReveal({ onReveal, onLight, onPin }: AttentionProps) {
  const handlers = useLighting({ onLight, onPin });
  const last = useRef<string | null>(null);
  return {
    ...handlers,
    onPointerOver: (event: PointerEvent<HTMLElement>) => {
      handlers.onPointerOver(event);
      const key = partOf(event.target);
      if (event.pointerType !== 'mouse' || key === last.current) return;
      last.current = key;
      if (key) onReveal(key);
    },
    onPointerLeave: (event: PointerEvent<HTMLElement>) => {
      handlers.onPointerLeave(event);
      last.current = null;
    },
    // Keyboard focus on a row lights its message as hovering does.
    onFocus: (event: FocusEvent<HTMLElement>) => onLight(partOf(event.target)),
    onBlur: () => onLight(null),
  };
}

function Rows({ p, say, max }: { readonly p: AttentionProps; readonly say: Say; readonly max: number }) {
  const match = useMemo(() => matcher(p.lit), [p.lit]);
  return p.attention.map((a, i) => {
    const step = p.chat.steps[(p.stepOf.get(a.id) ?? 1) - 1];
    if (!step) return null;
    const on = step.blocks.some((b) => match(step.id, b.cat));
    const pin = pinOf(p.layout, i, p.attention.length);
    const bucket = bucketOf(i, p.attention.length);
    return (
      <AttentionRow key={a.id} say={say} step={step} units={a.units} max={max} on={on} pin={pin} bucket={bucket} />
    );
  });
}

/** The current axis maximum, standing over the line at the right end of the bar tracks. */
function AxisLabel({ max }: { readonly max: number }) {
  return (
    <div className={`${styles.attAxis} text-caption font-mono`} data-axis-max={max} aria-hidden="true">
      <span>{`${max}%`}</span>
    </div>
  );
}

export function Attention(p: AttentionProps) {
  const say = useSay(p);
  const list = useRef<HTMLDivElement>(null);
  const dock = useDock(list, p.attention, p.layout === 'compressed' ? EDGE : null);
  const handlers = useReveal(p);
  const r = readoutAt(p.frames, p.vis, p.window);
  const max = axisMaxOf(p.attention.map((a) => a.units));
  const head = fill(say.words.readoutHead, { step: r.step, steps: r.steps });
  return (
    <section className={`${styles.panel} ${styles.attentionPart}`} aria-label={say.words.modes.attention} {...handlers}>
      <div className={styles.head}>
        <b className="font-semibold">{say.words.modes.attention}</b>
        <div className={styles.headEnd}>
          <span className={styles.caption}>{say.words.illustrative}</span>
          {p.menu && <AttentionMenu words={say.words} menu={p.menu} />}
        </div>
      </div>
      <div className={`${styles.card} ${styles.surface} ${styles.attCard}`}>
        <div className={styles.kicker}>{fill(say.words.attentionKicker, { head })}</div>
        <p>{say.words.attentionLead}</p>
        <AxisLabel max={max} />
        <div ref={list} className={styles.att} data-layout={p.layout} {...dock}>
          <Rows p={p} say={say} max={max} />
        </div>
        <Crossed text={crossedText({ words: say.words }, r)} />
      </div>
    </section>
  );
}
