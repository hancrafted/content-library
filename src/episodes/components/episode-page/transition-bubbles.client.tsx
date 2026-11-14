'use client';

import { useSlideZone } from '@/episodes/hooks/use-slide-zone';
import { edgeEffectShown } from '@/episodes/lib/slide-zone.pure';
import { BubbleRise } from '@/shared/components/animations/bubble-rise';
import { useState } from 'react';

/**
 * The `bubbles` edge's bubbles, drawn by the browser (Iceberg feedback-2 grill, decision 28): from its outgoing
 * Slide's first `active`, just before the edge plays, until the Slide is `far`. The static HTML carries none, so
 * forty bubbles on every Section edge cost the page nothing. It reads the zone the page's one observer reports for
 * the outgoing Slide, whose identity `SlideTransition` provides.
 */
export function TransitionBubbles() {
  const zone = useSlideZone();
  const [shown, setShown] = useState(false);
  const next = edgeEffectShown(shown, zone);
  if (next !== shown) setShown(next);
  return next ? <BubbleRise /> : null;
}
