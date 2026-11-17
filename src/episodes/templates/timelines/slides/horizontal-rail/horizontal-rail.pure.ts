/*
 * The horizontal rail's geometry: which side of the line a label sits on and
 * how wide a dot's toggletip grows. No DOM, no React.
 */

import type { PopoverRules, PopoverSide } from '@/shared/lib/popover-placement.pure';

export const RAIL_ITEMS = ['a', 'b', 'c', 'd', 'e', 'f'] as const;

export type RailItem = (typeof RAIL_ITEMS)[number];

export type RailSide = PopoverSide;

export const TOGGLETIP_RULES: PopoverRules = {
  maxWidth: 256,
  gap: 12,
  /** The least room a side needs before a toggletip opens there instead of flipping. */
  minRoom: 120,
};

export function railSide(index: number): RailSide {
  if (!Number.isInteger(index) || index < 0) throw new Error(`${index} is not a position on the rail.`);
  return index % 2 === 0 ? 'above' : 'below';
}
