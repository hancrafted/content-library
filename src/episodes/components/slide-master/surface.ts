import type { CSSProperties } from 'react';

// decision: docs/decision-records/0030-slide-surface-and-the-inverse-flag.md
export interface Surface {
  readonly background: string;
  readonly foreground: string;
  readonly muted?: string;
  readonly textScope?: 'own' | 'slide';
}

export const SOFT_MIRROR_BACKGROUND = 'color-mix(in oklab, var(--background) 88%, var(--foreground))';

export const SOFT_MIRROR: Surface = {
  background: SOFT_MIRROR_BACKGROUND,
  foreground: 'var(--foreground)',
};

export const SURFACE_MUTED_TEXT = 'text-(--surface-muted,var(--muted-foreground))';

export function surfaceStyle(surface: Surface | undefined): CSSProperties {
  if (!surface) return {};
  const { background, foreground, muted, textScope = 'own' } = surface;
  return {
    '--slide-surface': background,
    '--surface-foreground': foreground,
    ...(muted && { '--surface-muted': muted }),
    ...(textScope === 'slide' && {
      '--foreground': foreground,
      ...(muted && { '--muted-foreground': muted }),
    }),
  } as CSSProperties;
}
