import { revealTop } from './window-reveal.pure';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function bubbleOf(root: HTMLElement | null, part: string): HTMLElement | null {
  const bubble = root?.querySelector<HTMLElement>(`[data-role][data-part="${CSS.escape(part.split('@')[0] ?? '')}"]`);
  return bubble && bubble.offsetParent !== null ? bubble : null;
}

export function revealBubble(root: HTMLElement | null, part: string, target: EventTarget | null) {
  const bubble = bubbleOf(root, part);
  const box = bubble?.parentElement;
  if (!bubble || !box || (target instanceof Element && target.closest('[data-role]'))) return;
  const b = box.getBoundingClientRect();
  const e = bubble.getBoundingClientRect();
  const top = revealTop({ top: b.top, height: b.height, scrollTop: box.scrollTop }, { top: e.top, height: e.height });
  box.scrollTo({ top, behavior: reducedMotion() ? 'instant' : 'smooth' });
}
