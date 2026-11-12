'use client';

import { fillTemplate } from '@/shared/lib/template.pure';
import { Lightbulb } from 'lucide-react';
import { Fragment, useId } from 'react';
import type { OwnReadout } from './dashboard-readouts.pure.ts';
import { OWN_RATE_MAX, type OwnSet, type OwnWorkWords } from './own-work.types';
import { Field, HelpNameProvider, HelpTip, Segmented, SliderControl, Value } from './settings-field.client';
import styles from './software-ecology.module.css';
import { ToolTip } from './toolbar-tip.client';

/*
 * A work center's own work (design-ADR 0024 §2, §17; feedback 10): for a node the file gives a source, the tickets it
 * writes itself a week and whether they come Steady or Random, in the Settings form-field pattern. It shows only under
 * Product company: the readout holds no sources under Service provider. Every change goes up through `onChange`.
 */

export interface OwnWorkSectionProps {
  readonly own: readonly OwnReadout[];
  readonly words: OwnWorkWords;
  readonly onChange: (id: string, patch: OwnSet) => void;
  /** Emit one own ticket at this work center now. */
  readonly onEmit: () => void;
}

interface SourceProps {
  readonly x: OwnReadout;
  readonly words: OwnWorkWords;
  readonly onChange: OwnWorkSectionProps['onChange'];
}

function RateField(p: SourceProps) {
  const { x, words: w } = p,
    shown = fillTemplate(w.perWeek, { n: x.now.rate });
  return (
    <Field label={w.rate} tip={w.rateTip} trailing={(id) => <Value labelId={id}>{shown}</Value>}>
      {(id) => (
        <SliderControl
          labelId={id}
          min={0}
          max={OWN_RATE_MAX}
          step={0.5}
          value={x.now.rate}
          valueText={shown}
          onChange={(v) => p.onChange(x.id, { rate: v })}
        />
      )}
    </Field>
  );
}

function ArrivalsField(p: SourceProps) {
  const w = p.words;
  return (
    <Field label={w.arrivals} tip={w.arrivalsTip}>
      {(id) => (
        <Segmented
          labelId={id}
          items={[
            { id: 'steady', label: w.steady },
            { id: 'random', label: w.random },
          ]}
          on={p.x.now.arrivals}
          onPick={(arrivals) => p.onChange(p.x.id, { arrivals })}
        />
      )}
    </Field>
  );
}

/** One own ticket now, like a scheduled arrival: an action, not a setting. */
function EmitButton(p: { readonly words: OwnWorkWords; readonly onEmit: () => void }) {
  return (
    <ToolTip tip={p.words.emitTip}>
      <button
        type="button"
        className={`${styles.tbtn} ${styles.tbtnLine} text-caption`}
        onClick={p.onEmit}
        data-emit-own
      >
        <Lightbulb size={16} aria-hidden="true" />
        <span>{p.words.emit}</span>
      </button>
    </ToolTip>
  );
}

export function OwnWorkSection(p: OwnWorkSectionProps) {
  const id = useId();
  if (!p.own.length) return null;
  return (
    <HelpNameProvider value={p.words.help}>
      <section className={styles.ownWork} aria-labelledby={id} data-own-work>
        <div className={styles.setSecHead}>
          <p id={id} className="m-0 text-caption font-semibold">
            {p.words.title}
          </p>
          <HelpTip name={p.words.title} tip={p.words.tip} />
        </div>
        {p.own.map((x) => (
          <Fragment key={x.id}>
            <RateField x={x} words={p.words} onChange={p.onChange} />
            <ArrivalsField x={x} words={p.words} onChange={p.onChange} />
          </Fragment>
        ))}
        <EmitButton words={p.words} onEmit={p.onEmit} />
      </section>
    </HelpNameProvider>
  );
}
