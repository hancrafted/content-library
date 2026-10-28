'use client';

import { prefersReducedMotion } from '@/shared/hooks/prefers-reduced-motion';
import { useEffect, useState } from 'react';
import styles from './ai-disciplines.module.css';
import type { LlmWords } from './ai-disciplines.types';
import { CardBackView, type CardLabels } from './discipline-card-view';
import { Flip } from './flip.client';

const TYPE_MS = 450;

/** The tokens typed so far: all of them at rest, one more every beat while the band plays, then from the start again. */
function useTyped(count: number): number {
  const [typed, setTyped] = useState(count);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const timer = window.setInterval(() => setTyped((now) => (now >= count ? 1 : now + 1)), TYPE_MS);
    return () => window.clearInterval(timer);
  }, [count]);
  return typed;
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

/** The model typing a sentence token by token, the next one still a question. */
function Typing({ tokens }: { readonly tokens: readonly string[] }) {
  const typed = useTyped(tokens.length);
  return (
    <p aria-hidden="true" className="flex flex-wrap gap-1 md:w-1/2">
      {tokens.slice(0, typed).map((token, index) => (
        <span
          key={`${index}-${token}`}
          className={`${styles.pop} rounded-md bg-muted px-1.5 py-0.5 text-caption font-medium`}
        >
          {token}
        </span>
      ))}
      <span className={`${styles.next} rounded-md border border-dashed border-(--tone) px-1.5 py-0.5 text-caption`}>
        ?
      </span>
    </p>
  );
}

/** The front: the sentence with "token" glossed, and the model typing a sentence token by token. */
function Front({ words }: { readonly words: LlmWords }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border border-t-4 border-t-(--tone) bg-card p-4 md:flex-row md:items-center md:gap-6">
      <div className="flex flex-col gap-1 md:w-1/2">
        <p className="text-caption font-semibold tracking-widest text-muted-foreground uppercase">{words.kicker}</p>
        <p className="text-subheading font-semibold text-(--tone)">{words.name}</p>
        <p className="text-body text-foreground">
          {words.before} <Gloss words={words} /> {words.after}
        </p>
      </div>
      <Typing tokens={words.tokens} />
    </div>
  );
}

/** The model under every discipline: it predicts the next token; turned over, its definition and source. */
export function LlmBand({ words, labels }: { readonly words: LlmWords; readonly labels: CardLabels }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <Flip
      flipped={flipped}
      onFlip={() => setFlipped((now) => !now)}
      label={`${words.name}: ${labels.definition}`}
      className={styles.llm}
      front={<Front words={words} />}
      back={<CardBackView words={words} labels={labels} />}
    />
  );
}
