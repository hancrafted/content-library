'use client';

import { formatLike } from '@/shared/lib/colour-convert.pure';
import { pickerHexOf } from '@/shared/lib/page-tokens';
import { settleValue } from '@/shared/lib/picker-sync.pure';
import { useEffect, useRef, useState } from 'react';
import { HexAlphaColorPicker } from 'react-colorful';

/**
 * The picker's hex and its change handler. The picker works in hex and writes back
 * in the token's own format (`oklch(L C H)` stays oklch). It keeps its own hex while
 * dragged: converting through rounded oklch on every move would nudge the handle.
 * A drag emits faster than React hands the edit back, so the value arriving may be
 * one the picker wrote a moment ago; only a value it never wrote is read back.
 * Taking a stale one for an outside change reset the handle and looped.
 */
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

/** A real colour picker for one token, with an alpha slider and a hex readout. */
export function TokenColourPicker({
  value,
  original,
  onChange,
}: {
  value: string;
  /** The token's declared value, which fixes the format a pick is written in. */
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
