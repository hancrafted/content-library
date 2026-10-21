import { useMemo } from 'react';
import type { Card, DetailsProps } from './context-parts.types';
import { matcher, panelKey } from './context-state.pure';
import { readoutAt } from './context-usage.pure';
import styles from './context.module.css';
import { CategoryCard, GhostCard, RestCard, StepCard } from './details-cards';
import { useLighting } from './use-lighting';
import { useSay } from './use-say';

/* The details part: it tells what the lit part is. Attention is a part of its own (attention.tsx). */

const stepById = (card: Card, id: string | null | undefined) =>
  id ? card.chat.steps[(card.stepOf.get(id) ?? 0) - 1] : undefined;

/** Explain's card for what is lit: a step not in the window yet, a category, a step or block, or the step on screen. */
function ExplainCard({ card }: { readonly card: Card }) {
  const ghost = stepById(card, card.ghost);
  if (ghost) return <GhostCard v={card} step={ghost} />;
  if (card.lit?.includes(':')) return <CategoryCard v={card} lit={card.lit} />;
  const [id, cat] = (card.lit ?? '').split('@');
  const step = stepById(card, id);
  if (step) return <StepCard v={card} step={step} cat={cat} />;
  return <RestCard v={card} r={readoutAt(card.frames, card.vis, card.window)} />;
}

export function Details(p: DetailsProps) {
  const say = useSay(p);
  const match = useMemo(() => matcher(p.lit), [p.lit]);
  const handlers = useLighting(p);
  const card: Card = { ...p, tech: say.tech, match };
  // A new key replays the card's entrance when what it explains changes; stepping alone does not.
  const key = panelKey({ depth: p.renderMode, lit: p.lit, ghost: p.ghost });
  return (
    <section className={styles.panel} aria-label={say.words.details} {...handlers}>
      <div className={styles.head}>
        <b className="font-semibold">{say.words.modes.explain}</b>
        <span>{say.tech ? say.words.technical : say.words.simple}</span>
      </div>
      <div className={`${styles.card} ${styles.surface}`}>
        <div key={key}>
          <ExplainCard card={card} />
        </div>
      </div>
    </section>
  );
}
