'use client';

import { useSlideZone } from '@/episodes/hooks/use-slide-zone';
import { loopPlayState } from './grid-bento.pure';

// decision: FE-009 §6
export function GridBentoLoop({ className }: { className: string }) {
  const playState = loopPlayState(useSlideZone());
  return (
    <span aria-hidden data-play-state={playState} className={className} style={{ animationPlayState: playState }} />
  );
}
