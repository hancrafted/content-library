import { memo, useLayoutEffect, useMemo, useRef, type KeyboardEvent } from 'react';
import type { ConversationProps } from './context-parts.types';
import { matcher } from './context-state.pure';
import { type Say } from './context-view';
import styles from './context.module.css';
import { goneAt } from './context.pure';
import type { Step } from './context.types';
import { BubbleBody, bubbleName, roleOf } from './conversation-body';
import { useLighting } from './use-lighting';
import { useSay } from './use-say';
import { vars } from './window-bits';

/* The conversation part: a messenger in Simple, a Claude Code terminal in Technical. */

/** A bubble's opacity in the Attention view: its share of attention against the strongest few. */
const attentionOpacity = (units: number, max: number) => 0.3 + 0.7 * Math.min(1, units / Math.min(8, max));

const flag = (on: boolean) => (on ? '' : undefined);

/** What one bubble needs, as values: a hover flips `on`, nothing else, so only the bubbles lit or unlit redraw. */
interface BubbleProps {
  readonly say: Say;
  readonly step: Step;
  readonly hidden: boolean;
  readonly delay: number;
  readonly on: boolean;
  readonly pressed: boolean;
  readonly gone: boolean;
  readonly units: number;
  readonly max: number;
  readonly mayFill: boolean;
}

const Message = memo(function Message(props: BubbleProps) {
  const { say, step, hidden, delay, on, pressed, gone, units, max, mayFill } = props;
  const chip = roleOf(step) === 'chip';
  const open = chip && pressed;
  return (
    <div
      role="button"
      tabIndex={0}
      className={say.tech && roleOf(step) === 'you' ? `${styles.msg} font-medium` : styles.msg}
      data-part={step.id}
      data-role={roleOf(step)}
      data-may-fill={flag(mayFill)}
      data-on={flag(on)}
      data-gone={flag(gone)}
      data-faded={flag(units <= 2 && !gone)}
      data-open={flag(open)}
      aria-pressed={pressed}
      aria-expanded={chip ? open : undefined}
      aria-label={bubbleName(say, step)}
      hidden={hidden}
      style={vars({ '--att-o': attentionOpacity(units, max), '--d': `${delay}ms` })}
    >
      <BubbleBody say={say} step={step} />
      {mayFill ? <span className={styles.note}>{say.words.mayFill}</span> : null}
    </div>
  );
});

/** Enter and Space pin a bubble like a click: a bubble is a div, since a tool card nests inside it. */
function pressKey(event: KeyboardEvent<HTMLDivElement>) {
  const target = event.target as HTMLElement;
  if ((event.key === 'Enter' || event.key === ' ') && target.dataset.role) {
    event.preventDefault();
    target.click();
  }
}

/** Every step change scrolls to the newest bubble: bottom-aligned, or its top when it is taller than the view. */
function useNewest(vis: number, tech: boolean) {
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
  }, [vis, tech]);
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

/** The bubbles: each one's `on` is computed here, from the lit key, and is all that changes on a hover. */
function Bubbles(props: ConversationProps & { readonly say: Say }) {
  const { say, chat, frames, vis, attention, lit, ghost, pinned, notes } = props;
  const match = useMemo(() => matcher(lit), [lit]);
  const delayOf = useArrivals(vis);
  const max = Math.max(1, ...attention.map((a) => a.units));
  const units = new Map(attention.map((a) => [a.id, a.units]));
  return chat.steps.map((step, index) => (
    <Message
      key={step.id}
      say={say}
      step={step}
      hidden={index >= vis}
      delay={delayOf(index)}
      on={step.blocks.some((b) => match(step.id, b.cat)) || ghost === step.id}
      pressed={pinned === step.id}
      gone={goneAt(chat, frames, { index, step: vis })}
      units={units.get(step.id) ?? 0}
      max={max}
      mayFill={notes[step.id]?.mayFill === true}
    />
  ));
}

/** The chat's head: its name, and the scrub hint until the reader has used a control. */
function Head({ say, hint, hintSeen }: { readonly say: Say; readonly hint: boolean; readonly hintSeen: boolean }) {
  return (
    <div className={styles.head}>
      <b className="font-semibold">{say.words.parts.chat}</b>
      {hint ? (
        <span className={styles.hint} data-seen={flag(hintSeen)} aria-hidden={hintSeen || undefined}>
          {say.words.hint}
        </span>
      ) : null}
    </div>
  );
}

function Column(props: ConversationProps & { readonly say: Say }) {
  const { say, vis, hint, hintSeen } = props;
  const scroll = useNewest(vis, say.tech);
  const handlers = useLighting(props);
  return (
    <section
      className={styles.chat}
      aria-label={say.words.chat}
      data-depth={say.tech ? 'technical' : 'simple'}
      {...handlers}
    >
      <Head say={say} hint={hint} hintSeen={hintSeen} />
      <div className={`${styles.phone} ${styles.surface}${say.tech ? ' font-mono' : ''}`}>
        <div className={styles.appbar} aria-hidden="true">
          {say.tech ? (
            <TerminalBar title={say.words.terminalTitle} />
          ) : (
            <b className="font-semibold">{say.words.appTitle}</b>
          )}
        </div>
        <div ref={scroll} className={styles.scroll} data-chat-scroll="" onKeyDown={pressKey}>
          <Bubbles {...props} />
        </div>
      </div>
    </section>
  );
}

export function Conversation(props: ConversationProps) {
  const say = useSay(props);
  return <Column {...props} say={say} />;
}
