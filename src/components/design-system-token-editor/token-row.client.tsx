'use client';

import { pickerHexOf } from '@/lib/page-tokens';
import type { Scope } from '@/lib/token-changes.pure';
import { classifyToken, type Theme, type Token } from '@/lib/token-discovery.pure';
import { describeToken } from '@/lib/token-groups.pure';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { TokenColourPicker } from './token-colour-picker.client';
import { TokenUsage } from './token-usage.client';

function Swatch({
  value,
  editable,
  open,
  onToggle,
}: {
  value: string;
  editable: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const look = 'border-border size-8 shrink-0 rounded-md border';
  if (!editable) return <span aria-hidden className={look} style={{ background: value }} />;
  return (
    <button
      type="button"
      aria-label="Pick a colour"
      aria-expanded={open}
      onClick={onToggle}
      className={cn(
        look,
        'focus-visible:ring-ring cursor-pointer outline-none focus-visible:ring-2',
        open && 'ring-ring ring-2',
      )}
      style={{ background: value }}
    />
  );
}

/** The token's name, a dot when changed, what it affects, and its text field. */
function RowText({
  name,
  value,
  changed,
  onChange,
}: {
  name: string;
  value: string;
  changed: boolean;
  onChange: (value: string) => void;
}) {
  const description = describeToken(name);
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="flex items-center gap-2" title={description}>
        <span className={cn('truncate font-mono text-caption', changed && 'font-semibold')}>{name}</span>
        {changed && <span aria-label="changed" className="bg-brand-accent size-1.5 shrink-0 rounded-full" />}
      </span>
      {description && <span className="text-muted-foreground text-caption">{description}</span>}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-input bg-background mt-1 w-full rounded-md border px-2 py-1 font-mono text-caption"
        spellCheck={false}
      />
    </label>
  );
}

interface RowProps {
  scope: Scope;
  token: Token;
  theme: Theme;
  value: string;
  changed: boolean;
  onChange: (value: string) => void;
}

/** One token: a swatch that opens a picker for a colour, and its name, description and text field for the active theme. */
export function TokenRow({ scope, token, theme, value, changed, onChange }: RowProps) {
  const [picking, setPicking] = useState(false);
  const isColour = classifyToken(token.name, token[theme]) === 'colour';
  const pickable = useMemo(() => isColour && pickerHexOf(token[theme]) !== null, [isColour, token, theme]);
  return (
    <li className="flex flex-col gap-2 py-2" data-token={token.name} data-changed={changed}>
      <div className="flex items-start gap-3">
        {isColour && <Swatch value={value} editable={pickable} open={picking} onToggle={() => setPicking((p) => !p)} />}
        <RowText name={token.name} value={value} changed={changed} onChange={onChange} />
      </div>
      {picking && pickable && <TokenColourPicker value={value} original={token[theme]} onChange={onChange} />}
      <TokenUsage scope={scope} token={token} theme={theme} />
    </li>
  );
}
