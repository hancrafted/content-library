import { GLYPH, ICON } from './factory-glyphs.pure.ts';

/** One glyph or icon in a 24-unit box, stroked in the current colour; decorative. */
export function Glyph({ name, className }: { readonly name: string; readonly className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: ICON[name] ?? GLYPH[name] ?? '' }}
    />
  );
}
