import {
  useEffect,
  useRef,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
} from 'react';
import type { View } from './context-view';
import { revealBubble } from './window-reveal';

/*
 * The cornerstone's pointer, focus and key wiring on its root: hovering a part lights it, clicking pins it, a click
 * outside the parts unpins, Escape clears. Lighting is never locked by a Preset.
 */

const hoverCapable = () => window.matchMedia('(hover: hover)').matches;
const partOf = (target: EventTarget | null): string | null =>
  target instanceof Element ? (target.closest('[data-part]')?.getAttribute('data-part') ?? null) : null;
/** A block of the bar or a box of the grid: focusing one lights it, as hovering does. */
const isFocusLight = (target: EventTarget | null) =>
  target instanceof HTMLElement && target.matches('[data-roving] button[data-part]');

/** Unpins when a click lands outside every part, the toolbar and the timeline. */
function useOutsideClick(v: View, root: RefObject<HTMLElement | null>) {
  const pinned = useRef(v.state.pinned);
  pinned.current = v.state.pinned;
  const { dispatch } = v;
  useEffect(() => {
    const outside = (event: globalThis.MouseEvent) => {
      if (!pinned.current) return;
      const path = event.composedPath().filter((el): el is Element => el instanceof Element);
      const inside = path.some((el) => el.matches('[data-part], [role="toolbar"], input[type="range"]'));
      if (!inside || !path.includes(root.current as Element)) dispatch({ type: 'UNPIN' });
    };
    document.addEventListener('click', outside);
    return () => document.removeEventListener('click', outside);
  }, [dispatch, root]);
}

/** A click on a part pins it, and shows the chat's bubble for it. */
function usePin(v: View, root: RefObject<HTMLElement | null>) {
  const { dispatch } = v;
  return (target: EventTarget | null) => {
    const part = partOf(target);
    if (!part) return;
    dispatch({ type: 'PIN', part });
    revealBubble(root.current, part, target);
  };
}

export function useWindowEvents(v: View, root: RefObject<HTMLElement | null>) {
  useOutsideClick(v, root);
  const pin = usePin(v, root);
  const { dispatch } = v;
  const hover = v.state.hover;
  return {
    onPointerOver: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType !== 'mouse' || !hoverCapable()) return;
      const part = partOf(event.target);
      if (part && part !== hover) dispatch({ type: 'HOVER', part });
      else if (!part && hover) dispatch({ type: 'HOVER_END' });
    },
    onPointerLeave: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType === 'mouse' && hover) dispatch({ type: 'HOVER_END' });
    },
    onClick: (event: MouseEvent<HTMLElement>) => pin(event.target),
    onFocus: (event: FocusEvent<HTMLElement>) => {
      const part = isFocusLight(event.target) ? partOf(event.target) : null;
      if (part && part !== hover) dispatch({ type: 'HOVER', part });
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      if (isFocusLight(event.target) && hover) dispatch({ type: 'HOVER_END' });
    },
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Escape') dispatch({ type: 'ESC' });
    },
  };
}
