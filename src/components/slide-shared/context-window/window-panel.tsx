import { readoutAt } from './context-usage.pure';
import { fill, stepCat, type View } from './context-view';
import styles from './context-window.module.css';
import { colourOf } from './context-window.pure';
import { tint } from './window-bits';
import { nameOf } from './window-chat-body';
import { CategoryCard, Crossed, crossedText, GhostCard, RestCard, StepCard } from './window-panel-cards';

/* The detail panel: Explain tells what the lit part is, Attention shows the 100 units over the steps in the window. */

function AttentionRow({ v, id, units }: { readonly v: View; readonly id: string; readonly units: number }) {
  const step = v.chat.steps[(v.stepOf.get(id) ?? 1) - 1];
  if (!step) return null;
  const on = step.blocks.some((b) => v.match(step.id, b.cat));
  const name = nameOf(v, step);
  return (
    <div className={styles.attRow} data-on={on ? '' : undefined}>
      <button
        type="button"
        className={on ? `${styles.attName} font-semibold` : styles.attName}
        data-part={id}
        title={name}
      >
        {name}
      </button>
      <div className={styles.attBar}>
        <i style={tint(colourOf(stepCat(step), v.state.depth), { '--w': units / 100 })} />
      </div>
      <span className={v.tech ? `${styles.attNum} font-mono` : styles.attNum}>{v.tech ? units : ''}</span>
    </div>
  );
}

function AttentionCard({ v }: { readonly v: View }) {
  const r = readoutAt(v.frames, v.vis, v.window);
  const head = fill(v.words.readoutHead, { step: r.step, steps: r.steps });
  return (
    <>
      <div className={styles.kicker}>{fill(v.words.attentionKicker, { head })}</div>
      <p>{v.words.attentionLead}</p>
      <div className={styles.att}>
        {v.attention.map((a) => (
          <AttentionRow key={a.id} v={v} id={a.id} units={a.units} />
        ))}
      </div>
      <Crossed text={crossedText(v, r)} />
    </>
  );
}

const stepById = (v: View, id: string | null | undefined) =>
  id ? v.chat.steps[(v.stepOf.get(id) ?? 0) - 1] : undefined;

/** Explain's card for what is lit: a step not in the window yet, a category, a step or block, or the step on screen. */
function ExplainCard({ v }: { readonly v: View }) {
  const ghost = stepById(v, v.ghost);
  if (ghost) return <GhostCard v={v} step={ghost} />;
  if (v.lit?.includes(':')) return <CategoryCard v={v} lit={v.lit} />;
  const [id, cat] = (v.lit ?? '').split('@');
  const step = stepById(v, id);
  if (step) return <StepCard v={v} step={step} cat={cat} />;
  return <RestCard v={v} r={readoutAt(v.frames, v.vis, v.window)} />;
}

export function Panel({ v }: { readonly v: View }) {
  const attention = v.state.mode === 'attention';
  // A new key replays the card's entrance when what it explains changes; stepping alone does not.
  const key = [v.state.mode, v.state.depth, v.lit, v.ghost].join('|');
  return (
    <section className={styles.panel} aria-label={v.words.details}>
      <div className={styles.head}>
        <b className="font-semibold">{attention ? v.words.modes.attention : v.words.modes.explain}</b>
        {attention ? (
          <span className={styles.caption}>{v.words.illustrative}</span>
        ) : (
          <span>{v.tech ? v.words.technical : v.words.simple}</span>
        )}
      </div>
      <div className={`${styles.card} ${styles.surface}`}>
        <div key={key}>{v.state.mode === 'attention' ? <AttentionCard v={v} /> : <ExplainCard v={v} />}</div>
      </div>
    </section>
  );
}
