import { createPromotionTimeline } from '@/hooks/promotion-timeline';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useEffect, useRef, type RefObject } from 'react';

type Animation = ReturnType<typeof createPromotionTimeline>;
const ANIMATED_VIEW =
  '(min-width: 1024px) and (prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)';

function mountAnimation(element: HTMLElement, animation: RefObject<Animation | null>, draining: RefObject<boolean>) {
  const active = createPromotionTimeline(element);
  animation.current = active;
  active.setDraining(draining.current);
  // Resizing during flight must not strand a word at an obsolete caption position.
  window.addEventListener('resize', active.finish);
  window.addEventListener('beforeprint', active.finish);
  const stopVisibility = watchVisibility(element, active);
  return () => {
    window.removeEventListener('resize', active.finish);
    window.removeEventListener('beforeprint', active.finish);
    stopVisibility();
    active.dispose();
    animation.current = null;
  };
}

function watchVisibility(element: HTMLElement, active: Animation) {
  const update = () => {
    const bounds = element.getBoundingClientRect();
    active.suspend(document.hidden || bounds.bottom <= 0 || bounds.top >= window.innerHeight);
  };
  window.addEventListener('scroll', update, { passive: true });
  document.addEventListener('visibilitychange', update);
  update();
  return () => {
    window.removeEventListener('scroll', update);
    document.removeEventListener('visibilitychange', update);
  };
}

export function usePromotionAnimation(root: RefObject<HTMLElement | null>, draining: boolean) {
  const animation = useRef<Animation | null>(null);
  const desiredDrain = useRef(draining);
  useGSAP(
    () => {
      const element = root.current;
      if (!element) return;
      const media = gsap.matchMedia();
      media.add(ANIMATED_VIEW, () => mountAnimation(element, animation, desiredDrain));
      return () => media.revert();
    },
    { scope: root },
  );
  useEffect(() => {
    desiredDrain.current = draining;
    animation.current?.setDraining(draining);
  }, [draining]);
  return {
    burst: () => animation.current?.burst(),
    finish: () => animation.current?.finish(),
  };
}
