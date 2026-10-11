'use client';

import { useId, useState, type ReactElement } from 'react';
import { evaluateContextGauge } from './context-gauge.pure';
import styles from './status.module.css';

function GaugeBar({ percent }: { percent: number }): ReactElement {
  return (
    <div className="relative pb-2 pt-8">
      <div className="absolute bottom-6 left-1/2 top-0 z-10 w-px border-l-2 border-dashed border-border">
        <div className="absolute -top-6 -translate-x-1/2 whitespace-nowrap font-mono text-xs font-bold text-muted-foreground">
          ~50% · hallucination onset
        </div>
      </div>
      <div className="relative h-10 w-full overflow-hidden rounded-full border border-border bg-muted">
        <div className="absolute inset-y-0 left-0 w-1/2 bg-(--success)/20" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-destructive/20" />
        <div
          className="context-gauge-fill relative h-full rounded-full bg-gradient-to-r from-(--success) to-destructive transition-all duration-150 ease-out"
          style={{ width: `${percent}%` }}
        >
          <div className="absolute right-0 top-1/2 z-20 h-12 w-1.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-foreground shadow-md" />
        </div>
      </div>
      <div className="mt-3 flex justify-between font-mono text-xs font-bold">
        <span className="text-(--success)">Smart zone · grounded</span>
        <span className="text-destructive">Danger zone · hallucinates</span>
      </div>
    </div>
  );
}

function RiskPanel({ percent }: { percent: number }): ReactElement {
  const isRisky = percent > 50;
  if (!isRisky) return <div className="min-h-[6.5rem]" aria-hidden="true" />;

  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 transition-all duration-300">
      <div className="mb-2 flex items-center gap-2 font-mono text-sm font-bold text-destructive">
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-destructive/10 text-destructive">
          past ~50%
        </span>{' '}
        what &ldquo;losing the plot&rdquo; looks like
      </div>
      <ul className="grid gap-1 text-sm text-foreground md:grid-cols-3">
        <li>· misremembers the middle</li>
        <li>· contradicts earlier steps</li>
        <li>· invents files &amp; APIs that don&rsquo;t exist</li>
      </ul>
      <div className="mt-2 font-mono text-xs text-muted-foreground">
        ~illustrative threshold, not an exact number — but degradation well before the limit is measured across frontier
        models
      </div>
    </div>
  );
}

function MitigationLevers(): ReactElement {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-border bg-muted p-5 shadow-xs">
        <h4 className="font-mono text-lg font-bold text-primary">Monitor · /context</h4>
        <p className="mt-1 text-sm text-muted-foreground">
          Watch the gauge before it degrades — catch it while it is still grounded.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-muted p-5 shadow-xs">
        <h4 className="font-mono text-lg font-bold text-accent">Compact · handoff</h4>
        <p className="mt-1 text-sm text-muted-foreground">
          Summarize where you are into a clean handoff, then start fresh from it.
        </p>
      </div>
    </div>
  );
}

function GaugeSliderControl({ percent, onChange }: { percent: number; onChange: (val: number) => void }): ReactElement {
  const inputId = useId();
  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor={inputId}
        className="shrink-0 font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground"
      >
        drag the fill
      </label>
      <input
        id={inputId}
        type="range"
        min="0"
        max="100"
        value={percent}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-primary flex-1"
        aria-label="Context window fullness"
      />
      <span className="w-12 text-right font-mono text-sm font-bold tabular-nums">{percent}%</span>
    </div>
  );
}

export function ContextGaugeSliderClient(): ReactElement {
  const [percent, setPercent] = useState(85);
  const gaugeState = evaluateContextGauge(percent);

  return (
    <div className={`${styles.scene} space-y-6`}>
      <GaugeBar percent={percent} />
      <GaugeSliderControl percent={percent} onChange={setPercent} />
      <div className="flex items-center gap-2">
        <span className={`rounded-md border px-2 py-0.5 font-mono text-xs font-semibold ${gaugeState.toneClass}`}>
          {gaugeState.label}
        </span>
      </div>
      <RiskPanel percent={percent} />
      <MitigationLevers />
    </div>
  );
}
