'use client';
// spec: docs/features/explorables/software-ecology.md#interaction
import { fillTemplate } from '@/shared/lib/template.pure';
import {
  aiHookOf,
  aiKeyOf,
  withAi,
  withAiq,
  withCompany,
  withReality,
  type AiChoice,
} from './factory-settings.pure.ts';
import { Field, Segmented, SliderControl, Value } from './settings-field.client';
import type { ModelWords } from './software-ecology-words.types';
import type { AiQuality, Bundle, Company, Settings } from './software-ecology.types';

export interface ModelMenuProps {
  readonly B: Bundle;
  readonly settings: Settings;
  readonly words: ModelWords;
  readonly aiChoices: readonly AiChoice[];
  readonly onSettings: (s: Settings) => void;
  readonly onReset: () => void;
}

function Reality(p: ModelMenuProps) {
  const w = p.words,
    r = p.settings.reality,
    text = r ? fillTemplate(w.realityText, { n: r }) : w.ideal;
  return (
    <Field
      label={w.reality}
      control="settings.realism"
      tip={w.tips.reality}
      trailing={(l) => <Value labelId={l}>{text}</Value>}
    >
      {(l) => (
        <SliderControl
          labelId={l}
          control="settings.realism"
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
    items = p.aiChoices.map((c) => ({ id: c.id, label: c.label, hook: aiHookOf(c) }));
  const pick = (id: string) => {
    const c = p.aiChoices.find((x) => x.id === id);
    if (c) p.onSettings(withAi(p.settings, c.ai));
  };
  return (
    <Field label={w.ai} control="settings.ai" tip={w.tips.ai}>
      {(l) => (
        <Segmented labelId={l} control="settings.ai" items={items} on={aiKeyOf(p.B, p.settings)} ai onPick={pick} />
      )}
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
    <Field label={w.company} control="settings.company" tip={w.tips.company}>
      {(l) => <Segmented labelId={l} control="settings.company" items={items} on={p.settings.company} onPick={pick} />}
    </Field>
  );
}

function Aiq(p: ModelMenuProps) {
  const w = p.words,
    items = (['worse', 'same', 'better'] as AiQuality[]).map((id) => ({ id, label: w[id] }));
  return (
    <Field label={w.aiq} control="settings.ai-quality" tip={w.tips.aiq}>
      {(l) => (
        <Segmented
          labelId={l}
          control="settings.ai-quality"
          items={items}
          on={p.settings.aiq}
          onPick={(q) => p.onSettings(withAiq(p.settings, q))}
        />
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
