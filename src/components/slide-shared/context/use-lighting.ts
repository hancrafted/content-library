import type { FocusEvent, MouseEvent, PointerEvent } from 'react';
import type { LightingEvents } from './context-parts.types';

/*
 * A part's pointer and focus wiring: hovering or focusing one of its `[data-part]` items lights it, leaving unlights,
 * clicking pins. The part only reports the key up; the parent decides what lighting and pinning do. Lighting is never
 * locked by a Preset.
 */

const hoverCapable = () => window.matchMedia('(hover: hover)').matches;
const partOf = (target: EventTarget | null): string | null =>
  target instanceof Element ? (target.closest('[data-part]')?.getAttribute('data-part') ?? null) : null;
/** A block of the bar or a box of the grid: focusing one lights it, as hovering does. */
const isFocusLight = (target: EventTarget | null) =>
  target instanceof HTMLElement && target.matches('[data-roving] button[data-part]');

export function useLighting({ onLight, onPin }: LightingEvents) {
  return {
    onPointerOver: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType === 'mouse' && hoverCapable()) onLight(partOf(event.target));
    },
    onPointerLeave: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType === 'mouse') onLight(null);
    },
    onClick: (event: MouseEvent<HTMLElement>) => {
      const part = partOf(event.target);
      if (part) onPin(part, event.target);
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      if (isFocusLight(event.target)) onLight(partOf(event.target));
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      if (isFocusLight(event.target)) onLight(null);
    },
  };
}
