import { revealTop } from './window-reveal.pure';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The visible chat bubble of the step a part names, or null (hidden or a category). */
function bubbleOf(root: HTMLElement | null, part: string): HTMLElement | null {
  const bubble = root?.querySelector<HTMLElement>(`[data-role][data-part="${CSS.escape(part.split('@')[0] ?? '')}"]`);
  return bubble && bubble.offsetParent !== null ? bubble : null;
}

/**
 * Scrolls the chat to the bubble of the step a click landed on (a bar block, a zoom row, an Attention row), inside the
 * chat's own scroll box and never the page. A click on a bubble itself is already where it should be.
 */
export function revealBubble(root: HTMLElement | null, part: string, target: EventTarget | null) {
  const bubble = bubbleOf(root, part);
  const box = bubble?.parentElement;
  if (!bubble || !box || (target instanceof Element && target.closest('[data-role]'))) return;
  const b = box.getBoundingClientRect();
  const e = bubble.getBoundingClientRect();
  const top = revealTop({ top: b.top, height: b.height, scrollTop: box.scrollTop }, { top: e.top, height: e.height });
  box.scrollTo({ top, behavior: reducedMotion() ? 'instant' : 'smooth' });
}
