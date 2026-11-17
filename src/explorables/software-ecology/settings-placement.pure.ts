// spec: docs/features/explorables/software-ecology.md#interaction
import type { Rect } from './dash-placement.pure.ts';

export interface SettingsPlace {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly maxHeight: number;
}

/** The widest the popover grows: two columns of about 360 px. */
export const SETTINGS_MAX = 760;
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
