'use client';

import { formatLike } from '@/lib/colour-convert.pure';
import { pickerHexOf } from '@/lib/page-tokens';
import { useEffect, useRef, useState } from 'react';
import { HexAlphaColorPicker, HexColorPicker } from 'react-colorful';

/**
 * The picker's hex and its change handler. The picker works in hex and writes back
 * in the token's own format (`oklch(L C H)` stays oklch). It keeps its own hex
 * while dragged: converting through rounded oklch on every move would nudge the
 * handle, so the token is re-read only when its value changed from outside.
 */
function usePickerHex(value: string, original: string, onChange: (value: string) => void) {
  const [hex, setHex] = useState(pickerHexOf(value) ?? '');
  const emitted = useRef(value);
  useEffect(() => {
    if (value === emitted.current) return;
    emitted.current = value;
    setHex(pickerHexOf(value) ?? '');
  }, [value]);
  const pick = (next: string) => {
    emitted.current = formatLike(original, next);
    setHex(next);
    onChange(emitted.current);
  };
  return [hex, pick] as const;
}

/** A real colour picker for one token, with a hex readout. */
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
  // Alpha only where the declared colour has some (a border at 10%), so a plain colour stays a plain picker.
  const Picker = (pickerHexOf(original) ?? '').length === 9 ? HexAlphaColorPicker : HexColorPicker;
  return (
    <div className="flex flex-col gap-2" data-testid="token-colour-picker">
      <Picker color={hex} onChange={pick} style={{ width: '100%', height: '9rem' }} />
      <output className="text-muted-foreground font-mono text-caption" aria-label="Hex value">
        {hex}
      </output>
    </div>
  );
}
