import { Check, ParkedStub, Sparkle } from '@/components/slide-shared/human-in-the-loop/glyphs';
import type { ReactNode } from 'react';

interface LegendProps {
  label: string;
  freshChat: ReactNode;
  checked: string;
  parked: string;
}

/** The legend under the diagram: what the sparkle, the check and the stub mean. */
export function Legend({ label, freshChat, checked, parked }: LegendProps) {
  const entries = [
    { key: 'fresh', glyph: <Sparkle className="size-3.5" />, text: freshChat },
    { key: 'checked', glyph: <Check className="size-3.5" />, text: checked },
    { key: 'parked', glyph: <ParkedStub />, text: parked },
  ];
  return (
    <ul
      aria-label={label}
      className="flex flex-col gap-2 text-caption text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-6"
    >
      {entries.map(({ key, glyph, text }) => (
        <li key={key} className="flex items-center gap-2">
          {glyph}
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}
