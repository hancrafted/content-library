import { useMemo } from 'react';
import type { Card, DetailsProps } from './context-parts.types';
import { matcher, panelKey } from './context-state.pure';
import styles from './context.module.css';
import { CategoryCard, GhostCard, RestCard, StepCard } from './details-cards';
import { Moves } from './moves.client';
import { useLighting } from './use-lighting';
import { useSay } from './use-say';

const stepById = (card: Card, id: string | null | undefined) =>
  id ? card.chat.steps[(card.stepOf.get(id) ?? 0) - 1] : undefined;

function ExplainCard({ card }: { readonly card: Card }) {
  const ghost = stepById(card, card.ghost);
  if (ghost) return <GhostCard v={card} step={ghost} />;
  if (card.lit?.includes(':')) return <CategoryCard v={card} lit={card.lit} />;
  const [id, cat] = (card.lit ?? '').split('@');
  const step = stepById(card, id);
  if (step) return <StepCard v={card} step={step} cat={cat} />;
  return <RestCard v={card} r={card.readout} />;
}

export function Details(p: DetailsProps) {
  const say = useSay(p);
  const match = useMemo(() => matcher(p.lit), [p.lit]);
  const handlers = useLighting(p);
  const card: Card = { ...p, tech: say.tech, match };
  const key = panelKey({ depth: p.renderMode, lit: p.lit, ghost: p.ghost });
  return (
    <Moves as="section" trigger={key} className={styles.panel} aria-label={say.words.details} {...handlers}>
      <div className={styles.head}>
        <b className="font-semibold">{say.words.modes.explain}</b>
        <span>{say.tech ? say.words.technical : say.words.simple}</span>
      </div>
      <div className={`${styles.card} ${styles.surface}`}>
        <Moves key={key}>
          <ExplainCard card={card} />
        </Moves>
      </div>
    </Moves>
  );
}
