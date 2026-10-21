import type { CSSProperties, ReactNode } from 'react';
import { richParts } from './context-format.pure';
import styles from './context.module.css';

/* Small pieces every part of the cornerstone uses: inline markup, the /context glyphs, a colour variable. */

/** A story text with its inline `code` and **bold**. */
export function Rich({ text }: { readonly text: string }): ReactNode {
  return richParts(text).map((part, i) => {
    if (part.kind === 'code')
      return (
        <code key={i} className="font-mono">
          {part.text}
        </code>
      );
    if (part.kind === 'bold')
      return (
        <b key={i} className="font-medium">
          {part.text}
        </b>
      );
    return part.text;
  });
}

/** The colour variable `--k` a block, row or dot takes its tint from. */
export const tint = (token: string, extra: Record<string, string | number> = {}): CSSProperties =>
  ({ '--k': `var(${token})`, ...extra }) as CSSProperties;

/** Custom properties for position and size, which CSS reads as numbers. */
export const vars = (values: Record<string, string | number>): CSSProperties => values as CSSProperties;

export type GlyphKind = 'used' | 'free' | 'buffer';

const GLYPHS: Readonly<Record<GlyphKind, ReactNode>> = {
  used: (
    <g fill="none" stroke="currentColor" strokeWidth="1.3">
      <ellipse cx="8" cy="4.2" rx="5.2" ry="2" fill="currentColor" fillOpacity=".22" />
      <path d="M2.8 4.2v7.6c0 1.1 2.3 2 5.2 2s5.2-.9 5.2-2V4.2" />
      <path d="M2.8 8c0 1.1 2.3 2 5.2 2s5.2-.9 5.2-2" />
    </g>
  ),
  free: (
    <path
      d="M2.5 5.5v-3h3M10.5 2.5h3v3M13.5 10.5v3h-3M5.5 13.5h-3v-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
    />
  ),
  buffer: (
    <g fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="2.5" y="2.5" width="11" height="11" rx="1" />
      <path d="M2.5 2.5l11 11M13.5 2.5l-11 11" />
    </g>
  ),
};

/** A symbol Claude Code's /context draws: a used box, a free one, one kept for the autocompact buffer. */
export function Glyph({ kind }: { readonly kind: GlyphKind }) {
  return (
    <svg className={styles.g} viewBox="0 0 16 16" aria-hidden="true">
      {GLYPHS[kind]}
    </svg>
  );
}
