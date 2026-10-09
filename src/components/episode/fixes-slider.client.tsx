'use client';

import { useState, type ReactElement } from 'react';

const COST_LOW = 0.1126;
const COST_HIGH = 1.5403;

function FixesRangeInput({ fixes, onChange }: { fixes: number; onChange: (val: number) => void }): ReactElement {
  return (
    <div className="mt-4 flex items-center gap-3">
      <label
        htmlFor="s52-slider"
        className="shrink-0 font-mono text-[0.65rem] uppercase tracking-wider text-base-content/50"
      >
        fixes / day
      </label>
      <input
        id="s52-slider"
        type="range"
        min="5"
        max="200"
        value={fixes}
        step="5"
        onChange={(e) => onChange(Number(e.target.value))}
        className="range range-primary range-sm flex-1"
        aria-label="Bug fixes per day"
      />
      <span className="w-12 text-right font-mono text-sm font-bold tabular-nums">{fixes}</span>
    </div>
  );
}

export function FixesSliderClient(): ReactElement {
  const [fixes, setFixes] = useState(50);
  const lowCost = Math.round(fixes * COST_LOW);
  const highCost = Math.round(fixes * COST_HIGH);

  return (
    <div className="rounded-box border-l-4 border-primary bg-base-200 p-6">
      <p className="text-base leading-relaxed text-base-content/90 md:text-lg">
        <span className="font-bold text-primary">~14× spread</span> for identical output. At{' '}
        <span className="font-mono font-semibold tabular-nums">{fixes}</span> fixes a day, that is roughly{' '}
        <span className="font-mono font-semibold tabular-nums">${lowCost}</span> vs{' '}
        <span className="font-mono font-semibold tabular-nums">${highCost}</span> per developer per day — before anyone
        has shipped a single feature. This is why model routing matters.
      </p>
      <FixesRangeInput fixes={fixes} onChange={setFixes} />
    </div>
  );
}
