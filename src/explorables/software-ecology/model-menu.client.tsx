'use client';

import { fillTemplate } from '@/shared/lib/template.pure';
import { useId, type ReactNode } from 'react';
import { aiKeyOf, withAi, withAiq, withCompany, withReality, type AiChoice } from './factory-settings.pure.ts';
import type { ModelWords } from './software-ecology-words.types';
import styles from './software-ecology.module.css';
import type { AiQuality, Bundle, Company, Settings } from './software-ecology.types';

/*
 * The Settings popover's Model column (feature guide, Interaction 3): Ideal to Realistic, where AI works, the company,
 * the AI quality effect, and Back to the state. Ported from the reference build's `renderModel`; each control writes
 * new settings up through `onSettings`. The mechanics' strengths sit in the Mechanics column.
 */

export interface ModelMenuProps {
  readonly B: Bundle;
  readonly settings: Settings;
  readonly words: ModelWords;
  /** Off, each preset's AI set (titled), everywhere. */
  readonly aiChoices: readonly AiChoice[];
  readonly onSettings: (s: Settings) => void;
  readonly onReset: () => void;
}

interface SegProps<T extends string> {
  readonly labelId: string;
  readonly items: readonly { id: T; label: string }[];
  readonly on: string;
  readonly ai?: boolean;
  readonly onPick: (id: T) => void;
}

function Seg<T extends string>(p: SegProps<T>) {
  return (
    <div className={`${styles.seg} ${p.ai ? styles.segAi : ''}`} role="group" aria-labelledby={p.labelId}>
      {p.items.map((x) => (
        <button
          key={x.id}
          type="button"
          className="text-caption"
          aria-pressed={x.id === p.on}
          onClick={() => p.onPick(x.id)}
        >
          {x.label}
        </button>
      ))}
    </div>
  );
}

function Reality(p: ModelMenuProps) {
  const id = useId(),
    w = p.words,
    r = p.settings.reality;
  return (
    <div className={styles.mrow}>
      <label htmlFor={id} className={styles.tipL} data-tip={w.tips.reality}>
        {w.reality}
      </label>
      <span className="text-muted-foreground">{w.ideal}</span>
      <input
        type="range"
        className={styles.range}
        id={id}
        min={0}
        max={100}
        step={5}
        value={r}
        aria-valuetext={r ? fillTemplate(w.realityText, { n: r }) : w.ideal}
        onChange={(e) => p.onSettings(withReality(p.settings, Number(e.target.value)))}
      />
      <span className="text-muted-foreground">{w.realistic}</span>
    </div>
  );
}

function Row(p: { label: string; tip: string; children: (labelId: string) => ReactNode }) {
  const id = useId();
  return (
    <div className={styles.mrow}>
      <span id={id} className={styles.tipL} data-tip={p.tip}>
        {p.label}
      </span>
      {p.children(id)}
    </div>
  );
}

function Ai(p: ModelMenuProps) {
  const w = p.words,
    items = p.aiChoices.map((c) => ({ id: c.id, label: c.label }));
  const pick = (id: string) => {
    const c = p.aiChoices.find((x) => x.id === id);
    if (c) p.onSettings(withAi(p.settings, c.ai));
  };
  return (
    <Row label={w.ai} tip={w.tips.ai}>
      {(l) => <Seg labelId={l} items={items} on={aiKeyOf(p.B, p.settings)} ai onPick={pick} />}
    </Row>
  );
}

function CompanyRow(p: ModelMenuProps) {
  const w = p.words;
  if (!p.B.data.sources?.length) return null;
  const items: { id: Company; label: string }[] = [
    { id: 'service', label: w.service },
    { id: 'product', label: w.product },
  ];
  const pick = (c: Company) => {
    if (c !== p.settings.company) p.onSettings(withCompany(p.settings, c));
  };
  return (
    <Row label={w.company} tip={w.tips.company}>
      {(l) => <Seg labelId={l} items={items} on={p.settings.company} onPick={pick} />}
    </Row>
  );
}

function Aiq(p: ModelMenuProps) {
  const w = p.words,
    items = (['worse', 'same', 'better'] as AiQuality[]).map((id) => ({ id, label: w[id] }));
  return (
    <Row label={w.aiq} tip={w.tips.aiq}>
      {(l) => (
        <Seg labelId={l} items={items} on={p.settings.aiq} onPick={(q) => p.onSettings(withAiq(p.settings, q))} />
      )}
    </Row>
  );
}

export function ModelMenu(p: ModelMenuProps) {
  return (
    <>
      <Reality {...p} />
      <Ai {...p} />
      <CompanyRow {...p} />
      <Aiq {...p} />
      <p className="m-0 text-caption text-muted-foreground">{p.words.note}</p>
      <div className={styles.mrow}>
        <button
          type="button"
          className={`${styles.ghostBtn} text-caption`}
          data-tip={p.words.tips.reset}
          onClick={p.onReset}
        >
          {p.words.reset}
        </button>
      </div>
    </>
  );
}
