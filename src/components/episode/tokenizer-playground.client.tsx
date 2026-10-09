'use client';

import { useState, type ReactElement } from 'react';
import { calcSessionCost, tokenizeText } from './token-economy-data.pure';

const CHIP_STYLES = [
  'bg-primary/15 border-primary/40 text-primary',
  'bg-info/15 border-info/40 text-info',
  'bg-accent/15 border-accent/40 text-accent',
  'bg-success/15 border-success/40 text-success',
  'bg-warning/15 border-warning/40 text-warning',
] as const;

const MAX_CHIPS = 48;

function TokenChipsList({ tokens }: { tokens: readonly string[] }): ReactElement {
  const visible = tokens.slice(0, MAX_CHIPS);
  const remaining = tokens.length - MAX_CHIPS;

  return (
    <div className="mt-4 flex min-h-[2.5rem] flex-wrap gap-1.5">
      {visible.map((tok, i) => (
        <span
          key={`${tok}-${i}`}
          className={`rounded-md border px-2 py-1 font-mono text-xs font-semibold ${
            CHIP_STYLES[i % CHIP_STYLES.length]
          }`}
        >
          {tok}
        </span>
      ))}
      {remaining > 0 && <span className="px-2 py-1 font-mono text-xs text-base-content/40">+{remaining} more</span>}
    </div>
  );
}

function TokenCostSummary({ count }: { count: number }): ReactElement {
  const cost = calcSessionCost(count, 50, 5);

  return (
    <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 border-t border-base-200 pt-3">
      <span className="text-sm text-base-content/60">
        ≈ <span className="font-mono font-bold tabular-nums text-primary">{count}</span> tokens{' '}
        <span className="text-xs text-base-content/40">(approximate — every model splits differently)</span>
      </span>
      <span className="text-xs text-base-content/50">
        re-sent across a 50-turn agent session ≈{' '}
        <span className="font-mono tabular-nums text-base-content/80">${cost.toFixed(4)}</span> at Opus 4.8 input rates
      </span>
    </div>
  );
}

export function TokenizerPlaygroundClient(): ReactElement {
  const [text, setText] = useState(
    'Insanity is doing the same thing over and over again and expecting different results.',
  );
  const tokens = tokenizeText(text);

  return (
    <div className="rounded-box border border-base-300 bg-base-100 p-5">
      <label htmlFor="s31-input" className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-base-content/50">
        Try it — type anything
      </label>
      <input
        id="s31-input"
        type="text"
        maxLength={140}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a sentence to see what the model sees…"
        className="input input-bordered mt-3 w-full"
      />
      <TokenChipsList tokens={tokens} />
      <TokenCostSummary count={tokens.length} />
    </div>
  );
}
