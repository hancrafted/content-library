import type { TransitionStyle } from '@/shared/components/animations/transition-filters';
import type { ComponentType, ReactNode } from 'react';
import type { Surface } from './surface';

export type PresentationStyle = Readonly<Record<`--${string}`, string | number>>;

export interface SlideTransition {
  readonly effect: TransitionStyle;
  readonly className?: string;
  readonly style?: PresentationStyle;
}

export interface ResolvedSlideTransition {
  readonly id: string;
  readonly outgoing: string;
  readonly incoming: string;
  readonly declaration: SlideTransition;
  readonly targetSurface: string;
  readonly targetInverse?: boolean;
  readonly targetStyle?: PresentationStyle;
}

export interface SlidePresentation {
  readonly Provider?: ComponentType<{ children: ReactNode }>;
  readonly enter?: SlideTransition;
  readonly leave?: SlideTransition;
  readonly inverse?: boolean;
  readonly surface?: Surface;
  readonly rear?: ReactNode;
  readonly rearMobile?: boolean;
  readonly front?: ReactNode;
  readonly style?: Readonly<Record<`--${string}`, string | number>> & {
    '--slide-space-before'?: string;
    '--slide-space-after'?: string;
    '--slide-transition-start-offset'?: string;
    '--slide-transition-end-offset'?: string;
  };
}
