import type { ReactNode } from 'react';

/** Optional mechanics; Scene JSX and layout remain independent. Colour overrides retain the declared tone's contrast. */
export interface SlidePresentation {
  readonly tone?: 'normal' | 'inverse';
  readonly rear?: ReactNode;
  readonly rearMobile?: boolean;
  readonly front?: ReactNode;
  readonly style?: Readonly<Record<`--${string}`, string | number>> & {
    '--slide-surface'?: string;
    '--slide-surface-foreground'?: string;
    '--slide-transition-start-offset'?: string;
    '--slide-transition-end-offset'?: string;
  };
}
