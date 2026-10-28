'use client';

import { useSlideZone } from '@/episodes/hooks/use-slide-zone';
import { loopPlayState } from './grid-bento.pure';

/**
 * The lead tile's decorative gradient layer. The Slide passes the class that carries the drift keyframes; this widget
 * only holds the loop's play state, running while the Slide is `active` and paused in every other zone (FE-009 §6).
 * Reduced motion is the class's job: it drops the animation, leaving the gradient at rest.
 */
export function GridBentoLoop({ className }: { className: string }) {
  const playState = loopPlayState(useSlideZone());
  return (
    <span aria-hidden data-play-state={playState} className={className} style={{ animationPlayState: playState }} />
  );
}
