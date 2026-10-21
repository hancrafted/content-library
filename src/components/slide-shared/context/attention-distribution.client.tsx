'use client';

import { Check, Pencil } from 'lucide-react';
import { useId, useState } from 'react';
import { CURVE_KEYS, type CurveKey } from './attention-curve.pure';
import type { AttentionMenuModel } from './context-parts.types';
import type { ContextWords } from './context-words.types';
import styles from './context.module.css';

/* The Attention menu's distribution section: four sliders, or, after the pen, four number inputs the check saves. */

type Shares = Readonly<Record<CurveKey, number>>;
type Curves = NonNullable<AttentionMenuModel['curve']>;

interface SliderProps {
  readonly name: CurveKey;
  readonly label: string;
  readonly value: number;
  readonly onChange: (value: number) => void;
}

function Slider({ name, label, value, onChange }: SliderProps) {
  const id = useId();
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="flex justify-between gap-3 text-caption">
        <span>{label}</span>
        <output htmlFor={id} className="font-mono font-semibold">
          {value}%
        </output>
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        aria-valuetext={`${value}%`}
        data-curve={name}
        className={styles.curveSlider}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </div>
  );
}

/** The edit mode's number inputs: free text while typing, nothing validated until the check saves. */
function Fields({
  words,
  draft,
  onDraft,
}: {
  readonly words: ContextWords;
  readonly draft: Draft;
  readonly onDraft: (key: CurveKey, text: string) => void;
}) {
  return (
    <>
      {CURVE_KEYS.map((name) => (
        <label key={name} className="flex items-center justify-between gap-3 text-caption">
          <span>{words.attentionCurve[name]}</span>
          <span className="flex items-center gap-1">
            <input
              type="number"
              inputMode="decimal"
              value={draft[name]}
              data-curve-input={name}
              className={`${styles.curveInput} text-caption font-mono`}
              onChange={(event) => onDraft(name, event.currentTarget.value)}
            />
            <span className="font-mono">%</span>
          </span>
        </label>
      ))}
    </>
  );
}

type Draft = Readonly<Record<CurveKey, string>>;

const draftOf = (shares: Shares): Draft =>
  Object.fromEntries(CURVE_KEYS.map((key) => [key, String(shares[key])])) as Draft;

/** Typed text as a number; empty or unreadable text is NaN, which the normaliser counts as 0. */
const sharesOf = (draft: Draft): Shares =>
  Object.fromEntries(
    CURVE_KEYS.map((key) => [key, Number(draft[key].trim() === '' ? Number.NaN : draft[key])]),
  ) as Shares;

interface PenProps {
  readonly words: ContextWords;
  readonly editing: boolean;
  readonly onClick: () => void;
}

/** The pen that starts typing the shares, which becomes the check that saves them (and says it normalises). */
function Pen({ words, editing, onClick }: PenProps) {
  const label = editing ? words.attentionSave : words.attentionEdit;
  const tip = editing ? words.attentionSaveTip : words.attentionEdit;
  const tipId = useId();
  // One tooltip: the CSS one from data-tip, opening leftwards so the popover's edge never clips it. No native title.
  return (
    <>
      <button
        type="button"
        className={`${styles.icon} ${styles.tipStart}`}
        data-control={editing ? 'attentionSave' : 'attentionEdit'}
        aria-label={label}
        aria-describedby={editing ? tipId : undefined}
        data-tip={tip}
        onClick={onClick}
      >
        {editing ? <Check aria-hidden="true" /> : <Pencil aria-hidden="true" />}
      </button>
      {editing && (
        <span id={tipId} className="sr-only">
          {tip}
        </span>
      )}
    </>
  );
}

function Sliders({ words, curves }: { readonly words: ContextWords; readonly curves: Curves }) {
  const total = CURVE_KEYS.reduce((sum, key) => sum + curves.shares[key], 0);
  return (
    <>
      {CURVE_KEYS.map((name) => (
        <Slider
          key={name}
          name={name}
          label={words.attentionCurve[name]}
          value={curves.shares[name]}
          onChange={(value) => curves.onShare(name, value)}
        />
      ))}
      <p className="text-caption text-muted-foreground">
        <span className="font-mono">{total}%</span>
      </p>
    </>
  );
}

export function Distribution({ words, curves }: { readonly words: ContextWords; readonly curves: Curves }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const toggle = () => {
    if (draft) curves.onShares(sharesOf(draft));
    setDraft(draft ? null : draftOf(curves.shares));
  };
  return (
    <section className="grid gap-3" aria-label={words.attentionMenu}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-caption font-semibold">{words.attentionMenu}</p>
        <Pen words={words} editing={draft !== null} onClick={toggle} />
      </div>
      {draft ? (
        <Fields words={words} draft={draft} onDraft={(key, text) => setDraft({ ...draft, [key]: text })} />
      ) : (
        <Sliders words={words} curves={curves} />
      )}
    </section>
  );
}
