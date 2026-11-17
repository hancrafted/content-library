'use client';
// decision: docs/decision-records/0024-software-ecology-flow-model-and-use-case-files.md
import { fillTemplate } from '@/shared/lib/template.pure';
import { Lightbulb } from 'lucide-react';
import { Fragment, useId } from 'react';
import type { OwnReadout } from './dashboard-readouts.pure.ts';
import { OWN_RATE_MAX, type OwnSet, type OwnWorkWords } from './own-work.types';
import { Field, HelpNameProvider, HelpTip, Segmented, SliderControl, Value } from './settings-field.client';
import styles from './software-ecology.module.css';
import { ToolTip } from './toolbar-tip.client';

export interface OwnWorkSectionProps {
  readonly node: string;
  readonly own: readonly OwnReadout[];
  readonly words: OwnWorkWords;
  readonly onChange: (id: string, patch: OwnSet) => void;
  readonly onEmit: () => void;
}

interface SourceProps {
  readonly node: string;
  readonly x: OwnReadout;
  readonly words: OwnWorkWords;
  readonly onChange: OwnWorkSectionProps['onChange'];
}

function RateField(p: SourceProps) {
  const { x, words: w } = p,
    shown = fillTemplate(w.perWeek, { n: x.now.rate });
  return (
    <Field
      label={w.rate}
      control={`${p.node}.own.rate`}
      tip={w.rateTip}
      trailing={(id) => <Value labelId={id}>{shown}</Value>}
    >
      {(id) => (
        <SliderControl
          labelId={id}
          control={`${p.node}.own.rate`}
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
    <Field label={w.arrivals} control={`${p.node}.own.arrivals`} tip={w.arrivalsTip}>
      {(id) => (
        <Segmented
          labelId={id}
          control={`${p.node}.own.arrivals`}
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

function EmitButton(p: { readonly node: string; readonly words: OwnWorkWords; readonly onEmit: () => void }) {
  return (
    <ToolTip tip={p.words.emitTip}>
      <button
        type="button"
        className={`${styles.tbtn} ${styles.tbtnLine} text-caption`}
        onClick={p.onEmit}
        data-control={`${p.node}.emit`}
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
          <HelpTip name={p.words.title} tip={p.words.tip} control={`${p.node}.own.help`} />
        </div>
        {p.own.map((x) => (
          <Fragment key={x.id}>
            <RateField node={p.node} x={x} words={p.words} onChange={p.onChange} />
            <ArrivalsField node={p.node} x={x} words={p.words} onChange={p.onChange} />
          </Fragment>
        ))}
        <EmitButton node={p.node} words={p.words} onEmit={p.onEmit} />
      </section>
    </HelpNameProvider>
  );
}
