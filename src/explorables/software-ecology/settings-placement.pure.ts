/*
 * Where the Settings popover opens (feature guide, Interaction 3; feedback 08): under the Settings button, its right
 * edge on the button's, up to 720 px wide and kept 8 px inside the window on every side, so it never runs out of view
 * as the old Model menu did. When the room under the button is short, it rises so at least 420 px stay to scroll in.
 * Boxes are viewport coordinates; no DOM.
 */
import type { Rect } from './dash-placement.pure.ts';

export interface SettingsPlace {
  /** Viewport coordinates of the popover's top-left corner. */
  readonly x: number;
  readonly y: number;
  readonly width: number;
  /** It scrolls inside past this. */
  readonly maxHeight: number;
}

/** The widest the popover grows: three columns. */
export const SETTINGS_MAX = 720;
/** The least height it keeps before it rises over the toolbar. */
const ROOM = 420;
const EDGE = 8;
const GAP = 6;

export const placeSettings = (x: {
  readonly button: Rect;
  readonly view: { readonly width: number; readonly height: number };
}): SettingsPlace => {
  const { button: b, view: v } = x;
  const width = Math.min(SETTINGS_MAX, v.width - 2 * EDGE);
  const right = Math.min(b.left + b.width, v.width - EDGE);
  const below = b.top + b.height + GAP;
  const maxHeight = Math.max(v.height - below - EDGE, Math.min(ROOM, v.height - 2 * EDGE));
  return {
    x: Math.max(EDGE, right - width),
    y: Math.min(below, v.height - EDGE - maxHeight),
    width,
    maxHeight,
  };
};
