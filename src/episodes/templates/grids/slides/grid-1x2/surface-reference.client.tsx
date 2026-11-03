'use client';

import { useSlideZone } from '@/episodes/hooks/use-slide-zone';
import { useEffect, useRef } from 'react';

function drift(element: HTMLElement) {
  const duration = getComputedStyle(element).getPropertyValue('--surface-reference-duration').trim() || '8s';
  const milliseconds = Number.parseFloat(duration) * (duration.endsWith('ms') ? 1 : 1000);
  return element.animate(
    [{ transform: 'translateY(0)' }, { transform: 'translateY(var(--surface-reference-displacement, 1rem))' }],
    {
      duration: Number.isFinite(milliseconds) && milliseconds > 0 ? milliseconds : 8000,
      iterations: Infinity,
      direction: 'alternate',
      easing: 'ease-in-out',
    },
  );
}

function followMotion(element: HTMLElement, active: boolean) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let animation: Animation | undefined;
  const update = () => {
    animation?.cancel();
    animation = undefined;
    element.dataset.motion = 'settled';
    if (!active || document.hidden || reduced.matches) return;
    animation = drift(element);
    element.dataset.motion = 'running';
  };
  update();
  document.addEventListener('visibilitychange', update);
  reduced.addEventListener('change', update);
  return () => {
    document.removeEventListener('visibilitychange', update);
    reduced.removeEventListener('change', update);
    animation?.cancel();
    element.dataset.motion = 'settled';
  };
}

/** Retained imperative decoration follows the existing Slide zone, document visibility and reduced-motion preference. */
export function SurfaceReferenceDrift({ className }: { className: string }) {
  const zone = useSlideZone();
  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (element.current) return followMotion(element.current, zone === 'active');
  }, [zone]);
  return <div ref={element} className={className} data-decoration-zone={zone} data-motion="settled" />;
}
