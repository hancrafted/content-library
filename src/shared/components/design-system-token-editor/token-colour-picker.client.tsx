'use client';

import { formatLike } from '@/shared/lib/colour-convert.pure';
import { pickerHexOf } from '@/shared/lib/page-tokens';
import { settleValue } from '@/shared/lib/picker-sync.pure';
import { useEffect, useRef, useState } from 'react';
import { HexAlphaColorPicker } from 'react-colorful';

function usePickerHex(value: string, original: string, onChange: (value: string) => void) {
  const [hex, setHex] = useState(() => pickerHexOf(value) ?? '');
  const pending = useRef<readonly string[]>([]);
  const latest = useRef(value);
  useEffect(() => {
    const settled = settleValue(pending.current, value);
    pending.current = settled.pending;
    if (!settled.external) return;
    latest.current = value;
    setHex(pickerHexOf(value) ?? '');
  }, [value]);
  const pick = (next: string) => {
    setHex(next);
    const written = formatLike(original, next);
    if (written === latest.current) return;
    latest.current = written;
    pending.current = [...pending.current, written];
    onChange(written);
  };
  return [hex, pick] as const;
}

export function TokenColourPicker({
  value,
  original,
  onChange,
}: {
  value: string;
  original: string;
  onChange: (value: string) => void;
}) {
  const [hex, pick] = usePickerHex(value, original, onChange);
  return (
    <div className="flex flex-col gap-2" data-testid="token-colour-picker">
      <HexAlphaColorPicker color={hex} onChange={pick} style={{ width: '100%', height: '9rem' }} />
      <output className="text-muted-foreground font-mono text-caption" aria-label="Hex value">
        {hex}
      </output>
    </div>
  );
}
