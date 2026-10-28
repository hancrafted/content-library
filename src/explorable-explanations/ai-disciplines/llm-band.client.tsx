'use client';

import { prefersReducedMotion } from '@/shared/hooks/prefers-reduced-motion';
import { useEffect, useState } from 'react';
import styles from './ai-disciplines.module.css';
import type { LlmWords } from './ai-disciplines.types';
import { CardBackView, type CardLabels } from './discipline-card-view';
import { Flip } from './flip.client';
import { DISCIPLINES, type Discipline } from './scene-frames.pure';

/** How many tokens the carousel shows at once, the newest last; the next one still a question after them. */
const SHOWN = 4;
const STEP_MS = 900;

/** The carousel's first token: it moves on one every beat, and wraps when the last token has shown. */
function useOffset(count: number): number {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const timer = window.setInterval(() => setOffset((now) => (now + 1) % (count - SHOWN + 1)), STEP_MS);
    return () => window.clearInterval(timer);
  }, [count]);
  return offset;
}

/** The word "token", glossed on hover and focus. */
function Gloss({ words }: { readonly words: LlmWords }) {
  return (
    <span className={`${styles.gloss} relative z-10 inline-block`} tabIndex={0}>
      <span className="font-semibold text-(--tone) underline decoration-dotted underline-offset-4">{words.token}</span>
      <span
        role="tooltip"
        className={`${styles.tip} absolute bottom-full left-1/2 z-20 mb-2 w-64 rounded-lg bg-foreground p-2 text-caption text-background`}
      >
        {words.tokenGloss}
      </span>
    </span>
  );
}

/** The model writing, as a carousel of fixed width: a few tokens, the newest popping in, the next one a question. */
function Typing({ tokens }: { readonly tokens: readonly string[] }) {
  const offset = useOffset(tokens.length);
  const shown = tokens.slice(offset, offset + SHOWN);
  return (
    <p aria-hidden="true" className="flex w-80 max-w-full shrink-0 justify-end gap-1 self-end overflow-hidden">
      {shown.map((token, index) => (
        <span
          key={`${offset + index}-${token}`}
          className={`${index === shown.length - 1 ? styles.pop : ''} rounded-md border border-(--tone)/40 bg-card px-1.5 py-0.5 text-caption font-medium`}
        >
          {token}
        </span>
      ))}
      <span className={`${styles.next} rounded-md border border-dashed border-(--tone) px-2 py-0.5 text-caption`}>
        ?
      </span>
    </p>
  );
}

/** One port per column on the band's top edge, under its wire; lit while a message travels that wire. */
function Ports({ active }: { readonly active: Readonly<Record<Discipline, boolean>> }) {
  return (
    <div aria-hidden="true" className="absolute inset-x-0 -top-1.5 hidden grid-cols-4 gap-x-4 md:grid">
      {DISCIPLINES.map((each) => (
        <span
          key={each}
          data-port={each}
          data-on={active[each]}
          className={`mx-auto h-3 w-6 rounded-full transition-[background-color,box-shadow] duration-200 ${active[each] ? 'bg-(--tone) ring-6 ring-(--tone)/25' : 'bg-(--tone)/45'}`}
        />
      ))}
    </div>
  );
}

/** The front: the sentence with "token" glossed on the left, the model writing at the bottom right. */
function Front({
  words,
  active,
}: {
  readonly words: LlmWords;
  readonly active: Readonly<Record<Discipline, boolean>>;
}) {
  return (
    <div className="relative grid h-full gap-4 rounded-2xl border border-(--tone)/50 bg-(--tone)/15 p-4 md:grid-cols-[1fr_auto] md:gap-6">
      <Ports active={active} />
      <div className="flex flex-col gap-1">
        <p className="text-caption font-semibold tracking-widest text-(--tone) uppercase">{words.kicker}</p>
        <p className="text-subheading font-semibold text-foreground">{words.name}</p>
        <p className="text-body text-foreground">
          {words.before} <Gloss words={words} /> {words.after}
        </p>
      </div>
      <Typing tokens={words.tokens} />
    </div>
  );
}

/**
 * The model under every discipline: it predicts the next token; turned over, its definition and source. The parent owns
 * whether it is turned, and which wires are busy.
 */
export function LlmBand(props: {
  readonly words: LlmWords;
  readonly labels: CardLabels;
  readonly active: Readonly<Record<Discipline, boolean>>;
  readonly flipped: boolean;
  readonly onFlip: () => void;
}) {
  return (
    <Flip
      flipped={props.flipped}
      onFlip={props.onFlip}
      label={`${props.words.name}: ${props.labels.definition}`}
      className={styles.llm}
      front={<Front words={props.words} active={props.active} />}
      back={<CardBackView words={props.words} labels={props.labels} />}
    />
  );
}
