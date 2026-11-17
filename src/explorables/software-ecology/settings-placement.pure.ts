// spec: docs/features/explorables/software-ecology.md#interaction
import type { Rect } from './dash-placement.pure.ts';

export interface SettingsPlace {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly maxHeight: number;
}

export const SETTINGS_MAX_WIDTH_PIXELS = 760;
const MINIMUM_ROOM_HEIGHT_PIXELS = 420;
const EDGE = 8;
const GAP = 6;

export const placeSettings = (x: {
  readonly button: Rect;
  readonly view: { readonly width: number; readonly height: number };
}): SettingsPlace => {
  const { button: b, view: v } = x;
  const width = Math.min(SETTINGS_MAX_WIDTH_PIXELS, v.width - 2 * EDGE);
  const right = Math.min(b.left + b.width, v.width - EDGE);
  const below = b.top + b.height + GAP;
  const maxHeight = Math.max(v.height - below - EDGE, Math.min(MINIMUM_ROOM_HEIGHT_PIXELS, v.height - 2 * EDGE));
  return {
    x: Math.max(EDGE, right - width),
    y: Math.min(below, v.height - EDGE - maxHeight),
    width,
    maxHeight,
  };
};
