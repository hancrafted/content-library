'use client';

import { cn } from '@/lib/utils';
import { classifyToken, type Theme, type Token } from './token-discovery.pure';

function Swatch({ value }: { value: string }) {
  return <span aria-hidden className="border-border size-5 shrink-0 rounded-sm border" style={{ background: value }} />;
}

/** One token: a swatch for a colour, its name, and a text field holding the active theme's value. */
export function TokenRow({
  token,
  theme,
  value,
  changed,
  onChange,
}: {
  token: Token;
  theme: Theme;
  value: string;
  changed: boolean;
  onChange: (value: string) => void;
}) {
  const isColour = classifyToken(token.name, token[theme]) === 'colour';
  return (
    <li className="flex items-center gap-2 text-sm" data-token={token.name} data-changed={changed}>
      {isColour && <Swatch value={value} />}
      <label className="flex min-w-0 flex-1 flex-col">
        <span className={cn('truncate font-mono text-xs', changed && 'font-semibold')}>{token.name}</span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="border-input bg-background w-full rounded-md border px-2 py-1 font-mono text-xs"
          spellCheck={false}
        />
      </label>
    </li>
  );
}
