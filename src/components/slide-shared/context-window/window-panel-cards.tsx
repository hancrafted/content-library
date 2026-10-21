import type { ReactNode } from 'react';
import { deltaText, oneDecimal, percentText } from './context-format.pure';
import type { Readout } from './context-usage.pure';
import { catLabel, fill, k, stepCat, storyOf, type View } from './context-view';
import styles from './context-window.module.css';
import { colourOf, compactStepOf, goneAt } from './context-window.pure';
import type { Step } from './context-window.types';
import { Rich, tint } from './window-bits';

/* The detail panel's cards: a step, a category, a step not in the window yet, a step no longer in it. */

export const crossedText = (v: View, r: Readout): string | null =>
  r.crossed ? fill(v.words.crossed, { who: r.crossed.who }) : null;

export function Crossed({ text }: { readonly text: string | null }) {
  return text ? <span className={`${styles.crossed} font-semibold`}>{text}</span> : null;
}

function Heading({ colour, children }: { readonly colour: string | undefined | null; readonly children: ReactNode }) {
  return (
    <h4 className="text-body font-semibold">
      {colour ? <span className={styles.dot} style={tint(colour)} /> : null}
      {children}
    </h4>
  );
}

function Title({ v, step }: { readonly v: View; readonly step: Step }) {
  return <Heading colour={colourOf(stepCat(step), v.state.depth)}>{storyOf(v, step).event}</Heading>;
}

function Lists({ v, step }: { readonly v: View; readonly step: Step }) {
  const story = storyOf(v, step);
  if (!story.kept) return null;
  return (
    <>
      <p>
        <b className="font-semibold">{v.words.kept}</b>
      </p>
      <ul className={styles.list}>
        {story.kept.map((item) => (
          <li key={item}>
            <Rich text={item} />
          </li>
        ))}
      </ul>
      <p>
        <b className="font-semibold">{v.words.dropped}</b>
      </p>
      <ul className={styles.list}>
        {(story.dropped ?? []).map((item) => (
          <li key={item}>
            <Rich text={item} />
          </li>
        ))}
      </ul>
    </>
  );
}

/** One figure of a card's stat row: the number, and what it counts. */
function Stat({
  value,
  label,
  dim = false,
}: {
  readonly value: string | number;
  readonly label: string;
  readonly dim?: boolean;
}) {
  return (
    <div data-dim={dim ? '' : undefined}>
      <b className="text-body font-semibold">{value}</b>
      {label}
    </div>
  );
}

const explanation = (v: View, step: Step) => (v.tech ? storyOf(v, step).technical : storyOf(v, step).simple);

/** A step's explanation at the view's depth, its code block in Technical, and a compaction's lists. */
function Explained({ v, step }: { readonly v: View; readonly step: Step }) {
  const pre = v.tech ? storyOf(v, step).pre : undefined;
  return (
    <>
      <p>
        <Rich text={explanation(v, step)} />
      </p>
      {pre ? <pre className={`${styles.pre} font-mono`}>{pre}</pre> : null}
      <Lists v={v} step={step} />
    </>
  );
}

/** A pinned step the timeline has not reached: where it will land. */
export function GhostCard({ v, step }: { readonly v: View; readonly step: Step }) {
  return (
    <>
      <div className={styles.kicker}>{fill(v.words.pinnedKicker, { step: v.stepOf.get(step.id) ?? 0 })}</div>
      <Title v={v} step={step} />
      <p className={`${styles.big} text-body font-semibold`}>{v.words.notYet}</p>
      <p>{v.words.notYetHint}</p>
    </>
  );
}

function GoneCard({ v, step }: { readonly v: View; readonly step: Step }) {
  const compact = compactStepOf(v.chat);
  const why =
    compact !== null && compact <= v.vis ? fill(v.words.goneCompacted, { step: compact }) : v.words.goneCleared;
  return (
    <>
      <div className={styles.kicker}>{fill(v.words.stepKicker, { step: v.stepOf.get(step.id) ?? 0 })}</div>
      <Title v={v} step={step} />
      <p className={`${styles.big} text-body font-semibold`}>{v.words.gone}</p>
      <p>{why}</p>
    </>
  );
}

/** A lit step or one block of it: what it added, and what it is. */
export function StepCard({
  v,
  step,
  cat,
}: {
  readonly v: View;
  readonly step: Step;
  readonly cat: string | undefined;
}) {
  const index = v.stepOf.get(step.id) ?? 0;
  if (goneAt(v.chat, v.frames, { index: index - 1, step: v.vis })) return <GoneCard v={v} step={step} />;
  const kicker = fill(v.words.stepKicker, { step: index });
  return (
    <>
      <div className={styles.kicker}>{v.state.pinned === v.lit ? `${kicker} · ${v.words.pinned}` : kicker}</div>
      <Title v={v} step={step} />
      <div className={styles.stat}>
        {step.blocks.map((b) => (
          <Stat
            key={b.cat}
            value={k(v, b.tokens)}
            label={catLabel(v, b.cat)}
            dim={cat !== undefined && b.cat !== cat}
          />
        ))}
      </div>
      <Explained v={v} step={step} />
    </>
  );
}

function categoryOf(v: View, key: string): { label: string; colour: string | undefined } {
  if (key.startsWith('cat:')) {
    const cat = key.slice(4) as Step['blocks'][number]['cat'];
    return { label: v.words.categories[cat], colour: colourOf(cat, 'technical') };
  }
  if (key.startsWith('scat:')) {
    const simple = key.slice(5) as keyof View['words']['simpleCategories'];
    return { label: v.words.simpleCategories[simple], colour: `--cs-s-${simple}` };
  }
  return { label: v.words.messages, colour: undefined };
}

/** A lit category: its tokens, its share, how many steps fill it, and the newest of them explained. */
export function CategoryCard({ v, lit }: { readonly v: View; readonly lit: string }) {
  const { label, colour } = categoryOf(v, lit);
  const blocks = v.frame.blocks.filter((b) => v.match(b.id, b.cat));
  const tokens = blocks.reduce((sum, b) => sum + b.tokens, 0);
  const ids = new Set(blocks.map((b) => b.id));
  const example = v.chat.steps.filter((s) => ids.has(s.id)).at(-1);
  const percent = oneDecimal((tokens / v.window.tokens) * 100, v.locale);
  return (
    <>
      <div className={styles.kicker}>{v.tech ? v.words.category : v.words.usageTitle.simple}</div>
      <Heading colour={colour}>{label}</Heading>
      <div className={styles.stat}>
        <Stat value={k(v, tokens)} label={v.words.tokens} />
        <Stat value={`${percent}%`} label={v.words.ofWindow} />
        <Stat value={ids.size} label={ids.size === 1 ? v.words.stepOne : v.words.stepOther} />
      </div>
      <p>{example ? <Rich text={explanation(v, example)} /> : v.words.nothingYet}</p>
    </>
  );
}

/** Nothing lit: the step on screen, what it added, how full the window is. */
export function RestCard({ v, r }: { readonly v: View; readonly r: Readout }) {
  const step = v.chat.steps[v.vis - 1];
  if (!step) return null;
  return (
    <>
      <div className={styles.kicker}>{fill(v.words.readoutHead, { step: r.step, steps: r.steps })}</div>
      <p className={`${styles.big} text-body font-semibold`}>{storyOf(v, step).event}</p>
      {storyOf(v, step).kept ? (
        <p>
          <Rich text={explanation(v, step)} />
        </p>
      ) : null}
      <Lists v={v} step={step} />
      <div className={styles.stat}>
        <Stat value={deltaText(r.delta, v.locale)} label={v.words.tokens} />
        <Stat value={`${percentText(r.percent, v.locale)}%`} label={v.words.used} />
      </div>
      <Crossed text={crossedText(v, r)} />
      <p className={styles.restHint}>{v.words.restHint}</p>
    </>
  );
}
