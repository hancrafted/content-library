import type { TransitionStyle } from '@/shared/components/animations/transition-filters';
import type { ComponentType, ReactNode } from 'react';

export type PresentationStyle = Readonly<Record<`--${string}`, string | number>>;

/** Self-contained CSS scope: include local token definitions and theme variants in this class. */
export interface SlideTransition {
  readonly effect: TransitionStyle;
  readonly className?: string;
  readonly style?: PresentationStyle;
}

/** Build-time winner, distinct from the wrapper that retains its rendering surface. */
export interface ResolvedSlideTransition {
  readonly id: string;
  readonly outgoing: string;
  readonly incoming: string;
  readonly declaration: SlideTransition;
  readonly targetSurface: string;
  readonly targetStyle?: PresentationStyle;
}

/** Optional mechanics; Scene JSX and layout remain independent. Colour overrides retain the declared tone's contrast. */
export interface SlidePresentation {
  /** Shared context around retained slots and removable primary content; renders no layout of its own. */
  readonly Provider?: ComponentType<{ children: ReactNode }>;
  readonly enter?: SlideTransition;
  readonly leave?: SlideTransition;
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
