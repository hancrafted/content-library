'use client';

import { useState, type ReactElement } from 'react';

function QualityBar({ percent, marker }: { percent: number; marker: number }): ReactElement {
  return (
    <div className="relative h-3 overflow-hidden rounded-full bg-base-300">
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-300"
        style={{ width: `${percent}%` }}
      />
      <div className="absolute inset-y-0 w-px bg-primary" style={{ left: `${marker}%` }} aria-hidden="true" />
    </div>
  );
}

function OutcomeBar({ percent }: { percent: number }): ReactElement {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-base-300">
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function PremiumModelCard({ threshold }: { threshold: number }): ReactElement {
  return (
    <div className="card border border-base-300 bg-base-100 p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <h4 className="font-display text-xl font-bold">Premium model</h4>
        <span className="badge badge-outline badge-sm font-mono text-[0.65rem]">5× the price</span>
      </div>
      <div className="mt-4">
        <div className="mb-1 flex items-baseline justify-between font-mono text-[0.65rem] uppercase tracking-wider text-base-content/50">
          <span>Quality delivered</span>
          <span className="tabular-nums text-base-content/70">99%</span>
        </div>
        <QualityBar percent={99} marker={threshold} />
      </div>
      <div className="mt-4">
        <p className="mb-1 font-mono text-[0.65rem] uppercase tracking-wider text-base-content/50">Outcome per euro</p>
        <OutcomeBar percent={20} />
      </div>
    </div>
  );
}

function CheaperCardBars({ threshold }: { threshold: number }): ReactElement {
  return (
    <>
      <div className="mt-4">
        <div className="mb-1 flex items-baseline justify-between font-mono text-[0.65rem] uppercase tracking-wider text-base-content/50">
          <span>Quality delivered</span>
          <span className="tabular-nums text-base-content/70">95%</span>
        </div>
        <QualityBar percent={95} marker={threshold} />
      </div>
      <div className="mt-4">
        <div className="mb-1 flex items-baseline justify-between font-mono text-[0.65rem] uppercase tracking-wider text-base-content/50">
          <span>Outcome per euro</span>
          <span className="font-semibold tabular-nums text-primary">≈5×</span>
        </div>
        <OutcomeBar percent={100} />
      </div>
    </>
  );
}

function CheaperModelCard({ threshold }: { threshold: number }): ReactElement {
  const isWinner = threshold <= 95;
  return (
    <div className="card relative border border-primary/50 bg-primary/5 p-5 shadow-xs">
      {isWinner && (
        <span className="badge badge-primary badge-sm absolute -top-2.5 right-4 font-mono text-[0.65rem] uppercase tracking-wider">
          financial winner
        </span>
      )}
      <div className="flex items-center justify-between">
        <h4 className="font-display text-xl font-bold">Cheaper model</h4>
        <span className="badge badge-primary badge-outline badge-sm font-mono text-[0.65rem]">1× the price</span>
      </div>
      <CheaperCardBars threshold={threshold} />
    </div>
  );
}

function thresholdText(threshold: number): string {
  if (threshold <= 95) {
    return `At ${threshold}%, both models clear the bar — the cheaper one wins ≈5× outcome per euro.`;
  }
  if (threshold <= 99) {
    return `At ${threshold}%, only the premium model clears the bar — now the 5× price actually buys something.`;
  }
  return 'Neither model reaches 100%. Rethink the task, not the model.';
}

function ThresholdSliderBox({
  threshold,
  onChange,
}: {
  threshold: number;
  onChange: (val: number) => void;
}): ReactElement {
  return (
    <div className="rounded-box border border-base-300 bg-base-200/50 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label htmlFor="s25-threshold" className="text-sm font-medium text-base-content/80">
          Drag: what quality does your customer actually need?
        </label>
        <span className="font-mono text-sm font-bold tabular-nums text-primary">{threshold}%</span>
      </div>
      <input
        id="s25-threshold"
        type="range"
        min="90"
        max="100"
        value={threshold}
        step="1"
        onChange={(e) => onChange(Number(e.target.value))}
        className="range range-primary range-sm mt-3 w-full"
        aria-label="Customer quality threshold"
      />
      <p className="mt-3 text-sm leading-relaxed text-base-content/70">{thresholdText(threshold)}</p>
    </div>
  );
}

export function OutcomePerEuroClient(): ReactElement {
  const [threshold, setThreshold] = useState(93);

  return (
    <div className="mt-8 flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <PremiumModelCard threshold={threshold} />
        <CheaperModelCard threshold={threshold} />
      </div>
      <ThresholdSliderBox threshold={threshold} onChange={setThreshold} />
    </div>
  );
}
