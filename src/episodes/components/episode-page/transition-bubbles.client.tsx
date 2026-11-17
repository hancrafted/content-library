'use client';

import { useSlideZone } from '@/episodes/hooks/use-slide-zone';
import { edgeEffectShown } from '@/episodes/lib/slide-zone.pure';
import { BubbleRise } from '@/shared/components/animations/bubble-rise';
import { useState } from 'react';

export function TransitionBubbles() {
  const zone = useSlideZone();
  const [shown, setShown] = useState(false);
  const next = edgeEffectShown(shown, zone);
  if (next !== shown) setShown(next);
  return next ? <BubbleRise /> : null;
}
