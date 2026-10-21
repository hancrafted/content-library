import { memo, useMemo } from 'react';
import type { Card, DetailsProps } from './context-parts.types';
import { matcher, panelKey } from './context-state.pure';
import { readoutAt } from './context-usage.pure';
import { fill, stepCat, type Say } from './context-view';
import styles from './context.module.css';
import { colourOf } from './context.pure';
import type { Step } from './context.types';
import { nameOf } from './conversation-body';
import { CategoryCard, Crossed, crossedText, GhostCard, RestCard, StepCard } from './details-cards';
import { useLighting } from './use-lighting';
import { useSay } from './use-say';
import { tint } from './window-bits';

/* The details part: Explain tells what the lit part is, Attention shows the 100 units over the steps in the window. */

interface AttentionRowProps {
  readonly say: Say;
  readonly step: Step;
  readonly units: number;
  readonly on: boolean;
}

const AttentionRow = memo(function AttentionRow({ say, step, units, on }: AttentionRowProps) {
  const name = nameOf(say, step);
  return (
    <div className={styles.attRow} data-on={on ? '' : undefined}>
      <button
        type="button"
        className={on ? `${styles.attName} font-semibold` : styles.attName}
        data-part={step.id}
        title={name}
      >
        {name}
      </button>
      <div className={styles.attBar}>
        <i style={tint(colourOf(stepCat(step), say.tech ? 'technical' : 'simple'), { '--w': units / 100 })} />
      </div>
      <span className={say.tech ? `${styles.attNum} font-mono` : styles.attNum}>{say.tech ? units : ''}</span>
    </div>
  );
});

function AttentionCard({
  p,
  say,
  match,
}: {
  readonly p: DetailsProps;
  readonly say: Say;
  readonly match: Card['match'];
}) {
  const r = readoutAt(p.frames, p.vis, p.window);
  const head = fill(say.words.readoutHead, { step: r.step, steps: r.steps });
  return (
    <>
      <div className={styles.kicker}>{fill(say.words.attentionKicker, { head })}</div>
      <p>{say.words.attentionLead}</p>
      <div className={styles.att}>
        {p.attention.map((a) => {
          const step = p.chat.steps[(p.stepOf.get(a.id) ?? 1) - 1];
          if (!step) return null;
          const on = step.blocks.some((b) => match(step.id, b.cat));
          return <AttentionRow key={a.id} say={say} step={step} units={a.units} on={on} />;
        })}
      </div>
      <Crossed text={crossedText({ words: say.words }, r)} />
    </>
  );
}

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

/** The head: Explain's name and its renderMode, or Attention's name and its caption. */
function Head({ say, attention }: { readonly say: Say; readonly attention: boolean }) {
  return (
    <div className={styles.head}>
      <b className="font-semibold">{attention ? say.words.modes.attention : say.words.modes.explain}</b>
      {attention ? (
        <span className={styles.caption}>{say.words.illustrative}</span>
      ) : (
        <span>{say.tech ? say.words.technical : say.words.simple}</span>
      )}
    </div>
  );
}

export function Details(p: DetailsProps) {
  const say = useSay(p);
  const attentionSay = useSay({ ...p, renderMode: p.attentionRenderMode });
  const match = useMemo(() => matcher(p.lit), [p.lit]);
  const handlers = useLighting(p);
  const attention = p.mode === 'attention';
  const card: Card = { ...p, tech: say.tech, match };
  // A new key replays the card's entrance when what it explains changes; stepping alone does not. Attention keeps
  // its card while lit, so hovering a row only restyles it.
  const depth = attention ? p.attentionRenderMode : p.renderMode;
  const key = panelKey({ mode: p.mode, depth, lit: p.lit, ghost: p.ghost });
  return (
    <section className={styles.panel} aria-label={say.words.details} {...handlers}>
      <Head say={say} attention={attention} />
      <div className={`${styles.card} ${styles.surface}`}>
        <div key={key}>
          {attention ? <AttentionCard p={p} say={attentionSay} match={match} /> : <ExplainCard card={card} />}
        </div>
      </div>
    </section>
  );
}
