import { useLayoutEffect, useRef, type KeyboardEvent } from 'react';
import { fill, stepCat, storyOf, type View } from './context-view';
import styles from './context-window.module.css';
import { colourOf, goneAt } from './context-window.pure';
import type { Step } from './context-window.types';
import { tint } from './window-bits';
import { BubbleBody, bubbleName, roleOf } from './window-chat-body';

/* The chat: a messenger in Simple, a Claude Code terminal in Technical; a strip of ticks when collapsed. */

/** A bubble's opacity in the Attention view: its share of attention against the strongest few. */
const attentionOpacity = (units: number, max: number) => 0.3 + 0.7 * Math.min(1, units / Math.min(8, max));

interface Bubble {
  readonly v: View;
  readonly step: Step;
  readonly index: number;
  readonly delay: number;
}

const flag = (on: boolean) => (on ? '' : undefined);

/** A bubble's state as data attributes: lit, gone after a compaction, faded in Attention, open as a tool card. */
const unitsOf = (v: View, step: Step) => v.attention.find((a) => a.id === step.id)?.units ?? 0;
const isOpen = (v: View, step: Step) => roleOf(step) === 'chip' && v.state.pinned?.split('@')[0] === step.id;

function bubbleState(v: View, step: Step, index: number) {
  const units = unitsOf(v, step);
  const gone = goneAt(v.chat, v.frames, { index, step: v.vis });
  const open = isOpen(v, step);
  const lit = step.blocks.some((b) => v.match(step.id, b.cat));
  const attrs = {
    'data-may-fill': flag(v.notes[step.id]?.mayFill === true),
    'data-on': flag(lit || v.ghost === step.id),
    'data-gone': flag(gone),
    'data-faded': flag(units <= 2 && !gone),
    'data-open': flag(open),
  };
  return { attrs, open, units };
}

function Message({ v, step, index, delay }: Bubble) {
  const { attrs, open, units } = bubbleState(v, step, index);
  const max = Math.max(1, ...v.attention.map((a) => a.units));
  const chip = roleOf(step) === 'chip';
  return (
    <div
      role="button"
      tabIndex={0}
      className={v.tech && roleOf(step) === 'you' ? `${styles.msg} font-medium` : styles.msg}
      data-part={step.id}
      data-role={roleOf(step)}
      {...attrs}
      aria-pressed={v.state.pinned === step.id}
      aria-expanded={chip ? open : undefined}
      aria-label={bubbleName(v, step)}
      hidden={index >= v.vis}
      style={{ '--att-o': attentionOpacity(units, max), '--d': `${delay}ms` } as never}
    >
      <BubbleBody v={v} step={step} />
      {attrs['data-may-fill'] === '' ? <span className={styles.note}>{v.words.mayFill}</span> : null}
    </div>
  );
}

/** Enter and Space pin a bubble like a click: a bubble is a div, since a tool card nests inside it. */
function pressKey(event: KeyboardEvent<HTMLDivElement>) {
  const target = event.target as HTMLElement;
  if ((event.key === 'Enter' || event.key === ' ') && target.dataset.role) {
    event.preventDefault();
    target.click();
  }
}

/** Every step change scrolls to the newest bubble: bottom-aligned, or its top when it is taller than the view. */
function useNewest(v: View) {
  const scroll = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const box = scroll.current;
    const shown = box ? [...box.querySelectorAll<HTMLElement>('[data-part]:not([hidden])')] : [];
    const newest = shown.reverse().find((el) => el.offsetParent !== null);
    if (!box || !newest) return;
    const pad = 24;
    box.scrollTo({
      top: Math.min(newest.offsetTop + newest.offsetHeight - box.clientHeight + pad, newest.offsetTop - pad),
    });
  }, [v.vis, v.tech]);
  return scroll;
}

function useArrivals(vis: number) {
  const last = useRef(vis);
  const from = last.current;
  useLayoutEffect(() => {
    last.current = vis;
  }, [vis]);
  return (index: number) => (index >= from && index < vis ? Math.min(index - from, 6) * 30 : 0);
}

export function ChatColumn({ v }: { readonly v: View }) {
  const scroll = useNewest(v);
  const delayOf = useArrivals(v.vis);
  const hint = !v.preset.timelineLocked && v.state.parts.timeline;
  return (
    <section className={styles.chat} aria-label={v.words.chat}>
      <div className={styles.head}>
        <b className="font-semibold">{v.words.parts.chat}</b>
        {hint ? (
          <span className={styles.hint} data-seen={flag(v.state.hintSeen)} aria-hidden={v.state.hintSeen || undefined}>
            {v.words.hint}
          </span>
        ) : null}
      </div>
      <div className={`${styles.phone} ${styles.surface}${v.tech ? ' font-mono' : ''}`}>
        <div className={styles.appbar} aria-hidden="true">
          {v.tech ? <TerminalBar title={v.words.terminalTitle} /> : <b className="font-semibold">{v.words.appTitle}</b>}
        </div>
        <div ref={scroll} className={styles.scroll} onKeyDown={pressKey}>
          {v.chat.steps.map((step, index) => (
            <Message key={step.id} v={v} step={step} index={index} delay={delayOf(index)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TerminalBar({ title }: { readonly title: string }) {
  return (
    <>
      <span className={styles.dots}>
        <i />
        <i />
        <i />
      </span>
      <span>{title}</span>
    </>
  );
}

/** The collapsed chat: one tick per step in the window so far. */
export function ChatRail({ v }: { readonly v: View }) {
  return (
    <div className={`${styles.rail} ${styles.surface}`} role="group" aria-label={v.words.minimap}>
      {v.chat.steps.slice(0, v.vis).map((step, i) => (
        <button
          key={step.id}
          type="button"
          className={styles.tick}
          data-part={step.id}
          data-on={flag(step.blocks.some((b) => v.match(step.id, b.cat)))}
          aria-pressed={v.state.pinned === step.id}
          aria-label={fill(v.words.stepEvent, { step: i + 1, event: storyOf(v, step).event })}
          style={tint(colourOf(stepCat(step), v.state.depth))}
        />
      ))}
    </div>
  );
}
