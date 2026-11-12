'use client';

import { fillTemplate } from '@/shared/lib/template.pure';
import { aiKeyOf, withAi, withAiq, withCompany, withReality, type AiChoice } from './factory-settings.pure.ts';
import { Field, Segmented, SliderControl } from './settings-field.client';
import type { ModelWords } from './software-ecology-words.types';
import type { AiQuality, Bundle, Company, Settings } from './software-ecology.types';

/*
 * The Settings popover's Model column (feature guide, Interaction 3): Ideal to Realistic, where AI works, the company
 * and the AI quality effect, each one form field (feedback 09). Ported from the reference build's `renderModel`; each
 * control writes new settings up through `onSettings`. Reset to default sits in the popover's foot.
 */

export interface ModelMenuProps {
  readonly B: Bundle;
  readonly settings: Settings;
  readonly words: ModelWords;
  /** Off, each preset's AI set (titled), everywhere. */
  readonly aiChoices: readonly AiChoice[];
  readonly onSettings: (s: Settings) => void;
  /** Back to what the use-case file defines for the active state. */
  readonly onReset: () => void;
}

function Reality(p: ModelMenuProps) {
  const w = p.words,
    r = p.settings.reality,
    text = r ? fillTemplate(w.realityText, { n: r }) : w.ideal;
  return (
    <Field
      label={w.reality}
      tip={w.tips.reality}
      trailing={<output className="text-caption font-semibold">{text}</output>}
    >
      {(l) => (
        <SliderControl
          labelId={l}
          min={0}
          max={100}
          step={5}
          value={r}
          valueText={text}
          onChange={(n) => p.onSettings(withReality(p.settings, n))}
        />
      )}
    </Field>
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
    <Field label={w.ai} tip={w.tips.ai}>
      {(l) => <Segmented labelId={l} items={items} on={aiKeyOf(p.B, p.settings)} ai onPick={pick} />}
    </Field>
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
    <Field label={w.company} tip={w.tips.company}>
      {(l) => <Segmented labelId={l} items={items} on={p.settings.company} onPick={pick} />}
    </Field>
  );
}

function Aiq(p: ModelMenuProps) {
  const w = p.words,
    items = (['worse', 'same', 'better'] as AiQuality[]).map((id) => ({ id, label: w[id] }));
  return (
    <Field label={w.aiq} tip={w.tips.aiq}>
      {(l) => (
        <Segmented labelId={l} items={items} on={p.settings.aiq} onPick={(q) => p.onSettings(withAiq(p.settings, q))} />
      )}
    </Field>
  );
}

export function ModelMenu(p: ModelMenuProps) {
  return (
    <>
      <Reality {...p} />
      <Ai {...p} />
      <CompanyRow {...p} />
      <Aiq {...p} />
    </>
  );
}
