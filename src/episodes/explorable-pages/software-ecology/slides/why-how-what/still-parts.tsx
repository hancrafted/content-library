import { DocIcon } from '@/explorables/software-ecology/doc-icon-view';
import { GLYPH, ICON } from '@/explorables/software-ecology/factory-glyphs.pure';
import type { StillDoc } from '@/explorables/software-ecology/stills.pure';

const DOC = { w: 12, h: 15 };

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

export interface Formats {
  readonly number: Intl.NumberFormat;
  readonly percent: Intl.NumberFormat;
}

export const formatsOf = (locale: string): Formats => ({
  number: new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }),
  percent: new Intl.NumberFormat(locale, { style: 'percent' }),
});
