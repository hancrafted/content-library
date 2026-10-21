import { useCallback, useEffect, useRef, type Dispatch, type KeyboardEvent, type RefObject } from 'react';
import type { ViewEvent } from './context-state.pure';
import { revealBubble } from './window-reveal';

/*
 * The parent's side of lighting: the callbacks the parts call, a click outside the parts that unpins, and Escape that
 * clears. Hovering a part lights it and clicking pins it (the parts report it, see use-lighting.ts); lighting is never
 * locked by a Preset.
 */

interface Host {
  readonly hover: string | null;
  readonly pinned: string | null;
  readonly dispatch: Dispatch<ViewEvent>;
  readonly root: RefObject<HTMLElement | null>;
}

/** Unpins when a click lands outside every part, the toolbar and the timeline. */
function useOutsideClick({ pinned, dispatch, root }: Host) {
  const current = useRef(pinned);
  useEffect(() => {
    current.current = pinned;
  }, [pinned]);
  useEffect(() => {
    const outside = (event: globalThis.MouseEvent) => {
      if (!current.current) return;
      const path = event.composedPath().filter((el): el is Element => el instanceof Element);
      const inside = path.some((el) => el.matches('[data-part], [role="toolbar"], input[type="range"]'));
      if (!inside || !path.includes(root.current as Element)) dispatch({ type: 'UNPIN' });
    };
    document.addEventListener('click', outside);
    return () => document.removeEventListener('click', outside);
  }, [dispatch, root]);
}

export function useWindowEvents(host: Host) {
  useOutsideClick(host);
  const { dispatch, root } = host;
  const hover = useRef(host.hover);
  useEffect(() => {
    hover.current = host.hover;
  }, [host.hover]);
  // Stable callbacks: a part that holds them in a memoised item does not redraw because the parent did.
  const onLight = useCallback(
    (key: string | null) => {
      if (key === hover.current) return;
      hover.current = key;
      dispatch(key === null ? { type: 'HOVER_END' } : { type: 'HOVER', part: key });
    },
    [dispatch],
  );
  const onPin = useCallback(
    (part: string, target: EventTarget | null) => {
      dispatch({ type: 'PIN', part });
      revealBubble(root.current, part, target);
    },
    [dispatch, root],
  );
  const onReveal = useCallback((part: string) => revealBubble(root.current, part, null), [root]);
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') dispatch({ type: 'ESC' });
  };
  return { onLight, onPin, onReveal, onKeyDown };
}
