'use client';

import { useState, type ReactElement } from 'react';
import { evaluateContextGauge } from './token-economy-data.pure';

function GaugeBar({ percent }: { percent: number }): ReactElement {
  return (
    <div className="relative pb-2 pt-8">
      <div className="absolute bottom-6 left-1/2 top-0 z-10 w-px border-l-2 border-dashed border-base-content/50">
        <div className="absolute -top-6 -translate-x-1/2 whitespace-nowrap font-mono text-xs font-bold text-base-content/70">
          ~50% · hallucination onset
        </div>
      </div>
      <div className="relative h-10 w-full overflow-hidden rounded-full border border-base-content/10 bg-base-300">
        <div className="absolute inset-y-0 left-0 w-1/2 bg-success/20" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-error/20" />
        <div
          className="context-gauge-fill relative h-full rounded-full bg-gradient-to-r from-success to-error transition-all duration-150 ease-out"
          style={{ width: `${percent}%` }}
        >
          <div className="absolute right-0 top-1/2 z-20 h-12 w-1.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-base-content shadow-md" />
        </div>
      </div>
      <div className="mt-3 flex justify-between font-mono text-xs font-bold">
        <span className="text-success">Smart zone · grounded</span>
        <span className="text-error">Danger zone · hallucinates</span>
      </div>
    </div>
  );
}

function RiskPanel({ percent }: { percent: number }): ReactElement {
  const isRisky = percent > 50;
  if (!isRisky) return <div className="min-h-[6.5rem]" aria-hidden="true" />;

  return (
    <div className="rounded-box border border-error/30 bg-error/5 p-5 transition-all duration-300">
      <div className="mb-2 flex items-center gap-2 font-mono text-sm font-bold text-error">
        <span className="badge badge-error badge-sm">past ~50%</span> what &ldquo;losing the plot&rdquo; looks like
      </div>
      <ul className="grid gap-1 text-sm text-base-content/80 md:grid-cols-3">
        <li>· misremembers the middle</li>
        <li>· contradicts earlier steps</li>
        <li>· invents files &amp; APIs that don&rsquo;t exist</li>
      </ul>
      <div className="mt-2 font-mono text-xs text-base-content/50">
        ~illustrative threshold, not an exact number — but degradation well before the limit is measured across frontier
        models
      </div>
    </div>
  );
}

function MitigationLevers(): ReactElement {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="card border border-base-content/10 bg-base-200 p-5 shadow-xs">
        <h4 className="font-mono text-lg font-bold text-primary">Monitor · /context</h4>
        <p className="mt-1 text-sm text-base-content/70">
          Watch the gauge before it degrades — catch it while it is still grounded.
        </p>
      </div>
      <div className="card border border-base-content/10 bg-base-200 p-5 shadow-xs">
        <h4 className="font-mono text-lg font-bold text-accent">Compact · handoff</h4>
        <p className="mt-1 text-sm text-base-content/70">
          Summarize where you are into a clean handoff, then start fresh from it.
        </p>
      </div>
    </div>
  );
}

function GaugeSliderControl({ percent, onChange }: { percent: number; onChange: (val: number) => void }): ReactElement {
  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="s43-slider"
        className="shrink-0 font-mono text-[0.65rem] uppercase tracking-wider text-base-content/50"
      >
        drag the fill
      </label>
      <input
        id="s43-slider"
        type="range"
        min="0"
        max="100"
        value={percent}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range range-sm flex-1"
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
    <div className="space-y-6">
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
