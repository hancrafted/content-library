import { DocIcon } from '@/explorables/software-ecology/doc-icon-view';
import { GLYPH, ICON } from '@/explorables/software-ecology/factory-glyphs.pure';
import type { StillDoc } from './factory-still-state';

/** A belt document is 12 × 15 units; the still centres it on its point. */
const DOC = { w: 12, h: 15 };

/** One document of the still, as the Explorable draws it, centred on its point. */
export function Doc({ doc, scale = 1 }: { doc: StillDoc; scale?: number }) {
  return (
    <DocIcon
      quality={doc.good ? 'good' : 'bad'}
      mark={doc.warn ? 'warn' : undefined}
      ai={doc.ai}
      x={doc.x - (DOC.w * scale) / 2}
      y={doc.y - (DOC.h * scale) / 2}
      scale={scale}
    />
  );
}

interface GlyphAtProps {
  readonly name: string;
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly className: string;
}

/** One of the Explorable's glyphs, in a box of `size` units at `x`, `y`, stroked in the current colour. */
export function GlyphAt({ name, x, y, size, className }: GlyphAtProps) {
  return (
    <svg
      x={x}
      y={y}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      dangerouslySetInnerHTML={{ __html: GLYPH[name] ?? ICON[name] ?? '' }}
    />
  );
}

/** How the still formats its numbers, in the page locale. */
export interface Formats {
  readonly number: Intl.NumberFormat;
  readonly percent: Intl.NumberFormat;
}

export const formatsOf = (locale: string): Formats => ({
  number: new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }),
  percent: new Intl.NumberFormat(locale, { style: 'percent' }),
});
